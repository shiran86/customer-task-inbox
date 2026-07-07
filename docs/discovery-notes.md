# Discovery Notes — Customer Task Inbox

Working document capturing all confirmed project understanding from the discovery phase.
This is NOT the final specification.

---

## 1. Product Overview

**What the system does:**
A task management inbox that displays customer-associated tasks from the Priority ERP system. Tasks are pulled from the `CUSTNOTESA` entity via Priority's REST/OData API.

**Main user goal:**
View all tasks grouped by customer in a two-panel inbox layout, manage tasks (create, edit, delete), and quickly identify high-priority and overdue items.

---

## 2. UI / UX Requirements

### Screen Structure

- **Two-panel layout** (fixed split, not resizable)
- **Left panel**: Customer list (scrollable, inner scroll — no window-level scroll)
- **Right panel**: Task thread for the selected customer
- **No top-level header/toolbar** needed for now
- **No search or filtering** functionality

### Default State (No Customer Selected)

- Right panel shows empty placeholder: "Select Customer — nothing is selected" (Outlook-style)

### Customer List (Left Panel)

**Each row shows:**
- Customer name (CUSTDES, fallback to CUSTNAME if CUSTDES missing)
- Count of open (editable-status) tasks — can be displayed in a circle
- Badge for the highest-priority open task (using priority color config)

**Sorting (fixed, not user-changeable):**
- Primary sort: by highest-priority open task (URGENT > HIGH > MEDIUM > LOW)
- Secondary sort: alphabetically by customer name
- If a customer has no open tasks, they sort below those with open tasks

**Selection:**
- Visual selected state using primary color `#3B37E6` at 0.4 opacity
- Hover state using primary color `#3B37E6` at 0.2 opacity

**Scrolling:**
- Inner scroll within the panel at max page height
- No window-level outer scroll

### Task Thread (Right Panel)

**Ordering:**
- Chronological: oldest (CURDATE) at top, newest at bottom

**Each task card shows:**
- Subject (SUBJECT field)
- Assigned-to (USERLOGIN field)
- Start date (CURDATE field) — with optional time (STIME)
- Due date (TILLDATE field) — with optional time (ETIME) — highlighted in red if overdue
- GAL_PRIORITY badge (using background color from priority config object)
- GAL_CATEGORY badge (round border with radius)
- Status (STATDES field)

**Task card interactions:**
- Header line with subject + pencil icon + trash icon on the side
- Pencil icon: switches from textual/read view to editable view (inputs, selects, date pickers)
- Trash icon: opens confirmation dialog ("Are you sure?") → sends DELETE request
- Edit mode only available for tasks in editable statuses

**Overdue visual treatment:**
- Color the due date text/row in red (per task, not entire card)
- Overdue = TILLDATE < today AND status is editable (not finished)

### Create Task

- Compose area at the bottom of the thread (always visible or via "Add Item" button with + icon)
- Required fields on create: SUBJECT, USERLOGIN, TILLDATE, GAL_PRIORITY, GAL_CATEGORY
- Status defaults to `לביצוע` (not user-selectable on create)
- Form includes Submit button (sends POST) and Cancel button (discards)
- Must work well on mobile too

### Edit Task

- Clicking a task opens it for inline editing (no separate pencil icon needed — the click itself enters edit mode)
- Non-editable tasks (בוצעה, מבוטלת): clicking does nothing — they remain in read-only view, no interaction
- All fields are editable EXCEPT start date (CURDATE) — which is read-only
- Same edit view component used for both edit and create (different submit behavior: PATCH vs POST)
- Only tasks in editable statuses can be clicked into edit mode; trash icon only shown for editable statuses
- Edit view includes Submit button (sends PATCH) and Cancel button (restores previous server values)
- Cancel discards all local changes and reverts to last-known server state
- After successful edit: task card automatically reverts to read-only view

### Delete Task

- Confirmation dialog: "Are you sure?"
- Sends DELETE request to API
- Will likely fail (Priority restriction) — show error from server to user

### Mobile Behavior

- On narrow screens: selecting a customer navigates to a full-screen thread view
- Back button to return to customer list
- Top row is sticky with the customer info from the clicked row (same component reused)
- Back button in the same sticky header line

### Edit Mode Blocking Behavior

