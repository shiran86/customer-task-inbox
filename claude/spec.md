# Project Specification — Customer Task Inbox

---

## OpenSpec

### 1. Product Overview

A task management inbox that displays customer-associated tasks (notes/activities) from the Priority ERP system. The interface presents a two-panel layout where users can browse customers and manage their associated tasks in a threaded conversation-style view.

The system integrates with Priority's OData API to read and write task data stored in the `CUSTNOTESA` entity.

---

### 2. UI / UX Flow

**Layout**: Two-panel inbox design

| Left Panel | Right Panel |
|------------|-------------|
| Customer list | Task thread for selected customer |
| Shows customer name + task summary | Shows all tasks for that customer |
| Indicates unread/overdue/priority | Chronological thread (oldest → newest) |
| Clickable to select | Supports CRUD operations |

**Interaction Flow**:
1. User opens the app → sees customer list (left panel)
2. User clicks a customer → right panel loads that customer's task thread
3. Tasks are displayed chronologically (oldest at top, newest at bottom)
4. User can create, read, update, and delete tasks within the thread

---

### 3. Data Model

#### CUSTNOTESA (Customer Notes/Tasks)

Primary entity for task data. Fields include (based on Priority OData conventions):

| Field | Type | Description |
|-------|------|-------------|
| CUSTNAME | string | Customer identifier (FK to CUSTOMERS) |
| TEXT | string | Task/note content |
| CURDATE | date | Creation/entry date |
| EXPIRYDATE | date | Due date |
| GAL_PRIORITY | string/number | Priority level |
| GAL_CATEGORY | string/number | Task category |
| STATUSDES | string | Status description |
| OWNERLOGIN | string | Assigned user |

#### GAL_PRIORITY (Priority Levels)

Defines urgency/importance of a task. Expected values TBD (e.g., High / Medium / Low or numeric scale).

#### GAL_CATEGORY (Task Categories)

Defines the type/classification of a task. Expected values TBD.

---

### 4. API Integration

**Protocol**: OData v4 (Priority ERP standard)

**Assumptions**:
- Base URL provided via environment configuration
- Authentication handled via token/session (mechanism TBD)
- CUSTNOTESA entity is queryable with `$filter`, `$orderby`, `$select`, `$expand`
- Subforms may be accessed via nested entity paths (e.g., `/CUSTOMERS('CUST001')/CUSTNOTESA_SUBFORM`)
- CRUD operations available via standard OData verbs (GET, POST, PATCH, DELETE)

**Constraints**:
- API may have rate limits
- Large datasets require pagination (`$top`, `$skip`)
- Field names follow Priority naming conventions (ALL_CAPS)
- Date format follows OData/Priority conventions

---

### 5. Business Rules

#### 5.1 Tasks Grouped by Customer (Threaded View)
- All tasks belonging to a single customer appear together in a thread
- The thread represents a chronological history of interactions/tasks for that customer

#### 5.2 Chronological Sorting
- Tasks within a thread are sorted oldest → newest (ascending by CURDATE)
- Most recent task appears at the bottom of the thread

#### 5.3 Priority Handling (GAL_PRIORITY)
- Tasks with higher priority are visually distinguished (badge, color, icon — TBD)
- Priority value determines visual treatment, not sort order within thread
- Sort order remains chronological regardless of priority

#### 5.4 Overdue Logic
- A task is overdue when: `EXPIRYDATE < today AND status is not complete`
- Overdue tasks receive visual highlighting (color/badge — TBD)
- Overdue state is computed client-side from EXPIRYDATE and current date

#### 5.5 Status Behavior
- Status reflects the lifecycle of a task (e.g., Open, In Progress, Complete)
- Exact status values depend on STATUSDES field options from the API
- Completed tasks are not overdue regardless of EXPIRYDATE

---

### 6. Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Customer with zero tasks | Right panel shows empty state with option to create first task |
| Missing EXPIRYDATE | Task cannot be overdue; no due-date indicator shown |
| Missing GAL_PRIORITY | Default/neutral priority styling applied |
| Missing GAL_CATEGORY | Task displays without category badge |
| API timeout / network error | User-visible error state with retry option |
| API returns empty customer list | Left panel shows empty state message |
| Very long task text | Text truncation with expand/collapse or scroll |
| Concurrent edits | Last-write-wins (no real-time sync assumed) |

---

### 7. Open Questions / Risks

| # | Question | Impact |
|---|----------|--------|
| 1 | What are the exact GAL_PRIORITY values and their display names? | Affects badge/color logic |
| 2 | What are the exact GAL_CATEGORY values? | Affects category filtering/display |
| 3 | What authentication mechanism is used? (Basic, OAuth, session cookie?) | Affects API service layer |
| 4 | Is CUSTNOTESA a subform of CUSTOMERS or a top-level entity? | Affects query structure |
| 5 | What are the valid STATUSDES values? Which means "complete"? | Affects overdue logic |
| 6 | Is pagination needed? What's the expected data volume? | Affects list rendering strategy |
| 7 | Should the customer list show task counts or latest task preview? | Affects left panel data requirements |
| 8 | Is there a search/filter requirement for customers or tasks? | Affects UI complexity |
| 9 | Are there permission/role constraints on who can edit/delete? | Affects CRUD availability |
| 10 | What happens when a task is deleted? Soft delete or hard delete? | Affects API call and optimistic UI |

---

## Milestones

Each milestone is independently implementable and testable.

### Milestone 1 — Project Setup
- Development environment configured (Vite + React + TypeScript)
- Folder structure established per engineering guidelines
- API configuration (base URL, auth placeholders)
- Type definitions for core data model (CUSTNOTESA, GAL_PRIORITY, GAL_CATEGORY)

### Milestone 2 — OData API Integration
- API service layer with typed request/response
- CRUD operations for CUSTNOTESA (GET, POST, PATCH, DELETE)
- Error handling and loading states
- Environment-based configuration

### Milestone 3 — Customer List (Left Panel)
- Fetch and display list of customers with tasks
- Show summary info (task count, latest activity, priority indicators)
- Selection state management
- Empty state handling

### Milestone 4 — Task Thread (Right Panel)
- Display tasks for selected customer in chronological order
- Threaded conversation-style layout
- Priority badges and overdue highlighting
- Status display
- Empty state for customers with no tasks

### Milestone 5 — CRUD Operations
- Create new task within a customer thread
- Edit existing task (inline or modal — TBD)
- Delete task with confirmation
- Optimistic updates with rollback on failure

### Milestone 6 — UI Polish
- Priority badges with appropriate colors
- Overdue highlighting (visual distinction)
- Responsive layout (desktop-first, mobile-friendly)
- Loading skeletons / spinners
- Accessibility pass (keyboard nav, ARIA labels, screen reader support)

---

**STATUS**: OpenSpec awaiting review. Do not proceed to architecture or implementation until approved.
