"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMemo, useState } from "react";

export default function AlbumSetupDialog({
  open,
  onOpenChange,
  items,
  initialAlbum,
  onConfirm,
}) {
  const [title, setTitle] = useState(initialAlbum?.title || "");
  const [subtitle, setSubtitle] = useState(initialAlbum?.subtitle || "");
  const [coverImageId, setCoverImageId] = useState(
    initialAlbum?.coverImageId || items[0]?.id
  );

  // NEW: background choice
  const [background, setBackground] = useState(
    initialAlbum?.background || "dark"
  );

  const coverThumb = useMemo(() => {
    const found = items.find((x) => x.id === coverImageId);
    return found?.objectUrl;
  }, [items, coverImageId]);

  const safeCoverId = coverImageId || items[0]?.id;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)" }}
        />
        <Dialog.Content
          className="panel"
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(760px, 92vw)",
          }}
        >
          <div className="row" style={{ justifyContent: "space-between" }}>
            <Dialog.Title style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
              Album details
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="button">Close</button>
            </Dialog.Close>
          </div>

          <div style={{ height: 12 }} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <div className="panel" style={{ padding: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Family Trip"
                style={inputStyle}
              />

              <div style={{ height: 10 }} />
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Subtitle</div>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., India Trip • 2022"
                style={inputStyle}
              />

              {/* NEW: Background */}
              <div style={{ height: 12 }} />
              <div style={{ fontWeight: 800, marginBottom: 8 }}>
                Background
              </div>

              <div className="row">
                <label className="badge" style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="bg"
                    value="dark"
                    checked={background === "dark"}
                    onChange={() => setBackground("dark")}
                    style={{ marginRight: 6 }}
                  />
                  Black
                </label>

                <label className="badge" style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="bg"
                    value="light"
                    checked={background === "light"}
                    onChange={() => setBackground("light")}
                    style={{ marginRight: 6 }}
                  />
                  White
                </label>
              </div>
            </div>

            <div className="panel" style={{ padding: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Cover photo</div>

              {coverThumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverThumb}
                  alt="cover"
                  style={{
                    width: "100%",
                    aspectRatio: "16/10",
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
              ) : (
                <div className="small">Pick a cover from your uploaded photos.</div>
              )}

              <div style={{ height: 10 }} />

              <select
                className="button"
                value={safeCoverId}
                onChange={(e) => setCoverImageId(e.target.value)}
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                {items.map((it, idx) => (
                  <option key={it.id} value={it.id}>
                    #{idx + 1} — {it.file?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button
              className="button primary"
              onClick={() =>
                onConfirm({
                  title: title.trim() || "My Album Title",
                  subtitle: subtitle.trim() || "My Album Sub-title",
                  coverImageId: safeCoverId,
                  background, // NEW
                })
              }
              disabled={!items.length}
            >
              Create layout
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.03)",
  color: "var(--text)",
  outline: "none",
};
