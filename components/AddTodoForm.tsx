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
    <form onSubmit={handleSubmit} className="mt-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className="trello-input w-full px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-light"
      />
    </form>
  );
}
