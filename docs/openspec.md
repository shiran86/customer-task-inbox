# OpenSpec — Customer Task Inbox

Approved system specification. Source of truth for all implementation decisions.

---

## 1. Product Overview

### System Purpose

A task management inbox that displays customer-associated tasks from the Priority ERP system. The application fetches task data from the `CUSTNOTESA` OData entity, groups tasks by customer, and presents them in a two-panel inbox layout.

### User Goals

- View all tasks organized by customer in a clear, prioritized list
- Quickly identify high-priority and overdue tasks
- Create, edit, and delete tasks within a customer's thread
- Manage task lifecycle (status, assignment, priority, due dates)

### Scope

- Single-page application (React + TypeScript + Vite)
- Two-panel inbox layout (customer list + task thread)
- Full CRUD on CUSTNOTESA entity via Priority OData REST API
- Client-side grouping, sorting, and overdue computation
- Responsive: desktop two-panel, mobile single-panel with navigation
- No search, filtering, pagination, or real-time sync

---

## 2. User Experience

### Overall Layout

- Fixed two-panel split (not resizable)
- Left panel: customer list
- Right panel: task thread for selected customer
- No top-level header or toolbar
- Inner scroll only — both panels scroll independently; no window-level scroll

### Customer List (Left Panel)

**Row content:**
- Customer name (CUSTDES; fallback to CUSTNAME if missing)
- Open task count displayed in a circle
- Badge showing highest-priority open task (colored per priority config)
- Customers with no open tasks: green badge with text "No open tasks"

**Sorting (fixed):**
1. Primary: highest GAL_PRIORITY severity among open tasks (URGENT → HIGH → MEDIUM → LOW)
2. Secondary: alphabetical by customer name (ascending)
3. Customers with no open tasks sort below those with open tasks

**Interaction:**
- Click to select → loads task thread in right panel
- Selected state: primary color `#3B37E6` at 0.4 opacity
- Hover state: primary color `#3B37E6` at 0.2 opacity

**Scrolling:**
- Inner scroll at max page height

### Task Thread (Right Panel)

The thread displays ALL tasks of the selected customer (open and closed). Open/closed status only affects editability, counting, and overdue logic — not visibility.

**Ordering:**
- Chronological by CURDATE ascending (oldest at top, newest at bottom)

**Task card (read-only view) displays:**
- Subject (SUBJECT)
- Assigned-to (USERLOGIN)
- Start date (CURDATE) with optional time (STIME)
- Due date (TILLDATE) with optional time (ETIME) — highlighted in red if overdue
- GAL_PRIORITY badge (background color from priority config)
- GAL_CATEGORY badge (black border, white background, rounded)
- Status (STATDES)
- Trash icon (only for tasks in editable statuses)

**Overdue visual treatment:**
- Due date text colored red (per task, not entire card)

### Create Flow

- Compose area at the bottom of the thread
- "Add Item" button with + icon opens the edit form
- Required fields: SUBJECT, USERLOGIN, TILLDATE, GAL_PRIORITY, GAL_CATEGORY
- Status auto-set to `לביצוע` (not user-selectable on create)
- Submit button sends POST request
- Cancel button discards all input
- After successful create: full data re-fetch from API; both panels refresh
- On failure: user stays in form with error displayed; can fix and retry or cancel

### Edit Flow

- Clicking a task in editable status opens it for inline editing
- Non-editable tasks (בוצעה, מבוטלת): clicking does nothing
- All fields editable EXCEPT start date (CURDATE) — displayed read-only
- Submit button sends PATCH request
- Cancel button restores previous server values
- After successful edit: task card reverts to read-only view automatically
- On failure: user stays in form with error displayed; can fix and retry or cancel

### Delete Flow

- Trash icon on task card (only for editable-status tasks)
- Click opens confirmation dialog: "Are you sure?"
- On confirm: sends DELETE request
- Expected to fail (Priority restriction) — server error displayed to user

### Edit Mode Blocking

- When editing or creating, the entire UI outside the active form is blocked
- User must Cancel or Submit before interacting with anything else
- Prevents conflicting state and makes edit mode explicit

### Empty States

