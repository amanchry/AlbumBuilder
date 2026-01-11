"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon } from "@radix-ui/react-icons";

export default function ThumbCard({ item, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    outline: isDragging ? "2px solid rgba(124,92,255,0.7)" : "none",
    borderRadius: 14,
  };

  const ratio = item.width && item.height ? `${item.width}×${item.height}` : "…";

  return (
    <div ref={setNodeRef} style={style} className="thumb" {...attributes} {...listeners}>
      <div className="thumbTop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.objectUrl} alt={item.file?.name || "photo"} />
        <button
          className="iconBtn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <TrashIcon />
        </button>
      </div>

      <div className="thumbMeta">
        <div className="small" title={item.file?.name}>
          #{index + 1} • {item.file?.name?.slice(0, 22) || "image"}
          {item.file?.name?.length > 22 ? "…" : ""}
        </div>
        <span className="badge">{ratio}</span>
      </div>
    </div>
  );
}
