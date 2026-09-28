/**
 * Brutalist.js — Neo-Brutalism Placeholder Image Generator
 *
 * Type declarations for TypeScript consumers.
 */

declare interface BrutalistPalette {
  name: string;
  bg: string;
  colors: string[];
  stroke: string;
  shadow: string;
}

declare interface BrutalistOptions {
  /** Image width in pixels (default: 800) */
  width?: number;
  /** Image height in pixels (default: 600) */
  height?: number;
  /** Palette name or custom palette object (default: 'gumroad') */
  palette?: string | BrutalistPalette;
  /** Composition algorithm to use (default: 'mondrian') */
  composition?: 'mondrian' | 'poster' | 'random';
  /** Stroke width in pixels (default: 3) */
  borderWidth?: number;
  /** Hard shadow offset in pixels (default: 6) */
  shadowOffset?: number;
  /** Shape density, 1 (sparse) to 5 (dense) (default: 2) */
  density?: number;
  /** Seed for reproducible output (string, number, or null for random) */
  seed?: string | number | null;
  /** Whether to show text overlay (default: false) */
  showText?: boolean;
  /** Text content for overlay (default: 'BRUT') */
  textContent?: string;
}

declare interface BrutalistMetadata {
  opts: BrutalistOptions;
  seed: number;
}

/**
 * Generate a neo-brutalist SVG image.
 */
declare function brutalist(options?: BrutalistOptions): SVGSVGElement;

declare namespace brutalist {
  /** Available color palettes */
  const palettes: Record<string, BrutalistPalette>;

  /** Library version */
  const version: string;

  /** Retrieve options used to generate an SVG element */
  function getOptions(svgElement: SVGSVGElement): BrutalistMetadata | null;

  /** Retrieve the seed from an SVG element's data attribute */
  function getSeed(svgElement: SVGSVGElement): number | null;

  /** Serialize SVG element to a data URL */
  function toSVGDataURL(svgElement: SVGSVGElement): string;

  /** Serialize SVG element to an SVG string */
  function toSVGString(svgElement: SVGSVGElement): string;

  /** Render to canvas (returns a Promise) */
  function toCanvas(options: BrutalistOptions, scale?: number): Promise<HTMLCanvasElement>;

  /** Download as PNG file */
  function downloadPNG(options: BrutalistOptions, filename?: string, scale?: number): Promise<void>;

  /** Download as SVG file */
  function downloadSVG(svgElement: SVGSVGElement, filename?: string): void;
}

export = brutalist;
export as namespace brutalist;
