"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function CropControls({ slot, onChange, imageUrl }) {
  const frameRef = useRef(null);
  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  // Keep a ref of the latest crop so pointermove always uses fresh values
  const cropRef = useRef(slot.crop || { zoom: 1, panX: 0, panY: 0 });

  // Local state for smooth UI (still commits to parent via onChange)
  const [local, setLocal] = useState(() => ({
    zoom: Math.max(1, slot.crop?.zoom || 1),
    panX: clamp(slot.crop?.panX || 0),
    panY: clamp(slot.crop?.panY || 0),
  }));

  // Sync local state when slot changes (e.g. changing image/template)
  useEffect(() => {
    const next = {
      zoom: Math.max(1, slot.crop?.zoom || 1),
      panX: clamp(slot.crop?.panX || 0),
      panY: clamp(slot.crop?.panY || 0),
    };
    setLocal(next);
    cropRef.current = next;
  }, [slot.imageId]); // re-init crop UI when slot image changes

  // Transform: translate in % (more visible) then scale
  const transform = useMemo(() => {
    const z = Math.max(1, local.zoom || 1);
    const px = clamp(local.panX || 0);
    const py = clamp(local.panY || 0);

    // panX/panY in [-1..1] => translate [-50%..50%] of the image frame
    return `translate(${px * 50}%, ${py * 50}%) scale(${z})`;
  }, [local.zoom, local.panX, local.panY]);

  const commit = (next) => {
    const cleaned = {
      zoom: Math.max(1, next.zoom || 1),
      panX: clamp(next.panX || 0),
      panY: clamp(next.panY || 0),
    };
    setLocal(cleaned);
    cropRef.current = cleaned;
    onChange(cleaned);
  };

  const onPointerDown = (e) => {
    if (!frameRef.current) return;
    draggingRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current || !frameRef.current) return;

    const rect = frameRef.current.getBoundingClientRect();
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };

    // Convert pixel drag into normalized pan units.
    // Bigger zoom => less pan sensitivity (feels natural).
    const current = cropRef.current;
    const z = Math.max(1, current.zoom || 1);

    const nx = (dx / rect.width) * (2 / z);  // tune factor
    const ny = (dy / rect.height) * (2 / z);

    commit({
      zoom: z,
      panX: (current.panX || 0) + nx,
      panY: (current.panY || 0) + ny,
    });
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <div className="panel" style={{ padding: 10 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="badge">Crop</div>
        <button
          className="button"
          type="button"
          onClick={() => commit({ zoom: 1, panX: 0, panY: 0 })}
        >
          Reset
        </button>
      </div>

      <div style={{ height: 10 }} />

      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          width: "100%",
          aspectRatio: "16 / 10",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "#0a0b10",
          touchAction: "none",
          cursor: draggingRef.current ? "grabbing" : "grab",
          userSelect: "none",
        }}
        title="Drag to pan"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="crop"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform,
            transformOrigin: "center",
            display: "block",
            willChange: "transform",
          }}
          draggable={false}
        />
      </div>

      <div style={{ height: 10 }} />

      <div className="small">Zoom</div>
      <input
        type="range"
        min="1"
        max="2.5"
        step="0.01"
        value={local.zoom}
        onChange={(e) => commit({ ...cropRef.current, zoom: Number(e.target.value) })}
        style={{ width: "100%" }}
      />

      <div className="small" style={{ marginTop: 6 }}>
        Tip: drag to reframe faces.
      </div>
    </div>
  );
}

function clamp(v) {
  return Math.max(-1, Math.min(1, v));
}