| Scenario | Behavior |
|----------|----------|
| No customer selected | Right panel: "Select Customer — nothing is selected" |
| Customer has no tasks | Right panel: empty state with compose area available |
| API returns no customers | Left panel: empty state message |

### Loading State

- A centered loader (spinner) with blocked/dimmed UI is shown during:
  - Initial data fetch on app load
  - Any CRUD operation (create, update, delete)
- UI is non-interactive while loading — prevents double-submits and conflicting actions
- Loader covers the entire screen (not per-panel)

### Error States

- Errors are displayed in a dialog (Priority Style dialog component)
- Error message extracted from OData response (`error.message`)
- Dialog is dismissible — user acknowledges and returns to previous state
- During edit/create: user stays in edit mode after dismissing error; can fix and retry or cancel

### Responsive Behavior (Mobile)

- Narrow screens: selecting a customer navigates to full-screen thread view
- Back button returns to customer list
- Sticky header at top: customer info from selected row (same component reused) + back button
- Compose area must work well in mobile layout

---

## 3. Data Model

### API Entity: CUSTNOTESA

| Field | Type | Description | Editable |
|-------|------|-------------|----------|
| CUSTNOTE | number | Primary key / unique identifier | No (system) |
| CUSTNAME | string | Customer code | No |
| CUSTDES | string | Customer display name | No |
| SUBJECT | string | Task subject (max 52 chars) | Yes |
| USERLOGIN | string | Assigned user | Yes |
| CURDATE | date | Start date | No (read-only in edit mode) |
| STIME | time | Start time | No (read-only in edit mode) |
| TILLDATE | date | Due date | Yes |
| ETIME | time | Due time | Yes |
| STATDES | string | Status description | Yes |
| GAL_PRIORITY | string | Priority level | Yes |
| GAL_CATEGORY | string | Task category | Yes |

### Type Separation

API response models and create/update request payload models must be defined as separate TypeScript types. The response includes read-only system fields (CUSTNOTE, CUSTNAME, CUSTDES, CURDATE, STIME); request payloads include only the fields the API expects for that operation.

### UI View Model: CustomerInbox

Produced by a transformation layer that groups the flat API response by customer:

```
CustomerInbox {
  customerCode: string        // CUSTNAME
  customerName: string        // CUSTDES (fallback: CUSTNAME)
  openTaskCount: number       // count of tasks in editable statuses
  highestPriority: Priority   // highest GAL_PRIORITY among open tasks (null if none)
  tasks: Task[]               // all tasks for this customer
}
```

### Reference Configuration Objects

#### Priority (GAL_PRIORITY)

| Value | Label | Severity | bgColor |
|-------|-------|----------|---------|
| LOW | Low | 1 | #E0E0E0 |
| MEDIUM | Medium | 2 | #FFF3CD |
| HIGH | High | 3 | #FFCC80 |
| URGENT | Urgent | 4 | #EF5350 |

Each entry includes: `value`, `label`, `severity` (numeric, for sorting), `bgColor` (hex, for badge rendering).

#### Category (GAL_CATEGORY)

| Value |
|-------|
| SUPPORT |
| SALES |
| BILLING |
| GENERAL |

Display: black border, white background, rounded badge. Same styling for all categories.

#### Status (STATDES)

| Value | Editable | Meaning |
|-------|----------|---------|
| טיוטא | Yes | Draft — task can be modified |
| לביצוע | Yes | To-do — task can be modified |
| בוצעה | No | Completed — read-only |
| מבוטלת | No | Cancelled — read-only |

Editable statuses define "open" tasks for counting and sorting purposes.

#### Assigned Users (USERLOGIN)

Hardcoded list (no API access to USERLIST):

| Value |
|-------|
| tabula |
| sima |
| nikita |
| yuval |
| master |
| galit |
| aviv |

---

## 4. API Integration

### Endpoint Structure

**Base URL pattern:**
```
${baseUrl}/odata/Priority/tab${prettyName}.ini/${companyName}
```

**Endpoints:**

| Operation | Method | Path |
|-----------|--------|------|
| Get all tasks | GET | /CUSTNOTESA |
| Get single task | GET | /CUSTNOTESA(${CUSTNOTE}) |
| Create task | POST | /CUSTNOTESA |
| Update task | PATCH | /CUSTNOTESA(${CUSTNOTE}) |
| Delete task | DELETE | /CUSTNOTESA(${CUSTNOTE}) |

