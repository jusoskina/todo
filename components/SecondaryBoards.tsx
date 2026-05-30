"use client";

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { TodoColumn } from "@/components/TodoColumn";
import { useTodos } from "@/context/TodoProvider";
import { formatWeekRange } from "@/lib/dates";
import { futureItems, nextWeekItems } from "@/lib/todo-utils";

export function FutureBoard() {
  const {
    items,
    addItem,
    toggleDone,
    deleteItem,
    moveToWeek,
    reorderInColumn,
  } = useTodos();

  const list = futureItems(items);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderInColumn("future", String(active.id), String(over.id));
  }

  return (
    <div className="mx-auto max-w-lg flex-1 p-3 pb-6">
      <p className="mb-3 text-sm text-muted">
        A backlog of todos with no date. Move items to this week when you are
        ready to schedule them.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <TodoColumn
          id="future"
          title="Future"
          accent="#3d7a9a"
          items={list}
          onAdd={(title) => addItem(title, "future")}
          addPlaceholder="Add a future todo…"
          onToggle={toggleDone}
          onDelete={deleteItem}
          onMoveToWeek={moveToWeek}
        />
      </DndContext>
    </div>
  );
}

export function NextWeekBoard() {
  const {
    items,
    nextWeekKeyValue,
    addItem,
    toggleDone,
    deleteItem,
    moveToFuture,
    moveToWeek,
    reorderInColumn,
  } = useTodos();

  const list = nextWeekItems(items, nextWeekKeyValue);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderInColumn("next-week", String(active.id), String(over.id));
  }

  return (
    <div className="mx-auto max-w-lg flex-1 p-3 pb-6">
      <p className="mb-3 text-sm text-muted">
        Items planned for next week ({formatWeekRange(nextWeekKeyValue)}). At the
        start of next week they become part of your weekly list. Incomplete items
        from this week also roll here automatically.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <TodoColumn
          id="next-week"
          title="Next week"
          subtitle={formatWeekRange(nextWeekKeyValue)}
          accent="#2a6f8f"
          items={list}
          onAdd={(title) => addItem(title, "next-week")}
          addPlaceholder="Add to next week…"
          onToggle={toggleDone}
          onDelete={deleteItem}
          onMoveToFuture={moveToFuture}
          onMoveToWeek={moveToWeek}
        />
      </DndContext>
    </div>
  );
}
