import { PDFDocument } from "pdf-lib";
import { PAGE_PRESETS } from "../layout/templates";
import { renderPageToCanvas } from "../render/renderPageToCanvas";

/**
 * qualityPreset:
 *  - "small"    => smallest file, lower sharpness
 *  - "balanced" => good default
 *  - "high"     => best sharpness, bigger file
 */
export async function exportAlbumPdf({
  layout,
  items,
  qualityPreset = "balanced",
  onProgress,
}) {
  if (!layout?.pages?.length) throw new Error("No layout to export");

  const imageById = Object.fromEntries(items.map((x) => [x.id, x]));
  const pdfDoc = await PDFDocument.create();

  const total = layout.pages.length;
  const album = layout.album || {};

  const { scale, jpegQuality } = presetToSettings(qualityPreset);

  for (let idx = 0; idx < total; idx++) {
    const pageLayout = layout.pages[idx];
    const preset = PAGE_PRESETS[pageLayout.preset] || PAGE_PRESETS.A4_PORTRAIT;

    onProgress?.({
      current: idx,
      total,
      status: `Rendering page ${idx + 1}/${total} (${qualityPreset})…`,
    });

    const canvas = await renderPageToCanvas(pageLayout, imageById, {
      scale,
      album,
    });

    onProgress?.({
      current: idx,
      total,
      status: `Encoding page ${idx + 1}/${total}…`,
    });

    // JPEG is usually much smaller than PNG for photos
    const dataUrl = canvas.toDataURL("image/jpeg", jpegQuality);
    const jpegBytes = dataUrlToUint8Array(dataUrl);

    const jpg = await pdfDoc.embedJpg(jpegBytes);
    const pdfPage = pdfDoc.addPage([preset.width, preset.height]);

    pdfPage.drawImage(jpg, {
      x: 0,
      y: 0,
      width: preset.width,
      height: preset.height,
    });

    // reduce memory pressure
    canvas.width = 1;
    canvas.height = 1;
  }

  onProgress?.({ current: total, total, status: "Finalizing PDF…" });

  // This compresses PDF internal objects further
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return new Blob([pdfBytes], { type: "application/pdf" });
}

function presetToSettings(preset) {
  // You can tweak these:
  // - Scale affects sharpness most.
  // - JPEG quality affects file size most.
  switch (preset) {
    case "small":
      return { scale: 1.6, jpegQuality: 0.78 };
    case "high":
      return { scale: 3.0, jpegQuality: 0.94 };
    case "balanced":
    default:
      return { scale: 2.4, jpegQuality: 0.88 };
  }
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
