// Runs inside a rendered page and returns a JSON object listing measurable visual faults; no network, no page changes.
(() => {
  const MIN_FONT_PX = 12;
  const MIN_TAP_PX = 24;
  const MAX_LISTED = 25;
  const vw = document.documentElement.clientWidth;
  const faults = { horizontalOverflow: [], clippedText: [], overlappingText: [], lowContrast: [], smallText: [], imagesWithoutAlt: [], brokenImages: [], smallTapTargets: [], layoutShift: null };
  const notMeasured = ["consoleErrors (read the browser tool console log instead)"];

  const describe = (el) => {
    const id = el.id ? "#" + el.id : "";
    const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    return el.tagName.toLowerCase() + id + cls;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0;
  };
  const parseColor = (text) => {
    const m = text.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const blendOver = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
    a: 1,
  });
  const luminance = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const contrastRatio = (a, b) => {
    const l1 = luminance(a), l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  // Walks up the tree to find the colour behind the text; returns null when an image or gradient is behind it.
  const backgroundBehind = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== "none") return null;
      const c = parseColor(s.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = blendOver(layers[i], base);
    return base;
  };
  const ownText = (el) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);

  const all = Array.from(document.body.querySelectorAll("*"));
  const textEls = all.filter((el) => ownText(el) && visible(el) && !["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName));

  // Horizontal overflow: the page, then elements poking past the right edge.
  const pageScrollWidth = document.documentElement.scrollWidth;
  if (pageScrollWidth > vw + 1) faults.horizontalOverflow.push({ what: "page wider than viewport", viewport: vw, scrollWidth: pageScrollWidth });
  for (const el of all) {
    if (faults.horizontalOverflow.length >= MAX_LISTED) break;
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && getComputedStyle(el).position !== "fixed") faults.horizontalOverflow.push({ el: describe(el), right: Math.round(r.right), viewport: vw });
  }

  // Clipped text and text below the size floor and contrast.
  for (const el of textEls) {
    const s = getComputedStyle(el);
    const clipsX = ["hidden", "clip"].includes(s.overflowX);
    const clipsY = ["hidden", "clip"].includes(s.overflowY);
    if (((clipsX && el.scrollWidth > el.clientWidth + 1) || (clipsY && el.scrollHeight > el.clientHeight + 1)) && faults.clippedText.length < MAX_LISTED) {
      faults.clippedText.push({ el: describe(el), text: el.textContent.trim().slice(0, 40), scroll: [el.scrollWidth, el.scrollHeight], box: [el.clientWidth, el.clientHeight] });
    }
    const size = parseFloat(s.fontSize);
    if (size < MIN_FONT_PX && faults.smallText.length < MAX_LISTED) faults.smallText.push({ el: describe(el), px: size, text: el.textContent.trim().slice(0, 40) });
    const fg = parseColor(s.color);
    const bg = backgroundBehind(el);
    if (fg && bg && faults.lowContrast.length < MAX_LISTED) {
      const ratio = contrastRatio(fg.a < 1 ? blendOver(fg, bg) : fg, bg);
      const bold = parseInt(s.fontWeight, 10) >= 700;
      const large = size >= 24 || (size >= 18.66 && bold);
      const needed = large ? 3 : 4.5;
      if (ratio < needed) faults.lowContrast.push({ el: describe(el), ratio: Math.round(ratio * 100) / 100, needed, text: el.textContent.trim().slice(0, 40) });
    }
  }

  // Overlapping text: two text boxes whose rectangles overlap by more than a few pixels, neither inside the other.
  const boxes = textEls.slice(0, 400).map((el) => ({ el, r: el.getBoundingClientRect() }));
  for (let i = 0; i < boxes.length && faults.overlappingText.length < MAX_LISTED; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w > 4 && h > 4) { faults.overlappingText.push({ a: describe(a.el), b: describe(b.el), overlapPx: [Math.round(w), Math.round(h)] }); break; }
    }
  }

  // Images: missing alt attribute, and images that failed to load.
  for (const img of document.images) {
    if (!img.hasAttribute("alt") && faults.imagesWithoutAlt.length < MAX_LISTED) faults.imagesWithoutAlt.push({ el: describe(img), src: (img.currentSrc || img.src || "").slice(0, 60) });
    if (img.complete && img.naturalWidth === 0 && faults.brokenImages.length < MAX_LISTED) faults.brokenImages.push({ el: describe(img) });
  }

  // Tap targets: links, buttons and form controls smaller than the floor in either direction.
  const targets = document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button]");
  for (const el of targets) {
    if (faults.smallTapTargets.length >= MAX_LISTED) break;
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < MIN_TAP_PX || r.height < MIN_TAP_PX) faults.smallTapTargets.push({ el: describe(el), size: [Math.round(r.width), Math.round(r.height)] });
  }

  // Layout shift: sum of shifts the browser already recorded for this page load.
  try {
    const entries = performance.getEntriesByType("layout-shift");
    if (entries.length || "PerformanceObserver" in window) {
      const total = entries.filter((e) => !e.hadRecentInput).reduce((sum, e) => sum + e.value, 0);
      faults.layoutShift = { total: Math.round(total * 1000) / 1000, limit: 0.1, entries: entries.length };
    }
  } catch (e) {
    notMeasured.push("layoutShift (not supported by this browser)");
  }
  if (faults.layoutShift === null) notMeasured.push("layoutShift (no data; reload and measure after load)");

  const counts = {};
  let total = 0;
  for (const key of Object.keys(faults)) {
    const v = faults[key];
    let n = Array.isArray(v) ? v.length : (v && v.total > v.limit ? 1 : 0);
    counts[key] = n;
    total += n;
  }
  return JSON.stringify({ viewport: { width: vw, height: document.documentElement.clientHeight }, totalFaults: total, counts, faults, notMeasured }, null, 1);
})();
