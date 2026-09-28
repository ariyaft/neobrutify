/**
 * Brutalist.js — Neo-Brutalism Placeholder Image Generator
 * Generates SVG-based neo-brutalist geometric compositions.
 *
 * @version 1.0.0
 * @license MIT
 *
 * Features:
 *  - Thick black borders, hard offset shadows (zero blur)
 *  - Flat, high-saturation color palettes
 *  - Bold geometric shapes: rectangles, circles, lines, zigzags
 *  - Optional bold text overlays
 *  - Configurable dimensions, palette, density, and seed
 *  - SVG output, exportable to PNG
 *  - Zero CSS injected — no global styles, no :root pollution
 *
 * Usage:
 *   const svg = brutalist({ width: 800, height: 600 });
 *   document.body.appendChild(svg);
 *
 *   // or render to a canvas for PNG export
 *   brutalist.toCanvas({ width: 800, height: 600 }).then(canvas => { ... });
 */

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory);
  } else {
    // Browser global
    root.brutalist = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── Instance counter for unique SVG-internal IDs ──────────
  var _instanceCounter = 0;

  // ── Palettes ──────────────────────────────────────────────
  var PALETTES = {
    gumroad: {
      name: 'Gumroad',
      bg: '#FFFDF5',
      colors: ['#FF6B6B', '#FFD23F', '#74B9FF', '#88D498', '#FFA552', '#B8A9FA'],
      stroke: '#000000',
      shadow: '#000000',
    },
    sunset: {
      name: 'Sunset',
      bg: '#FFF5E6',
      colors: ['#FF4D6D', '#FF6F3C', '#FFD93D', '#C9184A', '#FF8FA3', '#FFB703'],
      stroke: '#1A1A1A',
      shadow: '#1A1A1A',
    },
    ocean: {
      name: 'Ocean',
      bg: '#EBF5FF',
      colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#48CAE4', '#023E8A'],
      stroke: '#001233',
      shadow: '#001233',
    },
    neon: {
      name: 'Neon',
      bg: '#0D0D0D',
      colors: ['#39FF14', '#FF073A', '#FFE600', '#FF6EC7', '#00FFFF', '#B026FF'],
      stroke: '#FFFFFF',
      shadow: '#FFFFFF',
    },
    retro: {
      name: 'Retro',
      bg: '#F5F0E1',
      colors: ['#E63946', '#457B9D', '#F4A261', '#2A9D8F', '#264653', '#E9C46A'],
      stroke: '#1D3557',
      shadow: '#1D3557',
    },
    candy: {
      name: 'Candy',
      bg: '#FFF0F5',
      colors: ['#FF69B4', '#9B59B6', '#3498DB', '#1ABC9C', '#F1C40F', '#E74C3C'],
      stroke: '#2C3E50',
      shadow: '#2C3E50',
    },
    forest: {
      name: 'Forest',
      bg: '#F0F7F4',
      colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#D8F3DC', '#1B4332'],
      stroke: '#081C15',
      shadow: '#081C15',
    },
    mono: {
      name: 'Monochrome',
      bg: '#FFFFFF',
      colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#E0E0E0'],
      stroke: '#000000',
      shadow: '#000000',
    },
  };

  // ── Seeded PRNG (Mulberry32) ──────────────────────────────
  function mulberry32(seed) {
    var s = seed | 0;
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // ── SVG Helpers ───────────────────────────────────────────
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function createSVGElement(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        el.setAttribute(key, attrs[key]);
      }
    }
    return el;
  }

  // ── Shape Generators ──────────────────────────────────────

  function createRect(x, y, w, h, fill, strokeColor, strokeWidth, shadowOffset, shadowColor) {
    var g = createSVGElement('g', {});

    // Hard shadow
    if (shadowOffset > 0) {
      g.appendChild(createSVGElement('rect', {
        x: x + shadowOffset,
        y: y + shadowOffset,
        width: w,
        height: h,
        fill: shadowColor,
        stroke: 'none',
      }));
    }

    // Main rect
    g.appendChild(createSVGElement('rect', {
      x: x, y: y,
      width: w,
      height: h,
      fill: fill,
      stroke: strokeColor,
      'stroke-width': strokeWidth,
    }));

    return g;
  }

  function createCircle(cx, cy, r, fill, strokeColor, strokeWidth, shadowOffset, shadowColor) {
    var g = createSVGElement('g', {});

    if (shadowOffset > 0) {
      g.appendChild(createSVGElement('circle', {
        cx: cx + shadowOffset,
        cy: cy + shadowOffset,
        r: r,
        fill: shadowColor,
        stroke: 'none',
      }));
    }

    g.appendChild(createSVGElement('circle', {
      cx: cx, cy: cy, r: r,
      fill: fill,
      stroke: strokeColor,
      'stroke-width': strokeWidth,
    }));

    return g;
  }

  function createLine(x1, y1, x2, y2, strokeColor, strokeWidth) {
    return createSVGElement('line', {
      x1: x1, y1: y1, x2: x2, y2: y2,
      stroke: strokeColor,
      'stroke-width': strokeWidth,
      'stroke-linecap': 'square',
    });
  }

  function createZigzag(x, y, width, height, strokeColor, strokeWidth, segments) {
    var segW = width / segments;
    var points = x + ',' + (y + height);
    for (var i = 0; i < segments; i++) {
      var px = x + segW * i + segW / 2;
      var py = y;
      points += ' ' + px + ',' + py;
      var px2 = x + segW * (i + 1);
      var py2 = y + height;
      points += ' ' + px2 + ',' + py2;
    }
    return createSVGElement('polyline', {
      points: points,
      fill: 'none',
      stroke: strokeColor,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'miter',
      'stroke-linecap': 'square',
    });
  }

  function createCross(cx, cy, size, strokeColor, strokeWidth) {
    var g = createSVGElement('g', {});
    g.appendChild(createLine(cx - size, cy, cx + size, cy, strokeColor, strokeWidth));
    g.appendChild(createLine(cx, cy - size, cx, cy + size, strokeColor, strokeWidth));
    return g;
  }

  function createDiagonalLines(x, y, w, h, strokeColor, strokeWidth, spacing, instanceId) {
    var g = createSVGElement('g', {});
    var clipId = 'brutalist-' + instanceId + '-clip-' + Math.round(x) + '-' + Math.round(y);
    var clip = createSVGElement('clipPath', { id: clipId });
    clip.appendChild(createSVGElement('rect', { x: x, y: y, width: w, height: h }));
    g.appendChild(clip);

    var lineGroup = createSVGElement('g', { 'clip-path': 'url(#' + clipId + ')' });

    for (var i = -h; i < w + h; i += spacing) {
      lineGroup.appendChild(createSVGElement('line', {
        x1: x + i,
        y1: y,
        x2: x + i - h,
        y2: y + h,
        stroke: strokeColor,
        'stroke-width': strokeWidth,
      }));
    }
    g.appendChild(lineGroup);
    return g;
  }

  function createDots(x, y, w, h, fill, dotRadius, spacing) {
    var g = createSVGElement('g', {});
    for (var dx = dotRadius + 2; dx < w - dotRadius; dx += spacing) {
      for (var dy = dotRadius + 2; dy < h - dotRadius; dy += spacing) {
        g.appendChild(createSVGElement('circle', {
          cx: x + dx,
          cy: y + dy,
          r: dotRadius,
          fill: fill,
        }));
      }
    }
    return g;
  }

  function createTriangle(cx, cy, size, fill, strokeColor, strokeWidth, shadowOffset, shadowColor) {
    var g = createSVGElement('g', {});
    var h = size * Math.sqrt(3) / 2;
    var points = cx + ',' + (cy - h * 2 / 3) + ' ' + (cx - size / 2) + ',' + (cy + h / 3) + ' ' + (cx + size / 2) + ',' + (cy + h / 3);

    if (shadowOffset > 0) {
      var shadowPoints = (cx + shadowOffset) + ',' + (cy - h * 2 / 3 + shadowOffset) + ' ' + (cx - size / 2 + shadowOffset) + ',' + (cy + h / 3 + shadowOffset) + ' ' + (cx + size / 2 + shadowOffset) + ',' + (cy + h / 3 + shadowOffset);
      g.appendChild(createSVGElement('polygon', {
        points: shadowPoints,
        fill: shadowColor,
        stroke: 'none',
      }));
    }

    g.appendChild(createSVGElement('polygon', {
      points: points,
      fill: fill,
      stroke: strokeColor,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'miter',
    }));

    return g;
  }

  // ── Text Overlay ──────────────────────────────────────────

  function calculateFontSize(text, maxW, maxH) {
    // Approximate width-to-height ratio for bold display fonts (Syne/Archivo)
    var charWidthFactor = 0.65; 
    var maxFontSizeByWidth = maxW / (Math.max(1, text.length) * charWidthFactor);
    var maxFontSizeByHeight = maxH * 0.8; // Cap height to 80% of available space
    return Math.min(maxFontSizeByWidth, maxFontSizeByHeight);
  }

  function createTextOverlay(text, x, y, fontSize, fill, strokeColor, strokeWidth, fontFamily) {
    var g = createSVGElement('g', {});

    // Shadow text
    var shadowText = createSVGElement('text', {
      x: x + 4,
      y: y + 4,
      'font-size': fontSize,
      'font-family': fontFamily,
      'font-weight': '900',
      fill: strokeColor,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    });
    shadowText.textContent = text;
    g.appendChild(shadowText);

    // Main text
    var mainText = createSVGElement('text', {
      x: x, y: y,
      'font-size': fontSize,
      'font-family': fontFamily,
      'font-weight': '900',
      fill: fill,
      stroke: strokeColor,
      'stroke-width': strokeWidth,
      'paint-order': 'stroke',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    });
    mainText.textContent = text;
    g.appendChild(mainText);

    return g;
  }

  // ── Golden Ratio constant ─────────────────────────────────
  var PHI = 1.618033988749895;
  var PHI_INV = 1 / PHI; // ≈ 0.618

  // ══════════════════════════════════════════════════════════
  //  COMPOSITION MODE: MONDRIAN (BSP Recursive Subdivision)
  // ══════════════════════════════════════════════════════════

  function generateMondrian(svg, opts, rng, instanceId) {
    var width = opts.width;
    var height = opts.height;
    var palette = opts.palette;
    var borderWidth = opts.borderWidth;
    var shadowOffset = opts.shadowOffset;
    var density = opts.density;
    var showText = opts.showText;
    var textContent = opts.textContent;
    var colors = palette.colors;
    var pick = function () { return colors[Math.floor(rng() * colors.length)]; };
    var range = function (min, max) { return rng() * (max - min) + min; };

    // Background
    svg.appendChild(createSVGElement('rect', {
      x: 0, y: 0, width: width, height: height, fill: palette.bg,
    }));

    // Minimum cell size based on density (lower density = larger minimum)
    var minDimension = Math.min(width, height);
    var minCellSize = minDimension / (density * 3 + 2);

    // BSP recursive subdivision
    var regions = [];

    function subdivide(x, y, w, h, depth) {
      // Stop conditions: too small, too deep, or random chance
      var maxDepth = Math.floor(density * 2) + 3;
      if (depth >= maxDepth || w < minCellSize * 1.5 || h < minCellSize * 1.5) {
        regions.push({ x: x, y: y, w: w, h: h, depth: depth });
        return;
      }

      // Random chance to stop (increases with depth)
      var stopChance = depth / (maxDepth + 2);
      if (rng() < stopChance) {
        regions.push({ x: x, y: y, w: w, h: h, depth: depth });
        return;
      }

      // Choose split direction: prefer splitting the longer axis
      var splitVertical;
      if (w > h * 1.3) {
        splitVertical = true;
      } else if (h > w * 1.3) {
        splitVertical = false;
      } else {
        splitVertical = rng() > 0.5;
      }

      // Golden-ratio-biased split position
      var splitRatio;
      var ratioChoice = rng();
      if (ratioChoice < 0.4) {
        splitRatio = PHI_INV; // ≈ 0.618
      } else if (ratioChoice < 0.7) {
        splitRatio = 1 - PHI_INV; // ≈ 0.382
      } else {
        // Small random variation around golden ratio
        splitRatio = PHI_INV + range(-0.1, 0.1);
      }
      splitRatio = Math.max(0.25, Math.min(0.75, splitRatio));

      if (splitVertical) {
        var splitX = w * splitRatio;
        if (splitX < minCellSize || w - splitX < minCellSize) {
          regions.push({ x: x, y: y, w: w, h: h, depth: depth });
          return;
        }
        subdivide(x, y, splitX, h, depth + 1);
        subdivide(x + splitX, y, w - splitX, h, depth + 1);
      } else {
        var splitY = h * splitRatio;
        if (splitY < minCellSize || h - splitY < minCellSize) {
          regions.push({ x: x, y: y, w: w, h: h, depth: depth });
          return;
        }
        subdivide(x, y, w, splitY, depth + 1);
        subdivide(x, y + splitY, w, h - splitY, depth + 1);
      }
    }

    subdivide(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2, 0);

    // Determine which regions get color vs background
    // Neo-brutalism: most regions colored, some left as bg for breathing room
    var coloredIndices = [];
    for (var i = 0; i < regions.length; i++) {
      // Larger regions more likely to get color
      var area = regions[i].w * regions[i].h;
      var totalArea = width * height;
      var colorChance = 0.55 + (area / totalArea) * 0.3;
      if (rng() < colorChance) {
        coloredIndices.push(i);
      }
    }

    // Draw regions
    for (var r = 0; r < regions.length; r++) {
      var reg = regions[r];
      var isColored = coloredIndices.indexOf(r) !== -1;
      var fillColor = isColored ? pick() : palette.bg;

      // Shadow for colored regions
      var sw = isColored ? shadowOffset * range(0.4, 0.8) : 0;
      svg.appendChild(createRect(
        reg.x, reg.y, reg.w, reg.h,
        fillColor, palette.stroke, borderWidth, sw, palette.shadow
      ));

      // Add inner decoration to some colored regions
      if (isColored && rng() > 0.7) {
        var decorType = rng();
        if (decorType < 0.4) {
          // Dots
          svg.appendChild(createDots(reg.x, reg.y, reg.w, reg.h, palette.stroke, 2.5, Math.max(8, Math.floor(Math.min(reg.w, reg.h) / 6))));
        } else if (decorType < 0.7) {
          // Diagonal lines
          svg.appendChild(createDiagonalLines(reg.x, reg.y, reg.w, reg.h, palette.stroke, 2, Math.max(6, Math.floor(Math.min(reg.w, reg.h) / 8)), instanceId));
        } else {
          // Circle inside
          var cr = Math.min(reg.w, reg.h) * 0.35;
          svg.appendChild(createCircle(reg.x + reg.w / 2, reg.y + reg.h / 2, cr, palette.bg, palette.stroke, borderWidth, 0, palette.shadow));
        }
      }
    }

    // Add accent crosses at some grid intersections
    var crossCount = Math.floor(rng() * 4) + 1;
    for (var c = 0; c < crossCount; c++) {
      var cr2 = regions[Math.floor(rng() * regions.length)];
      var crossSize = Math.min(cr2.w, cr2.h) * 0.15;
      svg.appendChild(createCross(cr2.x + cr2.w / 2, cr2.y + cr2.h / 2, crossSize, palette.stroke, borderWidth));
    }

    // Optional text overlay
    if (showText && textContent) {
      // Place text in the largest region
      var largestIdx = 0;
      var largestArea = 0;
      for (var li = 0; li < regions.length; li++) {
        var la = regions[li].w * regions[li].h;
        if (la > largestArea) { largestArea = la; largestIdx = li; }
      }
      var lr = regions[largestIdx];
      var fontSize = calculateFontSize(textContent, lr.w * 0.9, lr.h * 0.7);
      svg.appendChild(createTextOverlay(
        textContent,
        lr.x + lr.w / 2, lr.y + lr.h / 2,
        fontSize, pick(), palette.stroke, borderWidth * 0.5,
        "'Syne', 'Archivo Black', 'Bebas Neue', 'Impact', sans-serif"
      ));
    }

    // Outer frame
    svg.appendChild(createSVGElement('rect', {
      x: borderWidth / 2, y: borderWidth / 2,
      width: width - borderWidth, height: height - borderWidth,
      fill: 'none', stroke: palette.stroke, 'stroke-width': borderWidth,
    }));
  }

  // ══════════════════════════════════════════════════════════
  //  COMPOSITION MODE: POSTER (Golden Ratio Focal + Bands)
  // ══════════════════════════════════════════════════════════

  function generatePoster(svg, opts, rng, instanceId) {
    var width = opts.width;
    var height = opts.height;
    var palette = opts.palette;
    var borderWidth = opts.borderWidth;
    var shadowOffset = opts.shadowOffset;
    var density = opts.density;
    var showText = opts.showText;
    var textContent = opts.textContent;
    var colors = palette.colors;
    var pick = function () { return colors[Math.floor(rng() * colors.length)]; };
    var rangeInt = function (min, max) { return Math.floor(rng() * (max - min + 1)) + min; };
    var range = function (min, max) { return rng() * (max - min) + min; };

    var pad = borderWidth * 2;

    // Background
    svg.appendChild(createSVGElement('rect', {
      x: 0, y: 0, width: width, height: height, fill: palette.bg,
    }));

    // Background dot pattern (subtle)
    if (rng() > 0.3) {
      var bgDots = createSVGElement('g', { opacity: '0.1' });
      bgDots.appendChild(createDots(0, 0, width, height, palette.stroke, 1.5, rangeInt(18, 30)));
      svg.appendChild(bgDots);
    }

    // Golden ratio division points
    var gx1 = width * (1 - PHI_INV);   // ≈ 38.2%
    var gx2 = width * PHI_INV;          // ≈ 61.8%
    var gy1 = height * (1 - PHI_INV);
    var gy2 = height * PHI_INV;

    // ── Band layout: divide into 3 horizontal bands ──
    // Top band: header / accent strip
    // Middle band: hero content (largest)
    // Bottom band: footer / small elements

    var bandSplitY1 = gy1 * range(0.6, 1.0); // Top band boundary
    var bandSplitY2 = gy2 + (height - gy2) * range(0.2, 0.5); // Bottom band boundary

    // ── TOP BAND: Accent strip ──
    var topBandColor = pick();
    svg.appendChild(createRect(
      pad, pad,
      width - pad * 2, bandSplitY1 - pad,
      topBandColor, palette.stroke, borderWidth, shadowOffset * 0.5, palette.shadow
    ));

    // Add zigzag or decoration in top band
    if (rng() > 0.5 && bandSplitY1 > 40) {
      svg.appendChild(createZigzag(
        pad + 10, pad + (bandSplitY1 - pad) * 0.2,
        width - pad * 2 - 20, (bandSplitY1 - pad) * 0.6,
        palette.stroke, borderWidth * 0.8, rangeInt(6, 14)
      ));
    }

    // ── MIDDLE BAND: Hero focal area ──
    var midY = bandSplitY1;
    var midH = bandSplitY2 - bandSplitY1;

    // Decide hero layout: focal element on left or right (golden ratio split)
    var heroOnLeft = rng() > 0.5;
    var heroX, heroW, sideX, sideW;
    if (heroOnLeft) {
      heroX = pad;
      heroW = gx2 - pad * 2;
      sideX = gx2;
      sideW = width - gx2 - pad;
    } else {
      sideX = pad;
      sideW = gx1 - pad;
      heroX = gx1;
      heroW = width - gx1 - pad;
    }

    // Hero element — large primary shape
    var heroColor = pick();
    var heroShapeType = rng();
    if (heroShapeType < 0.5) {
      // Large rectangle
      svg.appendChild(createRect(
        heroX, midY + pad, heroW, midH - pad * 2,
        heroColor, palette.stroke, borderWidth, shadowOffset, palette.shadow
      ));
      // Inner decoration
      if (rng() > 0.5) {
        var innerMargin = Math.min(heroW, midH) * 0.15;
        svg.appendChild(createRect(
          heroX + innerMargin, midY + pad + innerMargin,
          heroW - innerMargin * 2, midH - pad * 2 - innerMargin * 2,
          palette.bg, palette.stroke, borderWidth, 0, palette.shadow
        ));
      }
    } else if (heroShapeType < 0.8) {
      // Large circle
      var heroR = Math.min(heroW, midH - pad * 2) * 0.42;
      svg.appendChild(createRect(
        heroX, midY + pad, heroW, midH - pad * 2,
        palette.bg, palette.stroke, borderWidth, 0, palette.shadow
      ));
      svg.appendChild(createCircle(
        heroX + heroW / 2, midY + midH / 2,
        heroR, heroColor, palette.stroke, borderWidth, shadowOffset, palette.shadow
      ));
    } else {
      // Large triangle
      svg.appendChild(createRect(
        heroX, midY + pad, heroW, midH - pad * 2,
        palette.bg, palette.stroke, borderWidth, 0, palette.shadow
      ));
      var triSize = Math.min(heroW, midH - pad * 2) * 0.7;
      svg.appendChild(createTriangle(
        heroX + heroW / 2, midY + midH / 2,
        triSize, heroColor, palette.stroke, borderWidth, shadowOffset, palette.shadow
      ));
    }

    // Side panel — split into 2-3 secondary elements
    var sideSplits = rangeInt(2, 3);
    var sideSlotH = (midH - pad * 2) / sideSplits;
    for (var s = 0; s < sideSplits; s++) {
      var slotY = midY + pad + s * sideSlotH;
      var slotH = sideSlotH - (s < sideSplits - 1 ? pad : 0);
      var slotColor = pick();
      var slotType = rng();

      if (slotType < 0.6) {
        // Colored rectangle
        svg.appendChild(createRect(
          sideX, slotY, sideW, slotH,
          slotColor, palette.stroke, borderWidth, shadowOffset * 0.6, palette.shadow
        ));
        // Sometimes add dots
        if (rng() > 0.6) {
          svg.appendChild(createDots(sideX, slotY, sideW, slotH, palette.stroke, 2, rangeInt(8, 14)));
        }
      } else if (slotType < 0.85) {
        // Circle in box
        svg.appendChild(createRect(
          sideX, slotY, sideW, slotH,
          palette.bg, palette.stroke, borderWidth, 0, palette.shadow
        ));
        var sr = Math.min(sideW, slotH) * 0.35;
        svg.appendChild(createCircle(
          sideX + sideW / 2, slotY + slotH / 2,
          sr, slotColor, palette.stroke, borderWidth, shadowOffset * 0.5, palette.shadow
        ));
      } else {
        // Cross pattern
        svg.appendChild(createRect(
          sideX, slotY, sideW, slotH,
          slotColor, palette.stroke, borderWidth, shadowOffset * 0.4, palette.shadow
        ));
        var crossSz = Math.min(sideW, slotH) * 0.25;
        svg.appendChild(createCross(sideX + sideW / 2, slotY + slotH / 2, crossSz, palette.stroke, borderWidth * 1.5));
      }
    }

    // ── BOTTOM BAND: Small elements strip ──
    var botY = bandSplitY2;
    var botH = height - bandSplitY2 - pad;

    if (botH > 30) {
      // Split bottom into small equal columns
      var botCols = rangeInt(3, Math.floor(density) + 3);
      var botColW = (width - pad * 2) / botCols;
      for (var bc = 0; bc < botCols; bc++) {
        var bcX = pad + bc * botColW;
        var bcColor = (rng() > 0.4) ? pick() : palette.bg;
        svg.appendChild(createRect(
          bcX, botY, botColW, botH,
          bcColor, palette.stroke, borderWidth,
          (bcColor !== palette.bg) ? shadowOffset * 0.3 : 0, palette.shadow
        ));
      }
    }

    // ── Accent lines across composition ──
    var accentCount = rangeInt(1, 3);
    for (var a = 0; a < accentCount; a++) {
      if (rng() > 0.5) {
        var ly = range(height * 0.15, height * 0.85);
        svg.appendChild(createLine(0, ly, width, ly, palette.stroke, borderWidth * range(0.3, 1)));
      } else {
        var lx = range(width * 0.15, width * 0.85);
        svg.appendChild(createLine(lx, 0, lx, height, palette.stroke, borderWidth * range(0.3, 1)));
      }
    }

    // Optional text overlay — placed in the hero area
    if (showText && textContent) {
      var fontSize = calculateFontSize(textContent, heroW * 0.9, midH * 0.7);
      svg.appendChild(createTextOverlay(
        textContent,
        heroX + heroW / 2, midY + midH / 2,
        fontSize, pick(), palette.stroke, borderWidth * 0.5,
        "'Syne', 'Archivo Black', 'Bebas Neue', 'Impact', sans-serif"
      ));
    }

    // Outer frame
    svg.appendChild(createSVGElement('rect', {
      x: borderWidth / 2, y: borderWidth / 2,
      width: width - borderWidth, height: height - borderWidth,
      fill: 'none', stroke: palette.stroke, 'stroke-width': borderWidth,
    }));
  }

  // ══════════════════════════════════════════════════════════
  //  COMPOSITION MODE: RANDOM (Original grid-random)
  // ══════════════════════════════════════════════════════════

  function generateRandom(svg, opts, rng, instanceId) {
    var width = opts.width;
    var height = opts.height;
    var palette = opts.palette;
    var borderWidth = opts.borderWidth;
    var shadowOffset = opts.shadowOffset;
    var density = opts.density;
    var showText = opts.showText;
    var textContent = opts.textContent;
    var colors = palette.colors;
    var pick = function () { return colors[Math.floor(rng() * colors.length)]; };
    var rangeInt = function (min, max) { return Math.floor(rng() * (max - min + 1)) + min; };
    var range = function (min, max) { return rng() * (max - min) + min; };

    // Background
    svg.appendChild(createSVGElement('rect', {
      x: 0, y: 0,
      width: width,
      height: height,
      fill: palette.bg,
    }));

    // Divide canvas into a grid
    var cols = Math.max(2, Math.round(density * 4));
    var rows = Math.max(2, Math.round(density * 3));
    var cellW = width / cols;
    var cellH = height / rows;
    var margin = Math.min(cellW, cellH) * 0.1;

    // Create decorative background elements first
    var bgDecorations = createSVGElement('g', { opacity: '0.15' });

    // Dot pattern background
    if (rng() > 0.4) {
      var dotSpacing = rangeInt(16, 32);
      bgDecorations.appendChild(createDots(0, 0, width, height, palette.stroke, 2, dotSpacing));
    }

    // Random diagonal lines in background
    if (rng() > 0.5) {
      var bx = range(0, width * 0.3);
      var by = range(0, height * 0.3);
      var bw = range(width * 0.3, width * 0.7);
      var bh = range(height * 0.3, height * 0.7);
      bgDecorations.appendChild(createDiagonalLines(bx, by, bw, bh, palette.stroke, 1.5, rangeInt(8, 16), instanceId));
    }

    svg.appendChild(bgDecorations);

    // Thick border lines — grid lines
    var gridLines = createSVGElement('g', { opacity: '0.08' });
    var c, r;
    for (c = 1; c < cols; c++) {
      if (rng() > 0.5) {
        gridLines.appendChild(createLine(c * cellW, 0, c * cellW, height, palette.stroke, 1));
      }
    }
    for (r = 1; r < rows; r++) {
      if (rng() > 0.5) {
        gridLines.appendChild(createLine(0, r * cellH, width, r * cellH, palette.stroke, 1));
      }
    }
    svg.appendChild(gridLines);

    // Main shapes layer
    var shapesGroup = createSVGElement('g', {});
    var shapeCount = rangeInt(
      Math.max(3, Math.floor(density * 5)),
      Math.max(6, Math.floor(density * 12))
    );

    // Generate shapes
    var i, col, row, spanCols, spanRows, x, y, w, h, shapeType, color, sw;
    for (i = 0; i < shapeCount; i++) {
      // Pick a grid cell or span multiple cells
      col = rangeInt(0, cols - 1);
      row = rangeInt(0, rows - 1);
      spanCols = rangeInt(1, Math.min(2, cols - col));
      spanRows = rangeInt(1, Math.min(2, rows - row));

      x = col * cellW + margin;
      y = row * cellH + margin;
      w = spanCols * cellW - margin * 2;
      h = spanRows * cellH - margin * 2;

      shapeType = rng();
      color = pick();
      sw = shadowOffset * range(0.6, 1.4);

      if (shapeType < 0.35) {
        // Rectangle
        shapesGroup.appendChild(createRect(x, y, w, h, color, palette.stroke, borderWidth, sw, palette.shadow));
        // Sometimes add inner pattern
        if (rng() > 0.65) {
          if (rng() > 0.5) {
            shapesGroup.appendChild(createDots(x, y, w, h, palette.stroke, 2.5, rangeInt(10, 20)));
          } else {
            shapesGroup.appendChild(createDiagonalLines(x, y, w, h, palette.stroke, 2, rangeInt(8, 14), instanceId));
          }
        }
      } else if (shapeType < 0.55) {
        // Circle
        var cr = Math.min(w, h) / 2 * range(0.5, 0.95);
        shapesGroup.appendChild(createCircle(x + w / 2, y + h / 2, cr, color, palette.stroke, borderWidth, sw, palette.shadow));
      } else if (shapeType < 0.7) {
        // Triangle
        var size = Math.min(w, h) * range(0.6, 0.9);
        shapesGroup.appendChild(createTriangle(x + w / 2, y + h / 2, size, color, palette.stroke, borderWidth, sw, palette.shadow));
      } else if (shapeType < 0.8) {
        // Cross
        var crossSize = Math.min(w, h) * 0.3;
        shapesGroup.appendChild(createCross(x + w / 2, y + h / 2, crossSize, palette.stroke, borderWidth * 1.5));
      } else if (shapeType < 0.9) {
        // Zigzag
        shapesGroup.appendChild(createZigzag(x, y + h * 0.3, w, h * 0.4, palette.stroke, borderWidth, rangeInt(3, 8)));
        // Add a colored rect behind it
        shapesGroup.insertBefore(
          createRect(x, y, w, h, color, palette.stroke, borderWidth, sw * 0.5, palette.shadow),
          shapesGroup.lastChild
        );
      } else {
        // Small bar / accent block
        var barH = h * range(0.15, 0.35);
        var barY = y + range(0, h - barH);
        shapesGroup.appendChild(createRect(x, barY, w, barH, color, palette.stroke, borderWidth, sw, palette.shadow));
      }
    }

    svg.appendChild(shapesGroup);

    // Decorative accent lines
    var accentsGroup = createSVGElement('g', {});
    var accentCount = rangeInt(2, 6);
    for (i = 0; i < accentCount; i++) {
      if (rng() > 0.5) {
        // Horizontal line
        var ly = range(height * 0.1, height * 0.9);
        var lx1 = range(0, width * 0.3);
        var lx2 = range(width * 0.5, width);
        accentsGroup.appendChild(createLine(lx1, ly, lx2, ly, palette.stroke, borderWidth * range(0.5, 2)));
      } else {
        // Vertical line
        var lx = range(width * 0.1, width * 0.9);
        var ly1 = range(0, height * 0.3);
        var ly2 = range(height * 0.5, height);
        accentsGroup.appendChild(createLine(lx, ly1, lx, ly2, palette.stroke, borderWidth * range(0.5, 1.5)));
      }
    }
    svg.appendChild(accentsGroup);

    // Optional text overlay
    if (showText && textContent) {
      var fontSize = calculateFontSize(textContent, width * 0.8, height * 0.4);
      var textColor = pick();
      var tx = width / 2 + range(-width * 0.1, width * 0.1);
      var ty = height / 2 + range(-height * 0.1, height * 0.1);
      svg.appendChild(createTextOverlay(
        textContent,
        tx, ty,
        fontSize,
        textColor,
        palette.stroke,
        borderWidth * 0.5,
        "'Syne', 'Archivo Black', 'Bebas Neue', 'Impact', sans-serif"
      ));
    }

    // Full border frame
    svg.appendChild(createSVGElement('rect', {
      x: borderWidth / 2,
      y: borderWidth / 2,
      width: width - borderWidth,
      height: height - borderWidth,
      fill: 'none',
      stroke: palette.stroke,
      'stroke-width': borderWidth,
    }));
  }

  // ── WeakMap for storing options without polluting DOM ──────
  var _optionsMap = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

  // ── Main API ──────────────────────────────────────────────

  function brutalist(options) {
    var defaults = {
      width: 800,
      height: 600,
      palette: 'gumroad',
      composition: 'mondrian', // 'random' | 'mondrian' | 'poster'
      borderWidth: 3,
      shadowOffset: 6,
      density: 2,         // 1 (sparse) — 5 (dense)
      seed: null,
      showText: false,
      textContent: 'BRUT',
    };

    var opts = {};
    var key;
    for (key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        opts[key] = (options && options.hasOwnProperty(key)) ? options[key] : defaults[key];
      }
    }

    // Resolve palette
    if (typeof opts.palette === 'string') {
      opts.palette = PALETTES[opts.palette] || PALETTES.gumroad;
    }

    // Resolve seed
    var seedNum;
    if (opts.seed === null || opts.seed === undefined) {
      seedNum = Math.floor(Math.random() * 2147483647);
    } else if (typeof opts.seed === 'string') {
      seedNum = hashString(opts.seed);
    } else {
      seedNum = opts.seed;
    }
    var rng = mulberry32(seedNum);

    // Unique instance ID for SVG-internal IDs (clipPaths, etc.)
    var instanceId = (_instanceCounter++) + '-' + seedNum;

    // Create SVG
    var svg = createSVGElement('svg', {
      xmlns: SVG_NS,
      viewBox: '0 0 ' + opts.width + ' ' + opts.height,
      width: opts.width,
      height: opts.height,
      'shape-rendering': 'crispEdges',
      'data-brutalist-seed': seedNum,
    });

    // Route to the selected composition engine
    var compositionMap = {
      'mondrian': generateMondrian,
      'poster': generatePoster,
      'random': generateRandom,
    };
    var composeFn = compositionMap[opts.composition] || generateMondrian;
    composeFn(svg, opts, rng, instanceId);

    // Store metadata safely
    if (_optionsMap) {
      _optionsMap.set(svg, { opts: opts, seed: seedNum });
    }
    // Also set data attribute for easy access
    svg.setAttribute('data-brutalist-seed', seedNum);

    return svg;
  }

  // ── Metadata Access ───────────────────────────────────────

  /**
   * Retrieve the options used to generate an SVG element.
   * @param {SVGElement} svgElement — An SVG element returned by brutalist()
   * @returns {{ opts: Object, seed: number } | null}
   */
  brutalist.getOptions = function (svgElement) {
    if (_optionsMap) {
      return _optionsMap.get(svgElement) || null;
    }
    return null;
  };

  /**
   * Retrieve the seed from an SVG element.
   * @param {SVGElement} svgElement
   * @returns {number | null}
   */
  brutalist.getSeed = function (svgElement) {
    var attr = svgElement.getAttribute('data-brutalist-seed');
    return attr ? parseInt(attr, 10) : null;
  };

  // ── Export Helpers ─────────────────────────────────────────

  /**
   * Serialize SVG element to a data URL.
   */
  brutalist.toSVGDataURL = function (svgElement) {
    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgElement);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  };

  /**
   * Serialize SVG element to an SVG string.
   */
  brutalist.toSVGString = function (svgElement) {
    var serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  };

  /**
   * Render to canvas and return a Promise<HTMLCanvasElement>.
   */
  brutalist.toCanvas = function (options, scale) {
    scale = scale || 1;
    var svg = brutalist(options);
    var width = options.width || 800;
    var height = options.height || 600;

    return new Promise(function (resolve, reject) {
      var canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      var ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      var img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = brutalist.toSVGDataURL(svg);
    });
  };

  /**
   * Download as PNG.
   */
  brutalist.downloadPNG = function (options, filename, scale) {
    filename = filename || 'brutalist.png';
    scale = scale || 2;
    return brutalist.toCanvas(options, scale).then(function (canvas) {
      var link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  /**
   * Download as SVG file.
   */
  brutalist.downloadSVG = function (svgElement, filename) {
    filename = filename || 'brutalist.svg';
    var svgString = brutalist.toSVGString(svgElement);
    var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    var link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 5000);
  };

  // ── Expose Palettes ───────────────────────────────────────
  brutalist.palettes = PALETTES;

  // ── Version ───────────────────────────────────────────────
  brutalist.version = '1.0.0';

  return brutalist;
}));