- When a task is being edited or a new task is being created, the entire UI outside the active form is blocked
- User must either Submit (success → exit edit mode) or Cancel (discard → exit edit mode)
- This prevents conflicting state and makes it clear the user is in "edit mode"
- If submit fails (API error), user stays in edit mode with error displayed — can fix and retry or cancel

### After Successful Create

- Re-fetch all data from API (full refresh)
- Left panel and right panel update with fresh server state
- Ensures consistency (server may set defaults, modify data)

### Error Handling (UI)

- Every REST interaction shows errors from the server to the user
- During edit/create: user stays in edit mode until save succeeds or they fix the issue

---

## 3. Data Model

### Source Entity: CUSTNOTESA

Fields to fetch and use:

| Field | Type | Usage | Editable |
|-------|------|-------|----------|
| CUSTNOTE | number | Unique identifier / primary key | No (system) |
| CUSTNAME | string | Customer code (fallback display if CUSTDES missing) | No |
| CUSTDES | string | Customer display name | No |
| SUBJECT | string | Task subject/title (max 52 chars) | Yes |
| USERLOGIN | string | Assigned user | Yes |
| CURDATE | date | Start/creation date | Yes |
| STIME | time | Start time (optional display) | Yes |
| TILLDATE | date | Due date | Yes |
| ETIME | time | End/due time (optional display) | Yes |
| STATDES | string | Status description | Yes |
| GAL_PRIORITY | string | Priority level | Yes |
| GAL_CATEGORY | string | Task category | Yes |

### Derived UI Model: CustomerInbox

Produced by a transformation step that groups tasks by customer:

```
CustomerInbox {
  customerCode: string      // CUSTNAME
  customerName: string      // CUSTDES (fallback: CUSTNAME)
  openTaskCount: number     // count of tasks in editable statuses
  highestPriority: Priority // highest GAL_PRIORITY among open tasks
  tasks: Task[]             // all tasks for this customer
}
```

### Reference Data (Hardcoded)

#### Priority (GAL_PRIORITY)

Each priority has: severity (for sorting), bgColor (for badge), label

| Value | Label | Severity (sort order) | bgColor |
|-------|-------|----------------------|---------|
| LOW | Low | 1 (lowest) | #E0E0E0 |
| MEDIUM | Medium | 2 | #FFF3CD |
| HIGH | High | 3 | #FFCC80 |
| URGENT | Urgent | 4 (highest) | #EF5350 |

**No open tasks state:** When a customer has no open tasks, show a badge with text "No open tasks" on green background.

#### Category (GAL_CATEGORY)

| Value |
|-------|
| SUPPORT |
| SALES |
| BILLING |
| GENERAL |

Display: round border (black), white background, for all categories (no per-category colors).

#### Status (STATDES)

| Value | Editable (task can be modified) |
|-------|-------------------------------|
| טיוטא | Yes |
| לביצוע | Yes |
| בוצעה | No |
| מבוטלת | No |

#### Assigned Users (USERLOGIN)

Hardcoded list (no REST access to USERLIST):
- tabula
- sima
- nikita
- yuval
- master
- galit
- aviv

---

## 4. API / Integration

### REST/OData Configuration

**URL pattern:**
```
${baseUrl}/odata/Priority/tab${prettyName}.ini/${companyName}/CUSTNOTESA
```

**Single entity:**
```
${baseUrl}/odata/Priority/tab${prettyName}.ini/${companyName}/CUSTNOTESA(${CUSTNOTE})
```

**Configuration object** (app-level, holds all connection details):
- baseUrl (e.g., `https://s.priority-connect.online`)
- prettyName (e.g., `asd42`)
- companyName (e.g., `a270423`)
- user
- password
- lang
- company
- tabuleIni
- Primary color: `#3B37E6`

### Authentication

- HTTP Basic Auth
- Header: `Authorization: Basic base64(user:password)`
- No token lifecycle, no refresh, no session expiry handling

### Data Retrieval

- Fetch all tasks from `/CUSTNOTESA` (no pagination needed for now)
- No `$expand` needed — CUSTDES is available directly on CUSTNOTESA
- No subform access — CUSTNOTESA is a top-level entity
- No CORS issues expected

### Error Format

Standard OData error:
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

### REST Service Layer

- Centralized `restService` module
- All functions typed with request/response types
- Error handling on every call
- Show server error messages to the user

### Date Handling

- Use `date-fns` for formatting
- Display format: `DD/MM/YY` (Hebrew locale convention)
- Defined in constants file
- DatePicker: investigate Priority Styles DatePicker component (from `@priority-software/priority-style-react`); may use alternative if complex
- Reference for API date format: https://prioritysoftware.github.io/restapi

