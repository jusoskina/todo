"use client";

import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { celebrateAtElement } from "@/lib/celebration";
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
  const checkboxRef = useRef<HTMLInputElement>(null);

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

  function handleToggle() {
    if (!isDone) {
      celebrateAtElement(checkboxRef.current);
      checkboxRef.current?.classList.add("trello-checkbox-pop");
      window.setTimeout(() => {
        checkboxRef.current?.classList.remove("trello-checkbox-pop");
      }, 350);
    }
    onToggle();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-1.5 px-2 py-1.5 text-xs ${
        isDragging ? "opacity-60" : ""
      } ${
        isDone
          ? "trello-card trello-card-done text-muted-light"
          : isRolled
            ? "trello-card trello-card-rolled"
            : "trello-card"
      }`}
    >
      {draggable && (
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-[10px] text-baby-blue-dark/40 hover:text-baby-blue-dark active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      )}
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={isDone}
        onChange={handleToggle}
        className="trello-checkbox mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <p className={`break-words leading-snug ${isDone ? "line-through" : "text-foreground"}`}>
          {item.title}
        </p>
        {showDayLabel && item.dayKey && (
          <p className="mt-0.5 text-[10px] text-muted-light">
            {formatDisplayDate(item.dayKey).weekday}, {formatDisplayDate(item.dayKey).date}
          </p>
        )}
        {isRolled && (
          <p className="text-[10px] font-semibold text-[#b45309]">Rolled over</p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {onMoveToToday && <ActionButton label="Today" onClick={onMoveToToday} />}
        {onMoveToWeek && <ActionButton label="Week" onClick={onMoveToWeek} />}
        {onMoveToTomorrow && <ActionButton label="Tmrw" onClick={onMoveToTomorrow} />}
        {onMoveToNextWeek && <ActionButton label="Next wk" onClick={onMoveToNextWeek} />}
        {onMoveToFuture && <ActionButton label="Future" onClick={onMoveToFuture} />}
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
      className={`action-btn rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
        danger
          ? "text-red-700 hover:bg-red-50"
          : "text-baby-blue-dark hover:bg-baby-blue-light"
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
    <div className="trello-card trello-card-done px-2 py-1.5 text-xs text-muted-light line-through">
      <p className="break-words">{item.title}</p>
      {showDayLabel && item.dayKey && (
        <p className="mt-0.5 text-[10px] no-underline">
          {formatDisplayDate(item.dayKey).weekday}, {formatDisplayDate(item.dayKey).date}
        </p>
      )}
    </div>
  );
}
