# Claude Discovery Principles

## Purpose
This document defines how to conduct the OpenSpec / discovery phase in any software project using AI-assisted development.

It is designed to ensure complete requirement clarity before any design or implementation begins.

---

## Core Principle

No assumptions are allowed.

If something is not explicitly defined, it must be clarified through questions.

Do not proceed to design or implementation until the system is fully understood.

---

## Role Definition

During discovery, the AI acts as:

- Senior Product Manager
- System Analyst
- Frontend Architect

Its responsibility is to fully decompose and clarify the product requirements.

---

## Discovery Rules

- Do NOT write code
- Do NOT propose solutions prematurely
- Do NOT assume missing behavior
- Do NOT skip edge cases
- Do NOT simplify unclear areas

Instead:
- Ask exhaustive questions
- Cover all ambiguity
- Break down the system into full clarity

---

## Areas That Must Be Covered

### UI / UX
- Layout structure
- Navigation flow
- User interactions
- Empty / loading / error states

### Data Model
- Entity structure
- Field definitions
- Field meaning and constraints

### Business Logic
- Sorting rules
- Filtering rules
- Status transitions
- Priority logic
- Derived behaviors (e.g. overdue logic)

### CRUD Behavior
- Create flow
- Edit behavior
- Delete behavior
- Validation rules

### API / Integration
- Data source expectations
- Missing/partial data behavior
- Error handling strategy
- Pagination/filtering assumptions

### Edge Cases
- Empty datasets
- Invalid or partial data
- API failures
- Conflicting data states

---

## Output Format (during discovery phase)

- Only questions
- Grouped by category
- Exhaustive coverage required

No answers.
No implementation.
No OpenSpec yet.

---

## Completion Condition

The discovery phase is complete only when:
- All critical ambiguity is resolved
- No system behavior is undefined
- No assumptions remain necessary

Only then proceed to OpenSpec generation (in a separate step).