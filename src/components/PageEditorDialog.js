"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { TEMPLATES } from "../lib/layout/templates";
import { useMemo } from "react";
import CropControls from "./CropControls";

export default function PageEditorDialog({
  open,
  onOpenChange,
  layout,
  items,
  pageIndex,
  onUpdateLayout,
}) {
  const page = layout?.pages?.[pageIndex];
  const templates = useMemo(() => Object.values(TEMPLATES).filter((t) => t.id !== "cover"), []);
  const imageOptions = items.map((it, idx) => ({
    id: it.id,
    label: `#${idx + 1} — ${it.file?.name}`,
    url: it.objectUrl,
  }));

  if (!page) return null;

  const setTemplate = (templateId) => {
    const template = TEMPLATES[templateId];
    onUpdateLayout((prev) => {
      const next = structuredClone(prev);
      const p = next.pages[pageIndex];

      p.templateId = templateId;

      const newSlots = template.slots.map((rect, i) => {
        const old = p.slots[i] || p.slots[p.slots.length - 1];
        return {
          imageId: old?.imageId || items[0]?.id,
          rect,
          cropRect: old?.cropRect || { x: 0, y: 0, w: 1, h: 1 },
          crop: old?.crop || { zoom: 1, panX: 0, panY: 0 },
        };
      });

      p.slots = newSlots;
      return next;
    });
  };

  const setSlotImage = (slotIdx, imageId) => {
    onUpdateLayout((prev) => {
      const next = structuredClone(prev);
      next.pages[pageIndex].slots[slotIdx].imageId = imageId;
      return next;
    });
  };

  const swapSlots = (a, b) => {
    onUpdateLayout((prev) => {
      const next = structuredClone(prev);
      const slots = next.pages[pageIndex].slots;
      const tmp = slots[a].imageId;
      slots[a].imageId = slots[b].imageId;
      slots[b].imageId = tmp;
      return next;
    });
  };

  const setSlotCrop = (slotIdx, crop) => {
    onUpdateLayout((prev) => {
      const next = structuredClone(prev);
      next.pages[pageIndex].slots[slotIdx].crop = crop;
      return next;
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)" }} />
        <Dialog.Content
          className="panel"
          style={{
            position: "fixed",
            right: 18,
            top: 18,
            bottom: 18,
            width: "min(460px, 92vw)",
            overflow: "auto",
          }}
        >
          <div className="row" style={{ justifyContent: "space-between" }}>
            <Dialog.Title style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
              Edit page: {page.id}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="button">Close</button>
            </Dialog.Close>
          </div>

          <div style={{ height: 12 }} />

          <div className="panel" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Template</div>
            <select
              className="button"
              style={{ width: "100%" }}
              value={page.templateId === "cover" ? "single" : page.templateId}
              onChange={(e) => setTemplate(e.target.value)}
              disabled={page.templateId === "cover"}
              title={page.templateId === "cover" ? "Cover page template is fixed for now" : ""}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="small" style={{ marginTop: 8 }}>
              Changing templates keeps existing images where possible.
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="panel" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Slots</div>

            {page.slots.map((slot, idx) => {
              const selected = imageOptions.find((o) => o.id === slot.imageId);
              return (
                <div key={idx} style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div className="badge">Slot {idx + 1}</div>

                    {page.slots.length > 1 && idx < page.slots.length - 1 ? (
                      <button className="button" onClick={() => swapSlots(idx, idx + 1)}>
                        Swap with next
                      </button>
                    ) : null}
                  </div>

                  <select
                    className="button"
                    style={{ width: "100%" }}
                    value={slot.imageId}
                    onChange={(e) => setSlotImage(idx, e.target.value)}
                  >
                    {imageOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <CropControls
                    slot={slot}
                    imageUrl={selected?.url}
                    onChange={(nextCrop) => setSlotCrop(idx, nextCrop)}
                  />
                </div>
              );
            })}
          </div>

          <div className="small">
            Crop changes are saved into the layout and will be used in PDF export.
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
