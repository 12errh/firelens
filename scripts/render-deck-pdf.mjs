// Render the project deck to a 7-page landscape PDF for upload.
import { pathToFileURL } from "node:url";
import path from "node:path";

const playwrightPath =
  process.env.PLAYWRIGHT_CORE ??
  path.resolve(
    process.cwd(),
    "brag-output/work/node_modules/playwright-core/index.mjs",
  );
const { chromium } = await import(pathToFileURL(playwrightPath).href);

const deckPath = path.resolve(process.argv[2] ?? "deck/index.html");
const outPath = path.resolve(process.argv[3] ?? "deck/flame-in-freefall.pdf");

const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ??
    `${process.env.HOME}/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.goto(pathToFileURL(deckPath).href, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// Make every slide visible for printing, then paginate them.
await page.addStyleTag({
  content: `
    html, body { height: auto !important; }
    .stage { position: static !important; display: block !important; }
    .deck { width: 1280px !important; height: auto !important; transform: none !important; box-shadow: none !important; }
    .slide, .slide.split {
      display: flex !important;
      position: relative !important;
      inset: auto !important;
      width: 1280px !important;
      height: 720px !important;
      page-break-after: always !important;
      break-after: page !important;
      overflow: hidden !important;
    }
    .slide:last-child { page-break-after: auto !important; break-after: auto !important; }
    .nav, .progress { display: none !important; }
  `,
});

await page.pdf({
  path: outPath,
  width: "13.333in",
  height: "7.5in",
  printBackground: true,
  pageRanges: "1-7",
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

await browser.close();
console.log(`wrote ${outPath}`);
