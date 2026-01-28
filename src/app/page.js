"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Loading from localStorage on startup
  //using lazy initial state to avoid SSR issues
  const [tasks, setTasks] = useState(() => {
    // prevent SSR issues
    if (typeof window === "undefined") return [];
    // try to parse tasks from localStorage， prevents coruppted data
    try {
      const stored = localStorage.getItem("mini-ops-tasks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("mini-ops-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks based on the current filter state
  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.done);
    if (filter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filter]);

  // Add a new task with the current title
  function addTask(e) {
    //prevent the default form submission so the page doesn’t reload.
    e.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) return;

    // Create a new task object
    const newTask = {
      id:
        // Use crypto.randomUUID() if available, otherwise fallback to timestamp
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      title: trimmed,
      done: false,
    };

    // Add the new task to the list
    setTasks((prev) => [newTask, ...prev]);
    setTitle(""); //empty the input field
  }

  // Toggle the 'done' status of a task by its ID
  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  // Delete a task by its ID
  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // Start editing a task
  function startEdit(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  // Save the edited task title
  function saveEdit(id) {
    const trimmed = editingTitle.trim();
    if (!trimmed) return;

    // Update the task title
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
    );
    setEditingId(null);
    setEditingTitle("");
  }

  // Cancel editing
  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  // Render the main dashboard UI
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Mini Ops Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            A lightweight task tracker ( CRUD + filtering + localStorage ).
          </p>
          <div className="mt-2">
            <Link href="/about" className="text-sm text-slate-600 underline">
              About
            </Link>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <form onSubmit={addTask} className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Add a task…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              className="rounded-xl bg-indigo-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
              type="submit"
            >
              Add
            </button>
          </form>

          <div className="mt-4 flex gap-2 text-sm">
            {[
              ["all", "All"],
              ["active", "Active"],
              ["done", "Done"],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`rounded-xl px-3 py-1 ring-1 ring-slate-200 ${
                  filter === key ? "bg-indigo-900 text-white" : "bg-white"
                }`}
                onClick={() => setFilter(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <ul className="mt-4 space-y-2">
            {filteredTasks.length === 0 ? (
              <li className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                No tasks yet.
              </li>
            ) : (
              filteredTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleTask(t.id)}
                      className="h-4 w-4"
                    />
                    {editingId === t.id ? (
                      <input
                        className="rounded border border-slate-300 px-2 py-1 text-sm"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          t.done
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {t.title}
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-2">
                    {editingId === t.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(t.id)}
                          className="rounded px-2 py-1 text-xs text-white bg-slate-900"
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
                          type="button"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(t)}
                          className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                          type="button"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <footer className="mt-6 text-xs text-slate-500">
          Built as a personal project to practice shipping internal tools.
        </footer>
      </div>
    </main>
  );
}