### Authentication

- HTTP Basic Auth on every request
- Header: `Authorization: Basic ${base64(user:password)}`
- No token lifecycle, refresh, or session management

### Configuration

**Application config (TypeScript constants file):**
```
{
  baseUrl: string           // e.g. "https://s.priority-connect.online"
  prettyName: string        // e.g. "asd42"
  companyName: string       // e.g. "a270423"
  lang: string
  company: string
  tabuleIni: string
  primaryColor: "#3B37E6"
}
```

**Credentials (environment variables via `.env.local`):**
```
VITE_PRIORITY_USER=<username>
VITE_PRIORITY_PASSWORD=<password>
```

- Username and password are read from environment variables at runtime
- Credentials must NOT be hardcoded in source code
- `.env.local` must be listed in `.gitignore` (excluded from version control)
- Application accesses credentials via `import.meta.env.VITE_PRIORITY_USER` / `import.meta.env.VITE_PRIORITY_PASSWORD`

### Data Fetching Strategy

- Single GET request to `/CUSTNOTESA` fetches all tasks
- No pagination, no `$expand`, no subform access
- CUSTDES available directly on CUSTNOTESA entity
- Client-side transformation groups and sorts data

### Error Handling

**Expected error format (OData standard):**
```json
{
  "error": {
    "code": "404",
    "message": "The specified entity was not found",
    "target": "",
    "details": {},
    "innererror": {}
  }
}
```

- Extract `error.message` and display to user
- Every CRUD operation handles errors
- On failure during edit/create: user stays in edit mode with error visible

### Date Handling

- Use `date-fns` library for formatting and comparison
- Display format: `DD/MM/YY` (defined in constants)
- API date format: per Priority REST API conventions (reference: prioritysoftware.github.io/restapi)
- DatePicker component: deferred decision — will examine during CRUD milestone implementation; may use Priority Styles or a simpler alternative

---

## 5. Business Rules

### Customer Grouping

- All tasks from CUSTNOTESA are grouped by customer (CUSTDES/CUSTNAME)
- A dedicated transformation step produces `CustomerInbox[]` from the flat task list
- Implementation may use Map or any efficient data structure internally
- UI consumes a collection of `CustomerInbox` objects

### Sorting — Customer List

1. **Primary**: highest GAL_PRIORITY severity among open tasks (descending — URGENT first)
2. **Secondary**: alphabetical by customer name (ascending)
3. Customers with no open tasks sort below all customers with open tasks

### Sorting — Task Thread

- Chronological by CURDATE ascending (oldest at top, newest at bottom)

### Priority Logic

- Priority determines badge background color (from priority config object)
- Priority determines customer list sort order (via severity number)
- Priority does NOT affect task order within a thread (always chronological)
- Customer row shows the highest priority among its open tasks

### Category Display

- Black border, white background, rounded badge
- Same styling for all category values

### Overdue Calculation

- A task is overdue when: `TILLDATE < today AND status is editable`
- Date-only comparison (start-of-day granularity, no time component)
- Computed client-side
- Visual: due date text colored red
- Tasks with no TILLDATE: cannot be overdue, no due-date highlighting
- Tasks in non-editable statuses (בוצעה, מבוטלת): never overdue regardless of TILLDATE

### Status Behavior

- Editable statuses (task can be modified, clicked into edit mode): טיוטא, לביצוע
- Non-editable statuses (read-only, no interaction): בוצעה, מבוטלת
- Status is editable via select dropdown (within editable tasks)
- On create: status auto-set to `לביצוע`

### Open Task Counting

- Count only tasks in editable statuses (טיוטא, לביצוע)
- Displayed per customer in left panel (circle badge)
- Determines whether a customer shows a priority badge or "No open tasks" green badge

---

## 6. Architecture Decisions

### API Model vs UI Model Separation

- Raw CUSTNOTESA API response is never rendered directly
- A transformation layer converts flat task data into `CustomerInbox[]` view models
- Components consume view models, never raw API types
- API response types and create/update request payload types are defined separately

### Transformation Layer

