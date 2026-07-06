# Frontend Engineering Guidelines

Constraints and principles that govern ALL implementation decisions in this project. These are rules, not suggestions. They apply after spec approval, during every implementation milestone.

---

## 1. Architecture — Layered Separation

| Layer | Responsibility | Cannot Contain |
|-------|---------------|----------------|
| Component | Render UI, forward events | Business logic, API calls |
| Hook/Controller | Orchestrate flows, manage side effects, decisions | JSX, rendering |
| Service | Data fetching only | Transformations, business logic |
| Helper/Utils | Pure transformations | API calls, side effects, state |
| Types | Interfaces, type definitions | Implementation code |

**Test**: If a component has `if/else` based on domain data (not UI state like `isLoading`), the logic is misplaced.

---

## 2. Folder Structure

```
src/
├── features/           # Feature modules (one per domain concept)
│   └── FeatureName/
│       ├── FeatureName.tsx      # Component (UI only)
│       ├── controller.ts        # Actions/handlers (when logic is complex)
│       ├── types.ts             # Props, interfaces, types
│       ├── hooks/               # Feature-specific hooks
│       ├── components/          # Sub-components private to feature
│       ├── styles.module.css    # Scoped styles
│       ├── index.ts             # Public exports only
│       └── __tests__/
├── services/           # API service layer
├── shared/             # Shared components, hooks, utils
│   ├── components/
│   ├── hooks/
│   └── utils/
├── types/              # Global type definitions
└── config/             # Environment, constants
```

**Rules:**
- Folder name matches main file name
- `index.ts` exports only the main module (types imported directly from `./types`)
- Feature folders are self-contained. Cross-feature imports go through `shared/`
- Co-locate tests with the code they test
- Services in `services/`, helpers in `helpers/` or co-located

---

## 3. TypeScript Strictness

- **No `any`** — use `unknown` + type guards if type is truly unknown
- **No `as T` casts** on discriminated unions — use narrowing or switch statements
- **Explicit return types** on all exported functions
- **Union types over enums** for simple discriminators: `type Status = 'idle' | 'loading' | 'error'`
- **Nullish coalescing `??`** not `||` when `0`, `""`, or `false` are valid values
- **No `Function` type** — use specific signatures: `(data: T) => void`
- **No dead props** — every prop must be used
- **Props interfaces end with `Props`**
- **Props optionality must match reality** — if the component needs it, make it required
- **New props appended at end** of existing interfaces
- **Async callbacks**: type as `() => Promise<void> | void` when the callback may be async

---

## 4. React Patterns

### Never Do
- Inline components inside render (causes remount every render)
- Ref mutations during render
- `setState` during render
- API calls during render
- `useReducer` + external state manager on same component

### Hook Dependencies
- All captured values must be in dependency arrays (stale closures are real bugs)
- Empty deps `[]` only for true "mount-only" effects — verify the intent
- If two effects share a dependency and both write the same state — merge them

### useCallback/useMemo
- **Use** when function is passed as prop to memoized child, or in another hook's dep array
- **Don't use** for internal-only functions or trivial delegations
- No premature optimization — measure before adding complexity

### useMemo Purity
- `useMemo` must be pure. No side effects, no state updates. Move those to `useEffect`.

---

## 5. useEffect and Async Correctness

### Cleanup Required For:
- Timers (`clearInterval`, `clearTimeout`)
- Event listeners (`removeEventListener`)
- Subscriptions (`.unsubscribe()`, dispose)
- Fetch requests (`AbortController`)

### Rules:
- Fetch effects use `AbortController` — abort on unmount or dependency change
- Never call `setState` on an unmounted component. Use cleanup flags or abort signals.
- All exit paths must call cleanup — save, cancel, close, programmatic close, error path
- Explicit cleanup before routing — don't rely on unmount timing

---

## 6. State Management

- **Re-lookup references after async mutations** — captured references may be stale
- **Optimistic updates require rollback** — `try/catch/finally`, not fire-and-forget
- **Reset local state when context changes** (e.g., switching selected customer)
- **Validate cache keys** before returning cached data — context may have shifted
- **Avoid derived state that duplicates source-of-truth** — compute on render instead
- **Equality check outside setState** when current value is already in scope
- **Sync ALL dependent stores/caches** after undo/cancel/revert operations

---

## 7. Error Handling

- **No empty catch blocks** — at minimum `console.error` with context
- **No `void asyncFn()`** — handle rejections with `.catch()` or try/catch
- **User-facing errors** must produce visible feedback (toast, error state, message)
- **Distinguish error state from empty state** — separate UI for each
- **Validate prerequisites before irreversible operations** — don't fire-and-check-later
- **Gate input clearing by save success** — only clear after confirmed save
- **catch blocks must set `success = false`** when function returns success indicators
- API errors are typed and handled per-status-code where behavior differs

---

## 8. Async Patterns

- **Synchronous ref guard for re-entry prevention** — `useRef` boolean is instant, `useState` is batched
- **Cancel flows undo, not save** — cancel means "discard my changes"
- **No double-undo** — check if cleanup already handles it internally

---

## 9. Component Design

