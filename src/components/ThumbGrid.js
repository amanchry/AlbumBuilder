"use client";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import ThumbCard from "./ThumbCard";

export default function ThumbGrid({ items, setItems, onRemove }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function onDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((x) => x.id === active.id);
      const newIndex = prev.findIndex((x) => x.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  if (items.length === 0) {
    return (
      <div className="panel">
        <div style={{ fontWeight: 800 }}>No photos yet</div>
        <div className="small">Click “Add photos” to start building your album.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={rectSortingStrategy}>
          <div className="grid">
            {items.map((item, index) => (
              <ThumbCard
                key={item.id}
                item={item}
                index={index}
                onRemove={() => onRemove(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
