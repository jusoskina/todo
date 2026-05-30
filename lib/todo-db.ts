import type { ItemLocation as PrismaItemLocation } from "@prisma/client";

import { db } from "@/lib/db";
import type { AppState, ItemLocation, TodoItem } from "@/lib/types";

function toDbLocation(location: ItemLocation): PrismaItemLocation {
  if (location === "next-week") return "next_week";
  return location;
}

function fromDbLocation(location: PrismaItemLocation): ItemLocation {
  if (location === "next_week") return "next-week";
  return location;
}

function rowToItem(row: {
  id: string;
  title: string;
  done: boolean;
  location: PrismaItemLocation;
  weekKey: string | null;
  dayKey: string | null;
  order: number;
  rolledOver: boolean;
  createdAt: Date;
  completedAt: Date | null;
}): TodoItem {
  return {
    id: row.id,
    title: row.title,
    done: row.done,
    location: fromDbLocation(row.location),
    weekKey: row.weekKey,
    dayKey: row.dayKey,
    order: row.order,
    rolledOver: row.rolledOver,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

export async function loadUserAppState(userId: string): Promise<AppState> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      lastProcessedDayKey: true,
      todoItems: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!user) {
    return { items: [], lastProcessedDayKey: "" };
  }

  return {
    items: user.todoItems.map(rowToItem),
    lastProcessedDayKey: user.lastProcessedDayKey,
  };
}

export async function saveUserAppState(userId: string, state: AppState): Promise<void> {
  const itemIds = state.items.map((item) => item.id);

  await db.$transaction(async (tx) => {
    await tx.todoItem.deleteMany({
      where: {
        userId,
        ...(itemIds.length > 0 ? { id: { notIn: itemIds } } : {}),
      },
    });

    for (const item of state.items) {
      await tx.todoItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          userId,
          title: item.title,
          done: item.done,
          location: toDbLocation(item.location),
          weekKey: item.weekKey,
          dayKey: item.dayKey,
          order: item.order,
          rolledOver: item.rolledOver,
          createdAt: new Date(item.createdAt),
          completedAt: item.completedAt ? new Date(item.completedAt) : null,
        },
        update: {
          title: item.title,
          done: item.done,
          location: toDbLocation(item.location),
          weekKey: item.weekKey,
          dayKey: item.dayKey,
          order: item.order,
          rolledOver: item.rolledOver,
          completedAt: item.completedAt ? new Date(item.completedAt) : null,
        },
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: { lastProcessedDayKey: state.lastProcessedDayKey },
    });
  });
}
