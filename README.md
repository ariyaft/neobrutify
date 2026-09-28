# Brutalist.js

> Algorithmically generated neo-brutalist placeholder images.

Thick borders. Hard shadows. Flat vivid colors. Bold geometric compositions. Zero dependencies. Zero CSS injected.

Inspired by [Trianglify](https://github.com/qrohlf/trianglify) and [Neubrutalism](https://neubrutalism.com).

## Features

- 🎨 **8 built-in palettes** — Gumroad, Sunset, Ocean, Neon, Retro, Candy, Forest, Mono
- 🎲 **Seeded RNG** — Same seed = same image, every time
- 📐 **SVG output** — Infinitely scalable, tiny file size
- 📸 **PNG export** — Download at 2x resolution
- ✏️ **Text overlays** — Optional bold text with hard shadow
- 🔧 **Fully configurable** — Width, height, density, border, shadow, palette
- 📦 **Zero dependencies** — Single file, ~7KB
- 🛡️ **Zero global CSS** — No `:root` variables, no style injection, no side effects

## Install

```bash
npm install brutalist-svg
```

Or include via `<script>` tag:

```html
<script src="brutalist.js"></script>
```

## Quick Start

```js
// CommonJS
const brutalist = require('brutalist-svg');

// Browser global
// <script src="brutalist.js"></script>
// brutalist is available globally

const svg = brutalist({
  width: 800,
  height: 600,
  palette: 'gumroad',
});

document.body.appendChild(svg);
```

## API

### `brutalist(options)`

Returns an `SVGSVGElement`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | `800` | Image width (px) |
| `height` | `number` | `600` | Image height (px) |
| `palette` | `string \| object` | `'gumroad'` | Palette name or custom palette |
| `borderWidth` | `number` | `3` | Stroke width (px) |
| `shadowOffset` | `number` | `6` | Hard shadow offset (px) |
| `density` | `number` | `2` | Shape density, 1–5 |
| `seed` | `string \| number \| null` | `null` | Seed for reproducibility |
| `showText` | `boolean` | `false` | Show text overlay |
| `textContent` | `string` | `'BRUT'` | Overlay text |

### Export Methods

```js
// Get SVG as string
const svgString = brutalist.toSVGString(svg);

// Get SVG as data URL
const dataUrl = brutalist.toSVGDataURL(svg);

// Render to canvas (Promise)
const canvas = await brutalist.toCanvas({ width: 800, height: 600 }, 2);

// Download as PNG
brutalist.downloadPNG({ width: 800, height: 600 }, 'image.png', 2);

// Download as SVG
brutalist.downloadSVG(svg, 'image.svg');
```

### Metadata

```js
// Get the seed used
const seed = brutalist.getSeed(svg);

// Get full options (via WeakMap, no DOM pollution)
const meta = brutalist.getOptions(svg);
```

### Custom Palette

```js
const svg = brutalist({
  palette: {
    name: 'Custom',
    bg: '#FAFAFA',
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    stroke: '#000000',
    shadow: '#000000',
  },
});
```

### Available Palettes

`gumroad` · `sunset` · `ocean` · `neon` · `retro` · `candy` · `forest` · `mono`

```js
// List all palettes
console.log(Object.keys(brutalist.palettes));
```

## Design Safety

This library is designed to be safe for npm consumers:

- **Zero CSS injected** — No `:root` custom properties, no global resets, no style tags
- **Zero global pollution** — Uses UMD wrapper; no global variables beyond `brutalist` (when loaded via `<script>`)
- **Namespaced SVG IDs** — All internal `clipPath` IDs are prefixed with `brutalist-{instanceId}` to avoid collisions
- **No DOM property pollution** — Metadata stored via `WeakMap` and `data-*` attributes, not expando properties

## Demo

```bash
npm run demo
```

Opens the interactive demo at `http://localhost:3000`.

## License

MIT
