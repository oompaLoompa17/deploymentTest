"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
  created_at: string;
};

export default function TodoList({
  initialTodos,
  userId,
}: {
  initialTodos: Todo[];
  userId: string;
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("todos")
      .insert({ title: newTodo.trim(), user_id: userId })
      .select()
      .single();

    if (!error && data) {
      setTodos([data, ...todos]);
      setNewTodo("");
    }
    setLoading(false);
  }

  async function toggleTodo(id: string, completed: boolean) {
    const { error } = await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", id);

    if (!error) {
      setTodos(
        todos.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
      );
    }
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (!error) {
      setTodos(todos.filter((t) => t.id !== id));
    }
  }

  return (
    <div>
      <form onSubmit={addTodo} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          className="input"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !newTodo.trim()}>
          Add
        </button>
      </form>

      {todos.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem 0" }}>
          No todos yet. Add one above!
        </p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                style={{ width: "1.125rem", height: "1.125rem", accentColor: "#3b82f6" }}
              />
              <span style={{ flex: 1 }}>{todo.title}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="btn btn-ghost"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
