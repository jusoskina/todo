"use client";

import { useTodos } from "@/context/TodoProvider";
import { formatWeekRange } from "@/lib/dates";
import { archivedWeeks } from "@/lib/todo-utils";
import { StaticTodoItemCard } from "@/components/TodoItemCard";

export function HistoryBoard() {
  const { items } = useTodos();
  const weeks = archivedWeeks(items);

  if (weeks.size === 0) {
    return (
      <div className="mx-auto max-w-2xl flex-1 p-4">
        <p className="text-sm text-zinc-500">No completed history yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 space-y-6 p-4">
      <p className="text-sm text-zinc-500">
        Read-only archive of completed items from previous weeks.
      </p>
      {[...weeks.entries()].map(([weekKey, weekItems]) => (
        <section
          key={weekKey}
          className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800"
        >
          <h2 className="mb-1.5 text-xs font-semibold">{formatWeekRange(weekKey)}</h2>
          <div className="flex flex-col gap-1">
            {weekItems.map((item) => (
              <StaticTodoItemCard key={item.id} item={item} showDayLabel />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