- Single responsibility: group tasks by customer, compute derived fields (openTaskCount, highestPriority)
- May use Map or any efficient internal structure
- Pure function: API response in → `CustomerInbox[]` out

### Component Structure

- Each component in its own folder: `index.ts`, `types.ts`, `consts.ts`, `controller.ts` (if needed)
- Per frontend engineering guidelines: components render UI only, logic in hooks/controllers
- Shared edit form component used for both create (POST) and edit (PATCH)

### Component Reuse

- Customer row component reused in:
  - Left panel list item (desktop)
  - Sticky header in thread view (mobile)

### Configuration

- App configuration (baseUrl, prettyName, companyName, lang, company, tabuleIni, primaryColor) stored in a TypeScript constants file
- Credentials (user, password) stored in `.env.local` and read via `import.meta.env`
- Credentials must never be hardcoded in source; `.env.local` excluded from git

### State Management

**Approach:** React Context + custom hooks. No external state library.

**Stored state (Context):**

| State | Type | Purpose |
|-------|------|---------|
| Raw task collection | `CUSTNOTESA[]` | Single source of truth from API |
| Selected customer | `string \| null` (customerCode only) | Drives right panel content |
| Edit/create mode | `{ mode: 'idle' } \| { mode: 'editing', taskId: number } \| { mode: 'creating' }` | Blocks UI during edit |
| Loading | `boolean` | True during any API call (init fetch + CRUD operations) |

**Derived state (computed, never stored):**

| Derived | Mechanism | Source |
|---------|-----------|--------|
| `CustomerInbox[]` | `useMemo` over raw task collection | Transformation function groups, counts, sorts |
| Selected customer data | `useMemo` lookup by `selectedCustomerCode` from derived `CustomerInbox[]` | Always fresh after re-fetch |

**Temporary state (local to component):**

| State | Scope |
|-------|-------|
| Form field values during edit/create | `useState` inside form component — never lifted |

**Principles:**
- Raw `CUSTNOTESA[]` is the only stored data state — no derived state in Context
- `CustomerInbox[]` is produced by a memoized pure transformation function (re-runs only when raw array reference changes)
- Selected customer stored as identifier only — full object looked up from derived list to avoid stale references
- Form state stays local to the form component
- After mutations: `refresh()` re-fetches raw data → derived state recalculates automatically

**Why no external library:**
- Single data source, no normalized cache needed
- State pieces are independent (no complex atomic transitions)
- Three stored values + derivation is simple enough for Context + hooks

### Data Refresh Strategy

- After successful **create**: full re-fetch of all CUSTNOTESA data; derived state rebuilds automatically
- After successful **edit**: task card reverts to read-only; full re-fetch; derived state rebuilds
- After failed **delete**: show server error; no local state change
- `refresh()` function exposed from the data-fetching hook; called by form submission on success

---

## 7. Implementation Milestones

### Milestone 1 — Project Setup

**Goal:** Establish project foundation with types, configuration, and folder structure.

**Scope:**
- Folder structure per engineering guidelines
- TypeScript types for CUSTNOTESA API response
- TypeScript types for create/update request payloads (separate from response)
- TypeScript types for UI view models (CustomerInbox, Task)
- Configuration constants file (baseUrl, prettyName, companyName, lang, company, tabuleIni, primaryColor)
- `.env.local` file for credentials (VITE_PRIORITY_USER, VITE_PRIORITY_PASSWORD); `.env.local` in `.gitignore`
- Reference data constants (priorities with bgColor, categories, statuses with editable flag, users)
- date-fns dependency added

**Validation criteria:**
- Project compiles with `tsc --noEmit`
- All types are defined and importable
- Config constants are accessible; credentials read from `import.meta.env`
- `.env.local` excluded from git
- Folder structure matches engineering guidelines

---

### Milestone 2 — OData API Integration

**Goal:** Working REST service layer that communicates with Priority API.

**Scope:**
- Centralized `restService` module
- GET all tasks (CUSTNOTESA)
- POST (create task)
- PATCH (update task)
- DELETE (delete task)
- Basic Auth header construction
- Typed request/response for each operation
- Error handling: parse OData error format, surface `error.message`

