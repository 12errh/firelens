/**
 * Visual constants mirrored from the CSS custom properties in
 * `app/globals.css`. SVG presentation attributes cannot reliably resolve
 * `var()`, so charts, legends and swatches read the palette from here.
 * Keep this file and the token block in sync — `DESIGN.md` is the source
 * of truth for both.
 */

/*
 * Phase colours resolve through CSS custom properties so a phase swatch or
 * bar stays legible when the theme flips. All current call sites apply these
 * to DOM `style` props, where `var()` is supported.
 */
export const PHASE_COLOR: Record<string, string> = {
  solid: "var(--phase-solid)",
  liquid: "var(--phase-liquid)",
  gas: "var(--phase-gas)",
  aerosol: "var(--phase-aerosol)",
};

export const PHASE_FALLBACK = PHASE_COLOR.aerosol;

export const INK = "#181814";
export const MUTED = "#5f5f57";
export const FAINT = "#8b8a80";
export const FLAME = "#c2410c";
export const CANVAS = "#f7f7f4";
export const PANEL_2 = "#f0f0ea";