- **Components own their own layout** — don't wrap children in styling divs in parent
- **Extract render helpers to real components** — if a helper returns JSX in `.map()` with closures, make it a proper component
- **Single wrapped export** — don't export both unwrapped and wrapped versions
- **Stabilize callback props** — no inline arrows in JSX for consumers that use them in dep arrays
- **Click handlers per item, not on parent container** — in `.map()`, put onClick on each item wrapper
- **Focused components over mega-components** — if you need 1-2 features from a large component, create a focused one
- **No optional props with store/context fallbacks** — make required data explicit
- **No positional props drilled through intermediaries** — resolve at source, pass declarative flags

---

## 10. Performance and Rendering

- No inline component definitions inside render (causes remount every render)
- Avoid re-renders from unstable references (new objects/arrays created each render)
- Lists with many items should consider virtualization
- No premature optimization — measure first, then optimize

---

## 11. Naming Conventions

- **Boolean properties**: `is*`/`has*`/`should*`/`can*`/`was*`/`will*` prefix
- **Boolean-returning functions**: `can*`/`should*`/`is*` (not `on*` which implies void handler)
- **Names describe behavior, not feature context** — don't embed domain terms unless truly exclusive
- **No redundant null guards** — pick either `&&` or `?.`, not both
- **Magic strings → constants** when used 2+ times or as discriminators

---

## 12. CSS / Styling

- **CSS Modules** (`styles.module.css/scss`) — no global styles for components
- **No inline styles** in JSX — exception: truly dynamic values (calculated positions)
- **Use `classnames` library** for conditional classes — not template literal ternaries
- **Extract classNames result** into a named variable, don't inline in JSX
- **Media queries at end** of file, with explicit resets of desktop properties
- **CSS variables/tokens** — no hardcoded hex colors
- **Base styles first**, responsive overrides last

---

## 13. Code Style

- **Early returns** over deep nesting
- **Declarative array methods** (`.map`, `.filter`) over imperative loops where intent is clearer
- **No inline anonymous functions** in configuration callbacks — extract and name them
- **Object lookup** over ternary/if chains for value mapping
- **`Set` for membership checks** — O(1) vs `.some()` O(n)
- **Static imports only** — no dynamic `import()` inside functions (exception: React.lazy for route-level splitting)
- **Separate constants for separate purposes** — don't reuse a constant in a context with different semantics
- **Handler functions receive cleanup callbacks** — configuration just forwards parameters

---

## 14. Accessibility

- **Semantic HTML** — use `<button>`, `<a>`, `<input>` not styled `<div>`
- **Custom interactive elements** need: `role`, `tabIndex={0}`, keyboard handlers (Enter + Space)
- **Form inputs** have associated labels (visible or `aria-label`)
- **Error messages** connected to inputs via `aria-describedby`
- **Color is never the sole indicator** — combine with icons, text, or patterns
- **Focus management** after navigation or modal open/close
- **Use design system components** over raw HTML for theming, a11y, RTL

---

## 15. Testing

- **Arrange-Act-Assert** structure
- **Accessible queries** — `getByRole`, `getByText` over `data-testid`
- **Test behavior, not implementation details**
- **Tests must assert the behavior named in their title**
- **Mock at the boundary** (API layer), not in the middle of the stack
- **Import real production code** — no inline re-implementations that drift
- **Mock the actual module used in production** — trace the real import chain
- **Fake timers** — no real `setTimeout` delays in tests
- **Factory functions** for test data — `makeInput(overrides)` pattern, override only what the test needs

---

## 16. Domain Boundaries

- **Generic modules must stay domain-agnostic** — inject domain behavior via callbacks, not hardcoded imports
- **Feature-specific cleanup in generic code must be gated** by a condition
- **Check all consumers before modifying shared code** — search all imports/usages
- **Co-locate route configs** — path + component in same object, no parallel arrays
- **One domain = one directory**; shared by 2+ domains = shared utils

---

## 17. Refactoring Strategy

**Fix bugs, not style.** When touching existing code:

| Fix | Ignore |
|-----|--------|
| Security vulnerabilities | Import order |
| Crashes, data loss | Naming conventions |
| Stale closures (real bugs) | Minor formatting |
| Memory leaks (evident) | Cosmetic code duplication |
| Inline components in lists | "Mount only" effects |

**Decision**: Is the issue in code I'm touching? → Is it security/crash/data loss? → Does it cause an actual bug? → If just cosmetic → ignore.

---

## 18. Checklist Before Committing

- [ ] No `any` types
- [ ] No dead/unused props
- [ ] All hook dependencies correct
- [ ] Cleanup functions present for effects with subscriptions/timers
- [ ] Error handling with user feedback
- [ ] No console.log (use console.error for errors)
- [ ] No inline components in render
- [ ] Tests written for new logic
- [ ] No hardcoded colors — use CSS variables
- [ ] Clickable elements are accessible
- [ ] Async rejections handled (no `void asyncFn()`)
- [ ] Boolean names use proper prefixes
- [ ] No Function type — specific signatures only

---

## Enforcement

These guidelines are not aspirational. They are constraints:

- Every PR / code review checks against these rules.
- Violations are flagged and fixed before approval.
- When a guideline conflicts with a specific requirement, the conflict is discussed explicitly — not silently overridden.
