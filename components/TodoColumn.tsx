"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AddTodoForm } from "./AddTodoForm";
import { StaticTodoItemCard, TodoItemCard } from "./TodoItemCard";
import type { TodoItem } from "@/lib/types";

interface TodoColumnProps {
  id: string;
  title: string;
  subtitle?: string;
  accent?: string;
  items: TodoItem[];
  archivedItems?: TodoItem[];
  onAdd?: (title: string) => void;
  addPlaceholder?: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToFuture?: (id: string) => void;
  onMoveToNextWeek?: (id: string) => void;
  onMoveToWeek?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  onMoveToTomorrow?: (id: string) => void;
  draggable?: boolean;
  showArchivedLabel?: boolean;
  compact?: boolean;
}

export function TodoColumn({
  id,
  title,
  subtitle,
  accent = "#2a6f8f",
  items,
  archivedItems = [],
  onAdd,
  addPlaceholder = "Add a todo…",
  onToggle,
  onDelete,
  onMoveToFuture,
  onMoveToNextWeek,
  onMoveToWeek,
  onMoveToToday,
  onMoveToTomorrow,
  draggable = true,
  showArchivedLabel = false,
  compact = false,
}: TodoColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const sortableIds = items.map((i) => i.id);

  return (
    <section
      ref={setNodeRef}
      className={`trello-column flex flex-col transition-colors ${
        compact ? "p-2" : "p-2.5"
      } ${isOver ? "trello-column-drag-over" : ""}`}
    >
      <header className={`flex items-start gap-2 ${compact ? "mb-1.5" : "mb-2"}`}>
        <span
          className="mt-1.5 h-2 w-8 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <div>
          <h2
            className={`font-bold leading-tight text-foreground ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p className={`text-muted ${compact ? "text-[10px]" : "text-xs"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </header>

      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1.5">
          {items.length === 0 && archivedItems.length === 0 && (
            <p className={`text-muted-light ${compact ? "text-[10px]" : "text-xs"}`}>
              No cards yet
            </p>
          )}
          {items.map((item) => (
            <TodoItemCard
              key={item.id}
              item={item}
              draggable={draggable}
              onToggle={() => onToggle(item.id)}
              onDelete={() => onDelete(item.id)}
              onMoveToFuture={onMoveToFuture ? () => onMoveToFuture(item.id) : undefined}
              onMoveToNextWeek={
                onMoveToNextWeek ? () => onMoveToNextWeek(item.id) : undefined
              }
              onMoveToWeek={onMoveToWeek ? () => onMoveToWeek(item.id) : undefined}
              onMoveToToday={onMoveToToday ? () => onMoveToToday(item.id) : undefined}
              onMoveToTomorrow={
                onMoveToTomorrow ? () => onMoveToTomorrow(item.id) : undefined
              }
            />
          ))}
        </div>
      </SortableContext>

      {archivedItems.length > 0 && (
        <div className="mt-2 border-t border-baby-blue/30 pt-2">
          {showArchivedLabel && (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-light">
              Done earlier
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            {archivedItems.map((item) => (
              <StaticTodoItemCard key={item.id} item={item} showDayLabel />
            ))}
          </div>
        </div>
      )}

      {onAdd && <AddTodoForm placeholder={addPlaceholder} onAdd={onAdd} />}
    </section>
  );
}
