import { TEMPLATES, PAGE_PRESETS } from "./templates";

export function generateLayout(images, options = {}) {
  const preset = options.preset || "A4_PORTRAIT";
  PAGE_PRESETS[preset] || PAGE_PRESETS.A4_PORTRAIT;

  // UPDATED: include background default
  const album = options.album || {
    title: "My Album Title",
    subtitle: "My Album Sub-title",
    coverImageId: images[0]?.id,
    background: "dark",
  };

  const pages = [];

  // Cover page first
  if (album.coverImageId) {
    pages.push({
      id: "Cover Page",
      preset,
      templateId: "cover",
      slots: [
        {
          imageId: album.coverImageId,
          cropRect: { x: 0, y: 0, w: 1, h: 1 },
          crop: { zoom: 1, panX: 0, panY: 0 },
          rect: TEMPLATES.cover.slots[0],
        },
      ],
    });
  }

  const remainingImages = images.filter((img) => img.id !== album.coverImageId);

  let i = 0;
  while (i < remainingImages.length) {
    const remaining = remainingImages.length - i;

    let templateId = "single";
    if (remaining >= 4) templateId = "grid4";
    else if (remaining === 3) templateId = "grid3";
    else if (remaining === 2) templateId = (pages.length % 2 === 0 ? "two" : "two_v");

    const template = TEMPLATES[templateId];
    const count = template.slots.length;

    const slots = template.slots.map((rect, idx) => {
      const img = remainingImages[i + idx];
      return {
        imageId: img.id,
        cropRect: { x: 0, y: 0, w: 1, h: 1 },
        crop: { zoom: 1, panX: 0, panY: 0 },
        rect,
      };
    });

    pages.push({
      id: `Page ${pages.length}`,
      preset,
      templateId,
      slots,
    });

    i += count;
  }

  return {
    version: 2,
    createdAt: Date.now(),
    preset,
    album, // includes background
    pages,
  };
}
