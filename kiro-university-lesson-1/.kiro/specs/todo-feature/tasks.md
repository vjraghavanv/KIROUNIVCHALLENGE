# Implementation Plan: Todo Feature

## Overview

This plan implements the Todo feature in TypeScript, following the layered design: a portable `TodoStore` logic layer with pure validation, and a thin UI layer that renders tasks and surfaces errors. Work proceeds bottom-up: types and validation first, then the store operations, then the UI, then integration. Property-based tests (using `fast-check`) validate each of the 6 correctness properties and are placed close to the code they verify.

## Tasks

- [ ] 1. Set up project structure and testing framework
  - Create source directory structure for the logic layer, UI layer, and tests
  - Set up TypeScript configuration and a test runner
  - Add `fast-check` as a dev dependency for property-based testing
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 2. Define core data models and types
  - [ ] 2.1 Create Task, TaskId, ValidationError, and AddResult types
    - Define `TaskId`, `Task` (`id`, `description`, `completed`), `ValidationError` (`code`, `message`), and the `AddResult` union
    - Define the `TodoStore` interface (`getTasks`, `addTask`, `completeTask`)
    - _Requirements: 1.1, 1.2, 3.1, 3.3_

- [ ] 3. Implement description validation
  - [ ] 3.1 Implement `validateDescription` pure function
    - Return `null` when the trimmed description has at least one character
    - Return a `ValidationError` with `code: "EMPTY_DESCRIPTION"` and a non-empty required-description message otherwise
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.2 Write property test for empty/whitespace rejection
    - **Feature: todo-feature, Property 5: Empty or whitespace-only descriptions are rejected**
    - **Validates: Requirements 3.1, 3.2**
    - Generate empty and whitespace-only strings; assert `addTask` returns a `ValidationError`, creates no `Task`, and leaves the list unchanged. Minimum 100 iterations.

  - [ ]* 3.3 Write property test for validation error message
    - **Feature: todo-feature, Property 6: Validation errors identify a required description**
    - **Validates: Requirements 3.3**
    - Generate invalid descriptions; assert every returned `ValidationError` carries a non-empty message identifying that a description is required. Minimum 100 iterations.

- [ ] 4. Implement TodoStore operations
  - [ ] 4.1 Implement store state and `getTasks`
    - Hold an ordered in-memory `Task_List`; `getTasks` returns a snapshot preserving insertion order
    - _Requirements: 1.3, 1.4, 2.3_

  - [ ] 4.2 Implement `addTask`
    - Validate via `validateDescription`; on invalid input return `{ ok: false, error }` without mutating state
    - On valid input, create a `Task` with a unique id, trimmed description, `completed: false`, append it, and return `{ ok: true, task }`
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

  - [ ]* 4.3 Write property test for adding a valid description
    - **Feature: todo-feature, Property 1: Adding a valid description appends the task**
    - **Validates: Requirements 1.1, 1.3, 1.4**
    - Generate a starting list and a description with at least one non-whitespace character; assert success, length increases by exactly one, and a task with the trimmed description is present. Minimum 100 iterations.

  - [ ]* 4.4 Write property test for new task completion status
    - **Feature: todo-feature, Property 2: New tasks start not completed**
    - **Validates: Requirements 1.2**
    - Generate valid descriptions; assert the created `Task` has `completed === false`. Minimum 100 iterations.

  - [ ] 4.5 Implement `completeTask`
    - Set the matching task's `completed` to `true`, keep list length and membership unchanged; treat unknown id as a safe no-op returning `undefined`; completion is idempotent
    - _Requirements: 2.1, 2.3_

  - [ ]* 4.6 Write property test for completing a task
    - **Feature: todo-feature, Property 3: Completing a task sets it completed and retains it**
    - **Validates: Requirements 2.1, 2.3**
    - Generate a list and pick an existing task; assert `completeTask` sets `completed` true, list length unchanged, task retained, and a second call yields the same result (idempotence). Minimum 100 iterations.

  - [ ]* 4.7 Write unit tests for store edge cases
    - Completing a nonexistent id leaves the list unchanged and returns `undefined`
    - Submitting `""` and `"   "` returns the exact validation message
    - _Requirements: 2.1, 3.1, 3.2, 3.3_

- [ ] 5. Checkpoint - Ensure all logic-layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement UI layer
  - [ ] 6.1 Render the Task_List with completed indicators
    - Render each task's description; when `completed` is `true`, include a completed indicator in the rendered representation
    - _Requirements: 1.4, 2.2_

  - [ ]* 6.2 Write property test for completed indicator rendering
    - **Feature: todo-feature, Property 4: Completed tasks render with a completed indicator**
    - **Validates: Requirements 2.2**
    - Generate tasks with `completed === true`; assert the rendered representation includes a completed indicator. Minimum 100 iterations.

  - [ ] 6.3 Wire add and complete intents to the store
    - On submit, call `addTask`; on a returned `ValidationError`, display the message inline and clear it on a subsequent success
    - On task selection, call `completeTask` and re-render from the store snapshot
    - _Requirements: 1.1, 1.4, 2.1, 3.3_

  - [ ]* 6.4 Write unit tests for UI submit flow
    - Successful submit clears a previously shown validation error
    - Invalid submit shows the required-description message
    - _Requirements: 1.4, 3.3_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Each task references specific requirements for traceability.
- Property tests use `fast-check`, run a minimum of 100 iterations, and are tagged with their design property.
- Unit tests cover concrete examples and edge cases that complement the property tests.
