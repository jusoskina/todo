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
      <div className="mx-auto max-w-lg flex-1 p-3 pb-6">
        <p className="text-sm text-muted">No completed history yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg flex-1 space-y-3 p-3 pb-6">
      <p className="text-sm text-muted">
        Read-only archive of completed items from previous weeks.
      </p>
      {[...weeks.entries()].map(([weekKey, weekItems]) => (
        <section key={weekKey} className="trello-column p-2.5">
          <h2 className="mb-2 text-sm font-bold text-foreground">
            {formatWeekRange(weekKey)}
          </h2>
          <div className="flex flex-col gap-1.5">
            {weekItems.map((item) => (
              <StaticTodoItemCard key={item.id} item={item} showDayLabel />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
