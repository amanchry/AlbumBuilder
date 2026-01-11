"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { PlusIcon } from "@radix-ui/react-icons";
import ImageUploader from "./ImageUploader";
import ThumbGrid from "./ThumbGrid";
import AlbumPreview from "./AlbumPreview";
import AlbumSetupDialog from "./AlbumSetupDialog";
import PageEditorDialog from "./PageEditorDialog";

import { uid } from "../lib/ids";
import { readImageSize } from "../lib/image";
import { generateLayout } from "../lib/layout/generateLayout";
import { exportAlbumPdf } from "../lib/pdf/exportPdf";
import { downloadBlob } from "../lib/download";

import { useCallback, useMemo, useState } from "react";

export default function BuilderShell() {
  const [items, setItems] = useState([]);
  const [layout, setLayout] = useState(null);

  const [view, setView] = useState("library"); // "library" | "pages"
  const [preset, setPreset] = useState("A4_PORTRAIT");
const [pdfQuality, setPdfQuality] = useState("balanced");

  // album setup
  const [album, setAlbum] = useState({ title: "", subtitle: "", coverImageId: null });
  const [setupOpen, setSetupOpen] = useState(false);

  // page editor
  const [selectedPageIndex, setSelectedPageIndex] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  // export
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

  const count = items.length;

  const addFiles = useCallback(async (files) => {
    const fileList = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    const newOnes = [];
    for (const file of fileList) {
      const objectUrl = URL.createObjectURL(file);
      let size = { width: 0, height: 0 };
      try {
        size = await readImageSize(objectUrl);
      } catch {}
      newOnes.push({
        id: uid(),
        file,
        objectUrl,
        width: size.width,
        height: size.height,
        caption: "",
      });
    }

    setItems((prev) => [...prev, ...newOnes]);
    setLayout(null);
    setView("library");
  }, []);

  const removeById = useCallback((id) => {
    setItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target?.objectUrl) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((x) => x.id !== id);
    });
    setLayout(null);
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((x) => x.objectUrl && URL.revokeObjectURL(x.objectUrl));
      return [];
    });
    setLayout(null);
    setView("library");
    setEditorOpen(false);
    setSelectedPageIndex(null);
  }, []);

  const stats = useMemo(() => {
    const portraits = items.filter((x) => x.height > x.width).length;
    const landscapes = items.filter((x) => x.width > x.height).length;
    const squares = items.filter((x) => x.width === x.height && x.width !== 0).length;
    return { portraits, landscapes, squares };
  }, [items]);

  // Generate: open album setup dialog first
  const onGenerate = useCallback(() => {
    if (items.length === 0) return;
    setSetupOpen(true);
  }, [items.length]);

  const onConfirmAlbum = useCallback(
    (albumMeta) => {
      setAlbum(albumMeta);
      const next = generateLayout(items, { preset, album: albumMeta });
      setLayout(next);
      setView("pages");
      setSetupOpen(false);
    },
    [items, preset]
  );

  const onExport = useCallback(async () => {
    if (!layout?.pages?.length) return;

    setExportOpen(true);
    setExporting(true);
    setExportStatus("Starting…");
    setExportProgress({ current: 0, total: layout.pages.length });

    try {
      const blob = await exportAlbumPdf({
        layout,
        items,
        qualityPreset: pdfQuality,
        onProgress: ({ current, total, status }) => {
          setExportStatus(status || "");
          setExportProgress({ current, total });
        },
      });

      const filename = `album-${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadBlob(blob, filename);

      setExportStatus("Done! Download should have started.");
    } catch (e) {
      setExportStatus(`Export failed: ${e?.message || "Unknown error"}`);
    } finally {
      setExporting(false);
    }
  }, [layout, items]);

  return (
    <div className="shell">
      <div className="header">
        <h1 className="h1">Album Builder</h1>

        <div className="row">
          {/* Add photos */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="button primary">
                <PlusIcon /> Add photos
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)" }} />
              <Dialog.Content
                className="panel"
                style={{
                  position: "fixed",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "min(720px, 92vw)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <Dialog.Title style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                    Add photos
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="button">Close</button>
                  </Dialog.Close>
                </div>

                <div style={{ height: 12 }} />
                <ImageUploader onAddFiles={addFiles} />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Preset */}
          <select
            className="button"
            value={preset}
            onChange={(e) => {
              setPreset(e.target.value);
              setLayout(null);
            }}
            style={{ padding: "10px 12px" }}
            title="Page preset"
          >
            <option value="A4_PORTRAIT">A4 Portrait</option>
            <option value="A4_LANDSCAPE">A4 Landscape</option>
          </select>

          <button className="button" onClick={onGenerate} disabled={count === 0}>
            Generate layout
          </button>

          <select
  className="button"
  value={pdfQuality}
  onChange={(e) => setPdfQuality(e.target.value)}
  style={{ padding: "10px 12px" }}
  title="PDF Quality"
>
  <option disabled value="">PDF Quality</option>
  <option value="small">Small</option>
  <option value="balanced">Balanced</option>
  <option value="high">High</option>
</select>


          <button className="button primary" onClick={onExport} disabled={!layout?.pages?.length}>
            Download PDF
          </button>

          <button className="button danger" onClick={clearAll} disabled={count === 0}>
            Clear
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            <span className="badge">Photos: {count}</span>
            <span className="badge">Portrait: {stats.portraits}</span>
            <span className="badge">Landscape: {stats.landscapes}</span>
            <span className="badge">Square: {stats.squares}</span>
          </div>

          <div className="row">
            <button className="button" onClick={() => setView("library")} disabled={view === "library"}>
              Library
            </button>
            <button
              className="button"
              onClick={() => setView("pages")}
              disabled={view === "pages" || !layout}
              title={!layout ? "Generate a layout first" : ""}
            >
              Pages
            </button>
          </div>
        </div>
      </div>

      {view === "library" ? (
        <ThumbGrid
          items={items}
          setItems={(updater) => {
            setItems((prev) => {
              const next = typeof updater === "function" ? updater(prev) : updater;
              return next;
            });
            setLayout(null);
          }}
          onRemove={removeById}
        />
      ) : (
        <AlbumPreview
          layout={layout}
          items={items}
          selectedPageIndex={selectedPageIndex}
          onSelectPage={(idx) => {
            setSelectedPageIndex(idx);
            setEditorOpen(true);
          }}
        />
      )}

      {/* Album setup dialog */}
      <AlbumSetupDialog
        open={setupOpen}
        onOpenChange={setSetupOpen}
        items={items}
        initialAlbum={{
          ...album,
          coverImageId: album.coverImageId || items[0]?.id,
        }}
        onConfirm={onConfirmAlbum}
      />

      {/* Page editor dialog */}
      <PageEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        layout={layout}
        items={items}
        pageIndex={selectedPageIndex}
        onUpdateLayout={(updater) =>
          setLayout((prev) => (typeof updater === "function" ? updater(prev) : updater))
        }
      />

      {/* Export dialog */}
      <Dialog.Root open={exportOpen} onOpenChange={(o) => !exporting && setExportOpen(o)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)" }} />
          <Dialog.Content
            className="panel"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(520px, 92vw)",
            }}
          >
            <div className="row" style={{ justifyContent: "space-between" }}>
              <Dialog.Title style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                Exporting PDF
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="button" disabled={exporting}>
                  Close
                </button>
              </Dialog.Close>
            </div>

            <div style={{ height: 12 }} />
            <div className="small">{exportStatus}</div>

            <div style={{ height: 10 }} />
            <progress
              value={exportProgress.total ? exportProgress.current : 0}
              max={exportProgress.total || 1}
              style={{ width: "100%" }}
            />

            <div style={{ height: 10 }} />
            <div className="small">
              {exportProgress.total
                ? `Page ${Math.min(exportProgress.current + 1, exportProgress.total)} of ${exportProgress.total}`
                : ""}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
