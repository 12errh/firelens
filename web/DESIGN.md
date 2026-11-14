# DESIGN.md — Flame in Freefall

Source of truth for the interface. Values here are binding; code tokens must match.

## Direction

**A quiet lab notebook, not mission control.**

The product is a scientific evidence workbench. It should read like a well-set
technical report: paper-white surfaces, ink-black type, hairline rules, generous
space, and one warm accent reserved for the flame and the primary action. The
data is the spectacle; the interface recedes.

Anti-qualities: neon, scanlines, faux telemetry, all-caps labels, tiny mono
text, decorative grids, gradient glows, card shadows, drop caps, numbered
section markers, "AI dashboard" chrome.

## Mode

Operate + Read. The visitor completes a task (find, compare, understand
evidence) and reads explanations. Precision and legibility outrank expression.

## Color

| Token | Value | Role |
| --- | --- | --- |
| canvas | `#F7F7F4` | page ground, warm neutral not cream |
| panel | `#FFFFFF` | cards, tables, inputs |
| panel-2 | `#F0F0EA` | subtle fill, hover, selected row |
| line | `#E3E2DA` | hairline borders |
| line-strong | `#C9C8BE` | focus-adjacent, active borders |
| ink | `#181814` | primary text |
| muted | `#5F5F57` | secondary text |
| faint | `#8B8A80` | tertiary metadata |
| flame | `#C2410C` | accent, primary action, solid fuel |
| flame-deep | `#9A3412` | pressed / hover dark |
| ice | `#0E7490` | liquid fuel |
| violet | `#6D28D9` | gas fuel |
| moss | `#4D7C0F` | verified / snapshot status |
| danger | `#B91C1C` | errors |

Color is never the only carrier of meaning. Phase always has a text label.

## Type

- UI and prose: **IBM Plex Sans** (fallback system-ui). Technical, legible,
  not a reflex startup face.
- Numbers, accession IDs, units: **IBM Plex Mono**.
- No uppercase labels. No letter-spacing tricks. Sentence case everywhere.

Scale:

| Role | Size / line-height | Weight |
| --- | --- | --- |
| display | 56–64 / 1.04 | 500 |
| h1 | 40 / 1.08 | 500 |
| h2 | 28 / 1.2 | 500 |
| h3 | 18 / 1.4 | 500 |
| body | 16 / 1.65 | 400 |
| small | 14 / 1.55 | 400 |
| meta | 12.5 / 1.5 | 400 |
| numeric | 30–34 / 1 | 500, tabular |

Body measure: 62–72 characters. Headings: 20–28 characters per line at display size.

## Space and shape

- Container: 1200px, 24px gutters (mobile), 40px (desktop).
- Section rhythm: 80px mobile, 112px desktop.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 112.
- Radius: 4px controls, 8px cards, 999px pills only for status.
- Borders: 1px `line`. No shadows. No gradients except a photo legibility scrim.
- Focus: 2px flame outline, 2px offset, always visible.

## Components

- **Button:** 40px tall, 16px horizontal padding, 14px medium, sentence case.
  Primary = flame fill, white text. Secondary = white fill, 1px line.
- **Badge:** 12px, sentence case, 1px border, tinted background, 999px pill.
- **Panel:** white, 1px line, 8px radius, 24–32px padding.
- **Rule:** hairline only; never a heavy divider.
- **Table:** 14px, 44px rows, header in 12.5px muted, no zebra.
- **Input:** 44px, white, 1px line, flame focus ring.

## Motion

150–200ms, standard ease-out. Press feedback on every control. One 400ms
opacity-only entrance for the hero, nothing else. Reduced motion removes
transforms and entrances but keeps state feedback.

## Layout

- Desktop: 12-column grid, content max 1200. Hero text 5/12, image 7/12.
- Evidence pages: reading column max 760 for prose, full width for data.
- Mobile: single column, 24px gutters, no horizontal scroll except the
  evidence map, which gets a dedicated compact layout.
