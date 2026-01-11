import { PAGE_PRESETS } from "../layout/templates";
import { computeCoverDraw } from "./crop";

/**
 * Draws a page to a canvas at a chosen scale factor.
 * @param {Object} page - layout page
 * @param {Object} imageById - map of imageId -> { file, objectUrl, width, height }
 * @param {Object} options - { scale, album, drawPageLabel }
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderPageToCanvas(page, imageById, options = {}) {
  const preset = PAGE_PRESETS[page.preset] || PAGE_PRESETS.A4_PORTRAIT;
  const scale = options.scale || 2;
  const album = options.album || {};
  const isLight = album.background === "light";

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(preset.width * scale);
  canvas.height = Math.round(preset.height * scale);

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas not supported");

  // NEW: background fill
  ctx.fillStyle = isLight ? "#ffffff" : "#0b0c10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const margin = preset.margin * scale;
  const innerX = margin;
  const innerY = margin;
  const innerW = canvas.width - margin * 2;
  const innerH = canvas.height - margin * 2;

  // "paper" panel
  ctx.fillStyle = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.03)";
  roundRect(ctx, innerX, innerY, innerW, innerH, 18 * scale);
  ctx.fill();

  const gap = Math.max(10 * scale, 1);

  // Draw slots
  for (const slot of page.slots || []) {
    const imgItem = imageById[slot.imageId];
    if (!imgItem) continue;

    const r = slot.rect || { x: 0, y: 0, w: 1, h: 1 };

    const x = innerX + r.x * innerW;
    const y = innerY + r.y * innerH;
    const w = r.w * innerW;
    const h = r.h * innerH;

    const ix = x + gap * 0.5;
    const iy = y + gap * 0.5;
    const iw = w - gap;
    const ih = h - gap;

    ctx.save();
    roundRect(ctx, ix, iy, iw, ih, 14 * scale);
    ctx.clip();

    // slot background
    ctx.fillStyle = isLight ? "#ffffff" : "#0a0b10";
    ctx.fillRect(ix, iy, iw, ih);

    const bmp = await loadBitmap(imgItem);
    const crop = normalizeCrop(slot.crop);
    drawCoverCropped(ctx, bmp, ix, iy, iw, ih, crop);

    ctx.restore();

    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    if (!isLight) ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = Math.max(1, scale);
    roundRect(ctx, ix, iy, iw, ih, 14 * scale);
    ctx.stroke();
  }

  // Cover overlay text
  if (page.templateId === "cover") {
const title = (album.title || "My Album Title").toString();
const subtitle = (album.subtitle || "My Album Sub-title").toString();

ctx.save();

// Match DOM spacing exactly
const inset = preset.margin * scale + 10 * scale;
const padding = 12 * scale;

const bx = inset;
const bw = canvas.width - inset * 2;
const bh = subtitle.trim() ? 78 * scale : 52 * scale;
const by = canvas.height - inset - bh;

// Background panel
ctx.fillStyle = isLight
  ? "rgba(255,255,255,0.72)"
  : "rgba(0,0,0,0.45)";
roundRect(ctx, bx, by, bw, bh, 5 * scale);
ctx.fill();

// Title
ctx.fillStyle = isLight
  ? "rgba(0,0,0,0.92)"
  : "rgba(255,255,255,0.92)";
ctx.font = `900 ${18 * scale}px ui-sans-serif, system-ui`;
ctx.textAlign = "left";
ctx.textBaseline = "top";

ctx.fillText(
  title,
  bx + padding,
  by + padding
);

// Subtitle
if (subtitle.trim()) {
  ctx.fillStyle = isLight
    ? "rgba(0,0,0,0.65)"
    : "rgba(255,255,255,0.72)";
  ctx.font = `${13 * scale}px ui-sans-serif, system-ui`;

  ctx.fillText(
    subtitle,
    bx + padding,
    by + padding + 22 * scale
  );
}

ctx.restore();

  }

  // Optional tiny label
  if (options.drawPageLabel) {
    ctx.fillStyle = isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";
    ctx.font = `${12 * scale}px ui-sans-serif, system-ui`;
    ctx.fillText(page.id, innerX, canvas.height - margin * 0.55);
  }

  return canvas;
}

function normalizeCrop(crop) {
  const zoom = Math.max(1, Number(crop?.zoom ?? 1));
  const panX = clamp(Number(crop?.panX ?? 0), -1, 1);
  const panY = clamp(Number(crop?.panY ?? 0), -1, 1);
  return { zoom, panX, panY };
}

async function loadBitmap(imgItem) {
  if (imgItem.file && "createImageBitmap" in window) {
    try {
      return await createImageBitmap(imgItem.file);
    } catch {}
  }

  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = imgItem.objectUrl;
  });
}

function drawCoverCropped(ctx, image, x, y, w, h, crop) {
  const iw = image.width || image.naturalWidth;
  const ih = image.height || image.naturalHeight;
  if (!iw || !ih) return;

  const { dx, dy, dw, dh } = computeCoverDraw(iw, ih, w, h, crop);
  ctx.drawImage(image, x + dx, y + dy, dw, dh);
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
