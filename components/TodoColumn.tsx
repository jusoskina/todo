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
      className={`flex flex-col rounded-md border transition-colors ${
        compact ? "p-1.5" : "p-2"
      } ${
        isOver
          ? "border-blue-400 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20"
          : "border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40"
      }`}
    >
      <header className={compact ? "mb-1" : "mb-1.5"}>
        <h2 className={`font-semibold leading-tight ${compact ? "text-xs" : "text-sm"}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-zinc-500 ${compact ? "text-[10px]" : "text-xs"}`}>{subtitle}</p>
        )}
      </header>

      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1">
          {items.length === 0 && archivedItems.length === 0 && (
            <p className={`text-zinc-400 ${compact ? "text-[10px]" : "text-xs"}`}>Empty</p>
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
        <div className="mt-2 border-t border-zinc-200 pt-1.5 dark:border-zinc-800">
          {showArchivedLabel && (
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              Done earlier
            </p>
          )}
          <div className="flex flex-col gap-1">
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
