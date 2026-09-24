# TypeScript Coding Standards

## Purpose

All TypeScript code in the Todo feature must follow consistent standards so the
codebase stays readable, type-safe, and testable. These rules apply to the
logic layer (`TodoStore`, validation), the UI layer, and their tests.

## Core Principles

- **Strict TypeScript.** Compile with `strict` mode on. No implicit `any`, no
  unchecked null access.
- **Explicit types at boundaries.** Annotate function parameters, return types,
  and exported values. Let inference handle obvious local variables.
- **Never use `any`.** Reach for precise types, `unknown` with narrowing, or
  generics instead.
- **Meaningful names.** Names describe intent, not implementation trivia.
- **Focused functions.** One responsibility per function. Extract when a
  function starts doing two things.
- **Test business logic.** Every rule in the logic layer has a test.

## Compiler Configuration

Enable strict checking in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Standards with Examples

### 1. Use strict, explicit types — avoid `any`

Prefer precise types on function signatures. When a value's type is genuinely
unknown, use `unknown` and narrow it, never `any`.

```typescript
// Preferred: explicit parameter and return types
function addTask(description: string): AddResult {
  const error = validateDescription(description);
  if (error) {
    return { ok: false, error };
  }
  return { ok: true, task: createTask(description) };
}

// Preferred: unknown + narrowing when the shape is uncertain
function parseTask(input: unknown): Task | null {
  if (
    typeof input === "object" &&
    input !== null &&
    "id" in input &&
    "description" in input
  ) {
    return input as Task;
  }
  return null;
}
```

```typescript
// Discouraged: any erases all type safety
function addTask(description: any): any {
  // no compiler help, no autocomplete, silent bugs
  return { ok: true, task: description };
}

// Discouraged: implicit any on parameters
function completeTask(id) {
  // 'id' is implicitly any
}
```

### 2. Prefer explicit types at boundaries

Annotate exported functions and public interfaces. Local inference is fine when
the type is obvious from the right-hand side.

```typescript
// Preferred: explicit return type on exported API
export function getTasks(): readonly Task[] {
  return [...tasks];
}

// Preferred: obvious local inference, no annotation needed
const trimmed = description.trim();
const isEmpty = trimmed.length === 0;
```

```typescript
// Discouraged: relying on inference for a public return type
export function getTasks() {
  // callers can't see the contract at a glance;
  // an accidental change silently alters the public type
  return tasks;
}
```

### 3. Model states with precise types

Use unions and literal types instead of loose booleans or strings.

```typescript
// Preferred: discriminated union makes invalid states unrepresentable
type AddResult =
  | { ok: true; task: Task }
  | { ok: false; error: ValidationError };

interface ValidationError {
  code: "EMPTY_DESCRIPTION";
  message: string;
}
```

```typescript
// Discouraged: loose shape allows contradictory states
interface AddResult {
  ok: boolean;
  task?: Task;        // present sometimes
  error?: string;     // present other times — compiler can't enforce which
}
```

### 4. Use meaningful names

Names should reveal intent. Avoid abbreviations and single letters except for
short-lived loop indices.

```typescript
// Preferred
function markTaskCompleted(taskId: TaskId): Task | undefined { /* ... */ }
const activeTasks = tasks.filter((task) => !task.completed);
```

```typescript
// Discouraged
function mtc(x: string): any { /* ... */ }   // unclear name and type
const at = tasks.filter((t) => !t.c);        // cryptic property and vars
```

### 5. Keep functions focused

Each function does one thing. Pull validation, creation, and mutation apart.

```typescript
// Preferred: small, single-purpose functions compose clearly
function validateDescription(description: string): ValidationError | null {
  return description.trim().length === 0
    ? { code: "EMPTY_DESCRIPTION", message: "A task description is required." }
    : null;
}

function createTask(description: string): Task {
  return { id: generateId(), description: description.trim(), completed: false };
}
```

```typescript
// Discouraged: one function validates, creates, mutates, and renders
function handleTask(description: string, list: Task[], dom: HTMLElement) {
  if (description.trim().length === 0) {
    dom.textContent = "error";
    return;
  }
  const task = { id: Math.random().toString(), description, completed: false };
  list.push(task);
  dom.innerHTML += `<li>${task.description}</li>`;
  // too many responsibilities; hard to test and reuse
}
```

### 6. Test business logic

Every logic-layer rule gets a test. Prefer property-based tests for universal
rules and unit tests for concrete examples and edge cases.

```typescript
// Preferred: a focused unit test for a specific rule
test("addTask rejects a whitespace-only description", () => {
  const store = createTodoStore();
  const result = store.addTask("   ");

  expect(result.ok).toBe(false);
  expect(store.getTasks()).toHaveLength(0);
});
```

```typescript
// Discouraged: shipping validation logic with no test coverage,
// or only testing the happy path while error paths go unverified.
```

## Additional Conventions

- Prefer `readonly` and immutable updates over in-place mutation of shared
  state; return new arrays/objects from logic-layer reads.
- Use `const` by default; use `let` only when reassignment is required.
- Handle expected failures with typed return values (e.g., `AddResult`) rather
  than throwing exceptions for normal control flow.
- Keep the logic layer free of UI/DOM concerns so it stays unit-testable.
