"use client";

import { PAGE_PRESETS, TEMPLATES } from "../lib/layout/templates";

export default function PagePreview({ page, imageById, album }) {
  const preset = PAGE_PRESETS[page.preset] || PAGE_PRESETS.A4_PORTRAIT;
  const template = TEMPLATES[page.templateId];

  const maxW = 360;
  const scale = maxW / preset.width;
  const w = Math.round(preset.width * scale);
  const h = Math.round(preset.height * scale);

  const innerW = w - preset.margin * 2 * scale;
  const innerH = h - preset.margin * 2 * scale;

  // NEW: background palette
  const isLight = album?.background === "light";
  const pageBg = isLight ? "#ffffff" : "#0b0c10";
  const slotBg = isLight ? "#ffffff" : "#0a0b10";
  const coverTextColor = isLight ? "#111" : "#fff";
  const coverSubColor = isLight ? "#444" : "var(--sub)";

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: pageBg,
        position: "relative",
        overflow: "hidden",
      }}
      title={`${template?.name || page.templateId}`}
    >
      <div
        style={{
          position: "absolute",
          left: preset.margin * scale,
          top: preset.margin * scale,
          width: innerW,
          height: innerH,
          display: "block",
        }}
      >
        {page.slots.map((slot, idx) => {
          const img = imageById[slot.imageId];
          const r = slot.rect;

          const left = r.x * innerW;
          const top = r.y * innerH;
          const width = r.w * innerW;
          const height = r.h * innerH;

          const crop = slot.crop || { zoom: 1, panX: 0, panY: 0 };
          const zoom = Math.max(1, crop.zoom || 1);
          const panX = clamp(crop.panX || 0);
          const panY = clamp(crop.panY || 0);

          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left,
                top,
                width,
                height,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                background: slotBg,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img?.objectUrl}
                alt={img?.file?.name || "photo"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `translate(${panX * 50}%, ${panY * 50}%) scale(${zoom})`,
                  transformOrigin: "center",
                  display: "block",
                }}
              />
            </div>
          );
        })}
      </div>

      {page.templateId === "cover" ? (
        <div
          style={{
            position: "absolute",
            left: preset.margin * scale+10,
            right: preset.margin * scale+10,
            bottom: preset.margin * scale+10,
            padding: 12,
            borderRadius: 5,
            background: isLight ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: "-0.01em",
              color: coverTextColor,
            }}
          >
            {album?.title || "My Album Title"}
          </div>
          {album?.subtitle ? (
            <div className="small" style={{ marginTop: 4, color: coverSubColor }}>
              {album.subtitle || "My Album Sub-title"}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          fontSize: 12,
          color: "var(--sub)",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "4px 8px",
          borderRadius: 999,
        }}
      >
        {page.id} • {template?.name || page.templateId}
      </div>
    </div>
  );
}

function clamp(v) {
  return Math.max(-1, Math.min(1, v));
}
