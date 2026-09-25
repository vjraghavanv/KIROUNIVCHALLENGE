import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { addTask, type Task } from "../src/todo.js";

// Generator for valid descriptions: strings guaranteed to contain
// at least one non-whitespace character (may include surrounding whitespace).
const validDescription = fc
  .string({ minLength: 1 })
  .filter((s) => s.trim().length > 0);

// Generator for a starting task list of arbitrary size.
const taskList = fc.array(
  fc.record<Task>({
    id: fc.string(),
    description: validDescription,
    completed: fc.boolean(),
  }),
);

describe("addTask property", () => {
  // Property: For every valid task description, adding the task
  // increases the number of tasks by exactly one.
  it("increases the task count by exactly one for a valid description", () => {
    fc.assert(
      fc.property(taskList, validDescription, (tasks, description) => {
        const before = tasks.length;
        const after = addTask(tasks, description).length;
        expect(after).toBe(before + 1);
      }),
      { numRuns: 100 },
    );
  });
});