---

## 5. Business Rules

### Grouping

- Tasks grouped by customer (CUSTDES / CUSTNAME)
- A dedicated transformation step produces `CustomerInbox[]` from flat task list
- Implementation may use Map or any efficient structure internally

### Sorting — Customer List

1. Primary: highest GAL_PRIORITY severity among open tasks (descending — URGENT first)
2. Secondary: alphabetical by customer name (ascending)

### Sorting — Task Thread

- Chronological by CURDATE (ascending — oldest at top, newest at bottom)

### Priority Handling

- Priority determines badge color (from config object)
- Priority determines customer list sort order
- Priority does NOT affect task order within a thread

### Overdue Logic

- Overdue = `TILLDATE < today` AND task status is editable (טיוטא or לביצוע)
- Date-only comparison (start of day granularity)
- Visual: due date text colored red
- Tasks with no TILLDATE cannot be overdue
- Tasks in non-editable statuses (בוצעה, מבוטלת) are never overdue

### Status Behavior

- Editable statuses (task can be modified): טיוטא, לביצוע
- Non-editable statuses (task is read-only): בוצעה, מבוטלת
- Status is an editable field (user can change it via select dropdown)
- Editable statuses also define "open" tasks for counting and priority sorting

### Open Task Count

- Count only tasks in editable statuses (טיוטא, לביצוע)
- Displayed per customer in the left panel

---

## 6. Architecture Decisions

### Confirmed Decisions

1. **Separation of API model and UI model** — raw CUSTNOTESA response is transformed into `CustomerInbox[]` view model before rendering
2. **Component structure** — each component in its own folder with: index.ts, types.ts, consts.ts, controller.ts (if needed), per frontend engineering guidelines
3. **Hardcoded reference data** — priorities, categories, statuses, and user list are all defined as typed constants (no API fetches for these)
4. **Single REST call for all tasks** — fetch all CUSTNOTESA, then group/sort client-side
5. **Inner scroll only** — no window-level scrolling; both panels scroll independently
6. **Primary color system** — `#3B37E6` with opacity variants for hover (0.2) and selected (0.4)
7. **Blocking edit mode** — while editing/creating, entire UI outside active form is blocked; user must Cancel or Submit before doing anything else
8. **date-fns for dates** — format `DD/MM/YY`, investigate Priority Styles DatePicker
9. **Basic Auth** — no token management needed
10. **Config as TypeScript constants** — stored in a `.ts` constants file (not .env, not JSON)
11. **Re-fetch after create** — full data refresh from API after successful create to ensure consistency
12. **After successful edit** — task card reverts to read-only view automatically
13. **Shared edit view component** — same form used for create (POST) and edit (PATCH), differentiated by context

### Component Reuse

- Customer row component used in both:
  - Left panel list item (desktop)
  - Sticky header in thread view (mobile)

---

## 7. Open Questions / Risks

| # | Question | Status |
|---|----------|--------|
| 1 | Priority Styles DatePicker — how does it accept/return dates? What props does it need? | Investigate during implementation |
| 2 | What is the exact date format returned by Priority's REST API? | Reference: prioritysoftware.github.io/restapi — confirm during implementation |
| 3 | STIME / ETIME — what format do these come in from the API? Are they separate from date or combined? | Confirm during implementation |
| 4 | How does Priority REST handle PATCH — does it require all fields or only changed fields? | Confirm during implementation |
| 5 | Exact green bgColor hex for "No open tasks" badge | Define during design |

### Resolved (Round 2)

| Question | Resolution |
|----------|-----------|
| Priority bgColor values | Defined: LOW=#E0E0E0, MEDIUM=#FFF3CD, HIGH=#FFCC80, URGENT=#EF5350 |
| Category badge styling | Same for all: black border, white background, round |
| No open tasks badge | Green background, "No open tasks" text |
| Create task UI pattern | "Add Item" button with + icon → opens edit view with Submit/Cancel |
| Edit mode blocking | Entire UI blocked; Cancel (restore) or Submit (save) required |
| Config storage | TypeScript constants file |
| After successful create | Full re-fetch from API |
| After successful edit | Auto-revert to read-only view |

---

**STATUS**: Discovery notes updated with Round 2 answers. Awaiting review before OpenSpec generation.
