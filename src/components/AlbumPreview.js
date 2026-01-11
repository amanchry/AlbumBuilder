"use client";

import PagePreview from "./PagePreview";

export default function AlbumPreview({
  layout,
  items,
  onSelectPage,
  selectedPageIndex,
}) {
  const imageById = Object.fromEntries(items.map((x) => [x.id, x]));

  if (!layout?.pages?.length) {
    return (
      <div className="panel">
        <div style={{ fontWeight: 800 }}>No layout generated yet</div>
        <div className="small">Click “Generate layout” to create pages.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <span className="badge">Pages: {layout.pages.length}</span>
          <span className="badge">Preset: {layout.preset}</span>
        </div>
        <div className="small">Click a page to edit template / images / crop.</div>
      </div>

      <div style={{ height: 14 }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
          alignItems: "start",
        }}
      >
{layout.pages.map((page, idx) => {
  const selected = selectedPageIndex === idx;

  return (
    <div
      key={page.id}
      onClick={() => onSelectPage?.(idx)}
      style={{
        display: "grid",
        justifyItems: "center",
        cursor: "pointer",
        padding: 6,              // keep spacing between cards
        borderRadius: 16,
      }}
    >
      {/* This wrapper is EXACTLY the same size as PagePreview output */}
      <div style={{ position: "relative", borderRadius: 14 }}>
        <PagePreview page={page} imageById={imageById} album={layout.album} />

        {/* Selection ring overlay (matches the page exactly) */}
        {selected ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              pointerEvents: "none",
              boxShadow:
                "0 0 0 2px rgba(124,92,255,0.95), 0 0 0 6px rgba(124,92,255,0.20)",
            }}
          />
        ) : null}
      </div>
    </div>
  );
})}

      </div>
    </div>
  );
}
