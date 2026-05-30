"use client";

import { useState } from "react";

interface AddTodoFormProps {
  placeholder: string;
  onAdd: (title: string) => void;
}

export function AddTodoForm({ placeholder, onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-1 text-xs outline-none ring-zinc-400 focus:ring-1 dark:border-zinc-700 dark:bg-zinc-900"
      />
    </form>
  );
}
