"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { TodoColumn } from "@/components/TodoColumn";
import { TodoItemCard } from "@/components/TodoItemCard";
import { useTodos } from "@/context/TodoProvider";
import {
  columnHeading,
  formatDisplayDate,
  formatWeekRange,
  tomorrowDayKey,
} from "@/lib/dates";
import {
  dayItems,
  todayActiveItems,
  todayCompletedEarlierItems,
  weekItems,
} from "@/lib/todo-utils";
import type { BoardColumnId } from "@/lib/types";
import { columnIdFromDropTarget, dayColumnId } from "@/lib/types";

export function MainBoard() {
  const {
    items,
    dayKey,
    weekKey,
    addItem,
    toggleDone,
    deleteItem,
    moveToToday,
    reorderInColumn,
    moveBetweenColumns,
  } = useTodos();

  const [activeId, setActiveId] = useState<string | null>(null);

  const tomorrowKey = tomorrowDayKey(dayKey);
  const tomorrowColumnId = dayColumnId(tomorrowKey);

  const todayItems = todayActiveItems(items, dayKey);
  const tomorrowItems = dayItems(items, tomorrowKey);
  const weekList = weekItems(items, weekKey);
  const earlierDone = todayCompletedEarlierItems(items, dayKey, weekKey);
  const { weekday, date } = formatDisplayDate(dayKey);
  const tomorrowHeading = columnHeading(tomorrowKey, dayKey);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
  );

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  function resolveColumn(id: string): BoardColumnId | null {
    return columnIdFromDropTarget(id, items, dayKey, weekKey);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeColumn = resolveColumn(String(active.id));
    const overColumn = resolveColumn(String(over.id));

    if (!activeColumn || !overColumn) return;

    if (activeColumn === overColumn) {
      reorderInColumn(activeColumn, String(active.id), String(over.id));
      return;
    }

    moveBetweenColumns(
      String(active.id),
      overColumn,
      over.id !== overColumn ? String(over.id) : undefined,
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-2 p-2">
        <TodoColumn
          id="today"
          title={weekday}
          subtitle={date}
          items={todayItems}
          archivedItems={earlierDone}
          showArchivedLabel
          onAdd={(title) => addItem(title, "day")}
          addPlaceholder="Add to today…"
          onToggle={toggleDone}
          onDelete={deleteItem}
        />

        <TodoColumn
          id={tomorrowColumnId}
          title={tomorrowHeading.title}
          subtitle={tomorrowHeading.subtitle}
          items={tomorrowItems}
          onAdd={(title) => addItem(title, "day", null, tomorrowKey)}
          addPlaceholder="Add to tomorrow…"
          onToggle={toggleDone}
          onDelete={deleteItem}
        />

        <TodoColumn
          id="week"
          title="This week"
          subtitle={formatWeekRange(weekKey)}
          items={weekList}
          onAdd={(title) => addItem(title, "week")}
          addPlaceholder="Add to this week…"
          onToggle={toggleDone}
          onDelete={deleteItem}
          onMoveToToday={moveToToday}
        />
      </div>

      <DragOverlay>
        {activeItem ? (
          <TodoItemCard
            item={activeItem}
            draggable={false}
            onToggle={() => {}}
            onDelete={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
