// Minimal Todo implementation for Lesson 4.

export interface Task {
  readonly id: string;
  readonly description: string;
  readonly completed: boolean;
}

/**
 * Returns true when a description is valid: it has at least one
 * non-whitespace character after trimming.
 */
export function isValidDescription(description: string): boolean {
  return description.trim().length > 0;
}

/**
 * Adds a task with the given description to the list.
 * Returns a new list; the input list is not mutated.
 * Throws on an invalid (empty/whitespace-only) description.
 */
export function addTask(tasks: readonly Task[], description: string): Task[] {
  if (!isValidDescription(description)) {
    throw new Error("A task description is required.");
  }
  const task: Task = {
    id: `task-${tasks.length}-${Date.now()}`,
    description: description.trim(),
    completed: false,
  };
  return [...tasks, task];
}
