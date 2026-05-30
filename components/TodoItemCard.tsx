"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDisplayDate } from "@/lib/dates";
import type { TodoItem } from "@/lib/types";

interface TodoItemCardProps {
  item: TodoItem;
  draggable?: boolean;
  showRolledOver?: boolean;
  showDayLabel?: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMoveToFuture?: () => void;
  onMoveToNextWeek?: () => void;
  onMoveToWeek?: () => void;
  onMoveToToday?: () => void;
  onMoveToTomorrow?: () => void;
}

export function TodoItemCard({
  item,
  draggable = true,
  showRolledOver = true,
  showDayLabel = false,
  onToggle,
  onDelete,
  onMoveToFuture,
  onMoveToNextWeek,
  onMoveToWeek,
  onMoveToToday,
  onMoveToTomorrow,
}: TodoItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: item.id,
      disabled: !draggable,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDone = item.done;
  const isRolled = showRolledOver && item.rolledOver && !isDone;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-1 rounded border px-1.5 py-1 text-xs ${
        isDragging ? "opacity-50" : ""
      } ${
        isDone
          ? "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50"
          : isRolled
            ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40"
            : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
      }`}
    >
      {draggable && (
        <button
          type="button"
          className="mt-px cursor-grab touch-none text-[10px] text-zinc-300 hover:text-zinc-500 active:cursor-grabbing dark:text-zinc-600"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      )}
      <input
        type="checkbox"
        checked={isDone}
        onChange={onToggle}
        className="mt-px h-3 w-3 shrink-0 rounded border-zinc-300"
      />
      <div className="min-w-0 flex-1">
        <p className={`break-words ${isDone ? "line-through" : ""}`}>{item.title}</p>
        {showDayLabel && item.dayKey && (
          <p className="mt-0.5 text-xs text-zinc-400">
            {formatDisplayDate(item.dayKey).weekday}, {formatDisplayDate(item.dayKey).date}
          </p>
        )}
        {isRolled && (
          <p className="text-[10px] font-medium text-orange-600 dark:text-orange-400">
            Rolled over
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {onMoveToToday && (
          <ActionButton label="Today" onClick={onMoveToToday} />
        )}
        {onMoveToWeek && <ActionButton label="Week" onClick={onMoveToWeek} />}
        {onMoveToTomorrow && (
          <ActionButton label="Tmrw" onClick={onMoveToTomorrow} />
        )}
        {onMoveToNextWeek && (
          <ActionButton label="Next wk" onClick={onMoveToNextWeek} />
        )}
        {onMoveToFuture && (
          <ActionButton label="Future" onClick={onMoveToFuture} />
        )}
        <ActionButton label="Delete" onClick={onDelete} danger />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-1 py-px text-[9px] font-medium uppercase tracking-wide ${
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}

export function StaticTodoItemCard({
  item,
  showDayLabel = false,
}: {
  item: TodoItem;
  showDayLabel?: boolean;
}) {
  return (
    <div className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-1 text-xs text-zinc-400 line-through dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="break-words">{item.title}</p>
      {showDayLabel && item.dayKey && (
        <p className="mt-0.5 text-xs">
          {formatDisplayDate(item.dayKey).weekday}, {formatDisplayDate(item.dayKey).date}
        </p>
      )}
    </div>
  );
}
