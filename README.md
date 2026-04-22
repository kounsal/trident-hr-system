# HR Workflow Designer

A polished React + TypeScript prototype for the Tredence Full Stack Engineering case study.

This project lets an HR admin visually design internal workflows such as onboarding, leave approval, and document verification. It combines a React Flow canvas, typed node configuration forms, mock API integration, live graph validation, and a workflow sandbox for execution testing.

## What This Prototype Covers

- Drag-and-drop workflow builder with React Flow
- Five configurable node types:
  - Start
  - Task
  - Approval
  - Automated Step
  - End
- Dynamic node editing panel with controlled forms
- Mock API layer for automation catalog and workflow simulation
- Live workflow validation on every graph edit
- Sandbox panel for execution replay and JSON inspection
- Responsive UI with desktop drag/drop and mobile-friendly quick-add flow

## Design Direction

The interface uses an `editorial control-room` aesthetic instead of a generic admin dashboard.

- Warm drafting-paper side panels
- Dark workflow stage for the canvas
- Technical mono labels with a bold display heading system
- Distinctive node cards that feel like operational workflow slips

Goal: make the product feel memorable, intentional, and still practical for dense workflow work.

## Tech Stack

- `Vite`
- `React 19`
- `TypeScript`
- `@xyflow/react` for workflow canvas interactions
- `MSW` for browser-level mock APIs
- `Zod` for API payload validation
- `Vitest` for focused unit tests
- `Lucide React` for icons

## Core User Flow

1. Add nodes from the left palette by drag-drop or quick add.
2. Connect nodes on the canvas to create a workflow path.
3. Select any node to edit its configuration in the inspector.
4. Review live validation feedback for graph issues.
5. Run the sandbox simulation to serialize workflow JSON and replay execution steps.

## Node Types

### Start Node

- Start title
- Optional metadata key-value pairs

### Task Node

- Title
- Description
- Assignee
- Due date
- Optional custom fields

### Approval Node

- Title
- Approver role
- Auto-approve threshold

### Automated Step Node

- Title
- Action selection from mock API
- Dynamic action parameters based on selected automation

### End Node

- End message
- Summary flag

## Mock API Endpoints

The app uses MSW so the frontend talks to actual HTTP endpoints without needing a real backend.

### `GET /automations`

Returns available automated actions, for example:

- `send_email`
- `generate_doc`
- `provision_access`
- `create_ticket`

Each action includes:

- `id`
- `label`
- `params`
- `description`

### `POST /simulate`

Accepts serialized workflow JSON and returns:

- workflow summary
- execution timestamps
- ordered step-by-step log

If the workflow fails structural validation, the endpoint returns an error response instead of a simulation result.

## Validation Rules

The workflow is validated continuously while editing.

Implemented checks include:

- exactly one start node
- at least one end node
- no incoming edges into the start node
- no outgoing edges from end nodes
- all non-start nodes must have an incoming edge
- all non-end nodes must have an outgoing edge
- no self-loops
- no cycles
- no unreachable nodes from the start node
- required field checks for node configuration

## Project Structure

```text
src/
  features/workflow-designer/
    api/           # fetch client + zod contracts
    components/    # canvas, sidebar, inspector, sandbox, node cards
    hooks/         # workflow state + automation loading
    mocks/         # MSW handlers and seed data
    types/         # workflow domain types
    utils/         # serialization, validation, simulation helpers
  test/            # global test setup
```

## Architecture Notes

### Why Vite

This case study is frontend-first and time-boxed. `Vite` gives the fastest path to a clean TypeScript React setup without adding backend or SSR complexity that the brief does not require.

### Why MSW

Using `MSW` keeps the API boundary realistic:

- frontend still uses `fetch`
- contracts stay explicit
- future backend replacement is easier

### Why custom workflow hook

Workflow graph behavior lives in a dedicated hook so canvas logic, validation, and serialization remain separate from presentation code.

### Why Zod

Zod validates API payloads and keeps mock responses aligned with frontend expectations.

## Getting Started

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Available Scripts

### Run dev server

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Type-check

```bash
npm run typecheck
```

### Run tests

```bash
npm run test
```

### Build production bundle

```bash
npm run build
```

## Run With Docker

### Build image

```bash
docker build -t trident-workflow-designer .
```

### Run container

```bash
docker run --rm -p 8080:80 trident-workflow-designer
```

Then open `http://localhost:8080`.

### Notes

- Uses a multi-stage Docker build
- Builds the Vite app in a Node image
- Serves the final static bundle with Nginx
- Includes SPA fallback routing via `try_files`

## Test Coverage

Focused tests currently cover:

- workflow validation behavior
- simulation ordering and response generation

This is intentionally lightweight for a prototype, but enough to protect the core reasoning layer behind the UI.

## Assumptions

- No authentication required
- No backend persistence required
- Workflows are treated as acyclic for simulation
- Simulation is deterministic and linearized for readability
- Single start node model is enforced

## Tradeoffs

- State is local to the app instead of persisted remotely
- Simulation is mock-driven, not connected to real HR systems
- Validation is strong for structure, but not yet a full business-rules engine
- Prototype favors architectural clarity and working behavior over enterprise completeness

## If I Had More Time

- Import/export workflow JSON from file
- Undo/redo history
- Inline edge-level validation markers
- Auto-layout support
- Workflow templates
- Persistence layer
- Richer branching simulation UI
- Storybook or component docs for the design system

## Submission Notes

This repository is intended to demonstrate:

- React and TypeScript depth
- React Flow proficiency
- modular component architecture
- typed API abstraction
- dynamic form handling
- structured validation and simulation logic
- product-level frontend design judgment
