// lib/render/crop.js

/**
 * Compute how to draw an image using a "cover" fit inside a box,
 * with crop controls:
 *  - crop.zoom >= 1
 *  - crop.panX, crop.panY in [-1..1]
 *
 * Returns draw rect (dx, dy, dw, dh) relative to the box origin (0,0).
 */
export function computeCoverDraw(imageW, imageH, boxW, boxH, crop) {
  const base = Math.max(boxW / imageW, boxH / imageH);

  const zoomRaw = crop?.zoom ?? 1;
  const zoom = Math.max(1, Number.isFinite(Number(zoomRaw)) ? Number(zoomRaw) : 1);

  const scale = base * zoom;

  const dw = imageW * scale;
  const dh = imageH * scale;

  const panXRaw = crop?.panX ?? 0;
  const panYRaw = crop?.panY ?? 0;

  const panX = clamp(Number.isFinite(Number(panXRaw)) ? Number(panXRaw) : 0, -1, 1);
  const panY = clamp(Number.isFinite(Number(panYRaw)) ? Number(panYRaw) : 0, -1, 1);

  // how much oversized content we can slide around
  const maxOffsetX = Math.max(0, (dw - boxW) / 2);
  const maxOffsetY = Math.max(0, (dh - boxH) / 2);

  // start centered + apply pan
  const dx = (boxW - dw) / 2 + panX * maxOffsetX;
  const dy = (boxH - dh) / 2 + panY * maxOffsetY;

  return { dx, dy, dw, dh };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
