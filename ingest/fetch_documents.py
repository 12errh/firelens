#!/usr/bin/env python3
"""
Download the PSI report corpus and turn it into retrievable passages.

Pipeline:
  1. For every Combustion Science investigation, read the public file tree.
  2. Resolve a presigned S3 URL for each Reports / Science Documents file.
  3. Download and extract text (PDF page by page, DOCX paragraph by paragraph).
  4. Split the text into overlapping passages that keep page provenance.
  5. Write the corpus to web/data/rag_corpus.json.

Nothing is summarized or rewritten here. Passages are verbatim excerpts so the
assistant can quote the source and cite a page number.

Usage:
  python ingest/fetch_documents.py --out web/data/rag_corpus.json
  python ingest/fetch_documents.py --limit 2 --max-mb 60   # quick trial
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Iterable

PSI_SEARCH = (
    "https://psi.nasa.gov/geode-py/ws/repo/search"
    "?ffield=Research%20Area&fvalue=Combustion%20Science&size=50&from=0"
)
DETAIL_URL = "https://psi.nasa.gov/geode-py/ws/repo/investigations/{acc}"
TREE_URL = "https://psi.nasa.gov/geode-py/ws/files/v2"
DOWNLOAD_URL = "https://psi.nasa.gov/geode-py/ws/studies/{acc}/download"

WANTED_CATEGORIES = {"Reports", "Science Documents"}
TEXT_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".htm", ".html"}

# Passage shape. Long enough to carry a claim plus its qualifier, short
# enough that five passages fit in a model context without drowning it.
CHARS_PER_PASSAGE = 1100
CHARS_OVERLAP = 180
MAX_PASSAGES_PER_DOC = 40
MAX_PAGES_PER_DOC = 90

USER_AGENT = "FlameInFreefall/1.0 (NASA Space Apps 2026; educational, non-commercial)"


def http_get(url: str, timeout: int = 60, binary: bool = False) -> bytes | str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        payload = response.read()
    if binary:
        return payload
    return payload.decode("utf-8", errors="replace")


def http_post_json(url: str, body: dict[str, Any], timeout: int = 60) -> dict[str, Any]:
    data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": USER_AGENT},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8", errors="replace"))


def list_investigations() -> list[dict[str, Any]]:
    payload = json.loads(http_get(PSI_SEARCH))
    if isinstance(payload, dict):
        hits = payload.get("hits")
        if isinstance(hits, dict):
            payload = hits.get("hits") or []
        else:
            for key in ("results", "investigations", "items"):
                if isinstance(payload.get(key), list):
                    payload = payload[key]
                    break
    if not isinstance(payload, list):
        raise RuntimeError("Unexpected PSI search payload shape")
    return payload


def accession_of(record: dict[str, Any]) -> str | None:
    source = record.get("_source") if isinstance(record.get("_source"), dict) else record
    for key in ("Accession", "accession", "accessionId", "id", "studyId"):
        value = source.get(key)
        if isinstance(value, str) and value.upper().startswith("PSI-"):
            return value.upper()
    return None


def study_version(acc: str) -> int:
    detail = json.loads(http_get(DETAIL_URL.format(acc=acc)))
    version = detail.get("version")
    return int(version) if isinstance(version, (int, float)) else 1


def walk_files(nodes: Iterable[dict[str, Any]]) -> Iterable[dict[str, Any]]:
    for node in nodes:
        yield node
        children = node.get("files")
        if isinstance(children, list):
            yield from walk_files(children)


def document_leaves(acc: str, version: int) -> list[dict[str, Any]]:
    tree = http_post_json(
        TREE_URL,
        {
            "folder": f"{acc}/",
            "fileType": "study",
            "studyId": acc,
            "version": version,
            "obfuscationcode": "",
        },
    )
    leaves: list[dict[str, Any]] = []
    for node in walk_files(tree.get("files") or []):
        category = node.get("sortingCategory")
        if category not in WANTED_CATEGORIES:
            continue
        if node.get("directory"):
            continue
        key = node.get("key") or ""
        if not key:
            continue
        leaves.append(
            {
                "key": key,
                "fileName": key.rsplit("/", 1)[-1],
                "category": "Report" if category == "Reports" else "Science document",
                "version": int(node.get("version") or version),
                "sizeBytes": int(node.get("bytes_size") or 0),
            }
        )
    return leaves


def resolve_download_url(acc: str, file_name: str, version: int) -> str | None:
    query = urllib.parse.urlencode(
        {"file": file_name, "version": version, "redirect": "false"}
    )
    url = f"{DOWNLOAD_URL.format(acc=acc)}?{query}"
    try:
        text = http_get(url).strip()
    except Exception:
        return None
    if not text.startswith("http"):
        return None
    return text


def clean_text(text: str) -> str:
    text = text.replace("\u00a0", " ").replace("\uf0b7", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf(path: Path) -> list[tuple[int, str]]:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    pages: list[tuple[int, str]] = []
    for index, page in enumerate(reader.pages[:MAX_PAGES_PER_DOC]):
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        text = clean_text(text)
        if text:
            pages.append((index + 1, text))
    return pages


def extract_docx(path: Path) -> list[tuple[int, str]]:
    import docx  # python-docx

    document = docx.Document(str(path))
    blocks = [p.text for p in document.paragraphs if p.text and p.text.strip()]
    for table in document.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text and c.text.strip()]
            if cells:
                blocks.append(" | ".join(cells))
    text = clean_text("\n".join(blocks))
    return [(1, text)] if text else []


def extract_plain(path: Path) -> list[tuple[int, str]]:
    text = clean_text(path.read_text(encoding="utf-8", errors="replace"))
    return [(1, text)] if text else []


def extract(path: Path) -> list[tuple[int, str]]:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return extract_pdf(path)
    if suffix == ".docx":
        return extract_docx(path)
    if suffix in {".txt", ".md"}:
        return extract_plain(path)
    if suffix in {".htm", ".html"}:
        raw = path.read_text(encoding="utf-8", errors="replace")
        raw = re.sub(r"<script.*?</script>", " ", raw, flags=re.S | re.I)
        raw = re.sub(r"<style.*?</style>", " ", raw, flags=re.S | re.I)
        raw = re.sub(r"<[^>]+>", " ", raw)
        text = clean_text(raw)
        return [(1, text)] if text else []
    return []


def chunk_pages(pages: list[tuple[int, str]]) -> list[dict[str, Any]]:
    passages: list[dict[str, Any]] = []
    for page_number, page_text in pages:
        if len(page_text) <= CHARS_PER_PASSAGE:
            passages.append({"page": page_number, "text": page_text})
            continue
        start = 0
        while start < len(page_text):
            end = min(start + CHARS_PER_PASSAGE, len(page_text))
            piece = page_text[start:end].strip()
            if piece:
                passages.append({"page": page_number, "text": piece})
            if end >= len(page_text):
                break
            start = end - CHARS_OVERLAP
    return passages[:MAX_PASSAGES_PER_DOC]


def tidy_title(file_name: str, acc: str) -> str:
    name = urllib.parse.unquote(file_name)
    name = re.sub(r"^PSI-\d+[_ ]", "", name)
    name = re.sub(r"^(Reports|Science Documents|Engineering Documents)[_ ]", "", name, flags=re.I)
    name = re.sub(r"\.(pdf|docx?|pptx?|xlsx?)$", "", name, flags=re.I)
    name = name.replace("_", " ").replace("  ", " ").strip(" .-")
    return name or f"{acc} document"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="web/data/rag_corpus.json")
    parser.add_argument("--cache", default="ingest/cache/docs")
    parser.add_argument("--limit", type=int, default=0, help="only N investigations")
    parser.add_argument("--max-mb", type=float, default=80.0, help="skip larger files")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    cache = Path(args.cache)
    cache.mkdir(parents=True, exist_ok=True)

    records = list_investigations()
    accessions: list[str] = []
    for record in records:
        acc = accession_of(record)
        if acc and acc not in accessions:
            accessions.append(acc)
    accessions.sort()
    if args.limit:
        accessions = accessions[: args.limit]
    print(f"[fetch] {len(accessions)} investigations")

    documents: list[dict[str, Any]] = []
    passages: list[dict[str, Any]] = []

    for index, acc in enumerate(accessions, start=1):
        try:
            version = study_version(acc)
            leaves = document_leaves(acc, version)
        except Exception as error:  # noqa: BLE001
            print(f"[{index}/{len(accessions)}] {acc}: tree failed ({error})")
            continue

        print(f"[{index}/{len(accessions)}] {acc}: {len(leaves)} documents")
        for leaf in leaves:
            suffix = Path(leaf["fileName"]).suffix.lower()
            if suffix not in TEXT_EXTENSIONS:
                continue
            if leaf["sizeBytes"] > args.max_mb * 1024 * 1024:
                print(f"    skip (too large): {leaf['fileName']}")
                continue

            local = cache / acc / leaf["fileName"]
            if not local.exists() or local.stat().st_size == 0:
                signed = resolve_download_url(acc, leaf["fileName"], leaf["version"])
                if not signed:
                    print(f"    no signed url: {leaf['fileName']}")
                    continue
                local.parent.mkdir(parents=True, exist_ok=True)
                try:
                    payload = http_get(signed, timeout=180, binary=True)
                except Exception as error:  # noqa: BLE001
                    print(f"    download failed: {leaf['fileName']} ({error})")
                    continue
                local.write_bytes(payload)
                time.sleep(0.2)

            if args.dry_run:
                print(f"    ok (dry): {leaf['fileName']} {local.stat().st_size}")
                continue

            try:
                pages = extract(local)
            except Exception as error:  # noqa: BLE001
                print(f"    extract failed: {leaf['fileName']} ({error})")
                continue
            if not pages:
                print(f"    no text: {leaf['fileName']}")
                continue

            doc_id = f"{acc}::{leaf['fileName']}"
            title = tidy_title(leaf["fileName"], acc)
            doc_passages = chunk_pages(pages)
            doc = {
                "id": doc_id,
                "investigationId": acc,
                "title": title,
                "fileName": leaf["fileName"],
                "category": leaf["category"],
                "pages": max(page for page, _ in pages),
                "passageCount": len(doc_passages),
                "sourceUrl": (
                    "https://psi.nasa.gov/physci/repo/search?q=" + acc
                ),
            }
            documents.append(doc)
            for order, passage in enumerate(doc_passages):
                passages.append(
                    {
                        "id": f"{doc_id}::p{passage['page']}::{order}",
                        "docId": doc_id,
                        "investigationId": acc,
                        "title": title,
                        "category": leaf["category"],
                        "page": passage["page"],
                        "text": passage["text"],
                    }
                )
            print(f"    {leaf['fileName']}: {len(doc_passages)} passages")

    if args.dry_run:
        print("[fetch] dry run complete")
        return

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(
            {
                "snapshotDate": "2026-11-14",
                "source": "NASA Physical Sciences Informatics (PSI)",
                "documents": documents,
                "passages": passages,
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # Counts only, so a static page can show corpus size without bundling the
    # passage text into the browser.
    stats_path = out_path.with_name("rag_stats.json")
    stats_path.write_text(
        json.dumps(
            {
                "snapshotDate": "2026-11-14",
                "source": "NASA Physical Sciences Informatics (PSI)",
                "documents": len(documents),
                "passages": len(passages),
                "characters": sum(len(p["text"]) for p in passages),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(
        f"[fetch] wrote {len(documents)} documents / {len(passages)} passages -> {out_path}"
    )
    print(f"[fetch] wrote counts -> {stats_path}")


if __name__ == "__main__":
    main()