**Validation criteria:**
- Can fetch tasks from real API and receive typed response
- Can create a task via POST and receive success/error
- Can update a task via PATCH
- Can attempt DELETE and handle expected error
- All error responses are parsed and message extracted

---

### Milestone 3 — Customer List (Left Panel)

**Goal:** Render grouped, sorted customer list from API data.

**Scope:**
- Transformation function: flat CUSTNOTESA[] → CustomerInbox[]
- Customer list component with inner scroll
- Row rendering: name, open task count (circle), priority badge
- "No open tasks" green badge for customers without open tasks
- Sorting: by highest priority severity, then alphabetically
- Selection state with primary color opacity
- Hover state
- Empty state when no customers

**Validation criteria:**
- Customers appear sorted correctly (URGENT customers first)
- Open task count is accurate (only editable statuses counted)
- Priority badge color matches config
- Selection/hover visual states work
- Inner scroll functions at max page height

---

### Milestone 4 — Task Thread (Right Panel)

**Goal:** Display task cards for selected customer in chronological order.

**Scope:**
- Thread component with inner scroll
- Task card read-only view: all specified fields rendered
- Chronological sorting (CURDATE ascending)
- Overdue highlighting: red due date text when TILLDATE < today and status is editable
- Priority badge with background color
- Category badge with black border, rounded
- Status display
- Empty placeholder when no customer selected
- Empty state when customer has no tasks
- Date formatting with date-fns (DD/MM/YY)

**Validation criteria:**
- Tasks display in correct chronological order
- Overdue dates are red; non-overdue dates are normal
- Priority/category badges render correctly
- Empty states display appropriately
- Date format is DD/MM/YY

---

### Milestone 5 — CRUD Implementation

**Goal:** Full create, edit, and delete functionality.

**Scope:**
- Shared edit form component (used by create and edit)
- Create: compose area at bottom with "Add Item" button; required fields; POST on submit; status defaults to לביצוע
- Edit: clicking editable task opens inline form; PATCH on submit; CURDATE read-only
- Delete: trash icon → confirmation dialog → DELETE request → show error
- Cancel button: restores previous values (edit) or clears form (create)
- Edit mode blocking: UI outside form is non-interactive during edit/create
- Full re-fetch after successful create or edit
- Error display from API on any failure

**Validation criteria:**
- Can create a task with all required fields; data refreshes on success
- Can edit an editable task; card reverts to read-only on success
- Cannot interact with non-editable tasks
- Delete shows confirmation, sends request, displays server error
- UI is blocked during edit/create mode
- Cancel restores previous state
- Errors from API display clearly

---

### Milestone 6 — UI Polish

**Goal:** Visual refinement, responsiveness, and accessibility.

**Scope:**
- Priority badge colors finalized and applied
- Overdue highlighting consistent
- Responsive layout: mobile single-panel with navigation and sticky header
- Back button on mobile thread view
- Customer row component reused as sticky header on mobile
- Loading states during API calls
- Accessible interactive elements (semantic HTML, keyboard support, ARIA labels)
- Ensure inner scroll works correctly on both panels at all viewport sizes

**Validation criteria:**
- Mobile: customer selection navigates to full-screen thread with back button
- Sticky header shows customer info on mobile thread view
- All interactive elements keyboard-accessible
- Loading states visible during data fetch
- No window-level scroll; panels scroll independently
- Visual consistency across priority/category/status badges

---

## 8. Open Questions / Risks

| # | Question | Impact | Resolution Plan |
|---|----------|--------|-----------------|
| 1 | Priority Styles DatePicker — what props does it need? How does it accept/return dates? | May need fallback date picker | Investigate during Milestone 5; use simple alternative if too complex |
| 2 | Exact date format returned by Priority REST API | Affects date parsing in service layer | Reference prioritysoftware.github.io/restapi; confirm with first real API call |
| 3 | STIME / ETIME format from API — separate fields or combined with date? | Affects display logic | Confirm during Milestone 2 with real API response |
| 4 | PATCH behavior — does Priority require all fields or only changed fields? | Affects update request construction | Test during Milestone 2; if all fields required, send full object |
| 5 | Exact green hex for "No open tasks" badge | Visual only | Define during Milestone 6 design pass |

---

**STATUS**: OpenSpec approved and complete. Ready for implementation upon explicit go-ahead.
