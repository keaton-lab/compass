## Plan Generated: Mobile UI Tweaks — Mobile Search Reveal & ProfileHeader Refinements

## TL;DR
> **Summary**: Implement mobile-specific UI refinements for search reveal and ProfileHeader aesthetics. Hide the search input on small screens by default and provide a reliable, accessible toggle. Elevate ProfileHeader visuals across breakpoints with theme-aware contrast. Align with existing theming, typography, and spacing patterns.
> **Deliverables**: 1) Mobile search toggle with auto-focus; 2) Refined ProfileHeader typography and background treatment for light/dark modes; 3) Accessibility plan and ARIA conformance; 4) Theming alignment for header components; 5) Documentation and QA plan ready for review.
> **Effort**: Medium
> **Parallel**: YES - 2 waves planned
> **Critical Path**: T1 → T2 → T3 → T5 → T7 → T9

## Context
### Original Request
- On mobile, optimize search visibility: hide search by default and reveal on click.
- Improve ProfileHeader aesthetics across large and small screens.

### Interview Summary
- Phase 0 exploration completed. Located and analyzed components: SearchBar.tsx, ProfileHeader.tsx, ClientLayout.tsx, SettingsContext.tsx, ThemeToggle.tsx, and global theming configuration.
- Key concerns identified: mobile toggle state, readability across themes, accessibility, and theming compatibility.

### Metis Review (gaps addressed)
- Gaps:
- Mobile search reveal approach (global vs local state)
- Visual contrast/readability for ProfileHeader in light vs dark mode
- Accessibility considerations for ARIA attributes and focus management
- Tailwind theming compatibility and CSS variable usage
- Testing strategy across breakpoints and debounced search performance
- Migration risks for ClientLayout/SettingsContext
- Recommendations:
- Make showSearch a global toggle via SettingsContext for cross-breakpoint consistency.
- Improve ProfileHeader with theme-aware backgrounds and accessible contrast; consider a subtle elevation in light mode.
- Add ARIA attributes (aria-expanded, aria-controls); focus input on open; ensure focus returns on close.
- Update docs with acceptance criteria and test scenarios.
- If scope grows, consider a bottom-bar mobile navigation wrapper as an isolation boundary.

### Rationale and Acceptance Gaps
- The plan addresses accessibility, visual clarity, and theming without large-scale architectural changes.
- Open questions revolve around final toggle strategy, ARIA patterns, and testing approach (Playwright vs other).

## Work Objectives
### Core Objective
- Deliver mobile-friendly header tweaks with a clean toggleable SearchBar and refined ProfileHeader visuals that work across light/dark themes.
### Deliverables
- A mobile search reveal mechanism with accessible toggle and focus handling.
- ProfileHeader typography, spacing, and background improvements for readability.
- Accessibility plan and a minimal QA strategy for mobile header scenarios.
- Documentation updates reflecting decisions and test scenarios.
### Definition of Done
- Acceptance Criteria met and verifiable by automated tests or QA checks:
- On viewport <= 640px: search toggle reveals input; input is focused; hides on close; ARIA attributes present.
- ProfileHeader remains legible with updated overlay and typography scaling at md+ sizes in both themes.
- No header layout regressions at md+ breakpoints; theme tokens reflect in header visuals.
- Documentation and test plan updated.
### Must Have
- Global showSearch toggle design in SettingsContext or document clearly if local approach is chosen.
- Accessibility plan including ARIA attributes and keyboard navigation guidance.
- Theming compatibility updates with Tailwind vars.
### Must NOT Have (guardrails)
- Do not perform large, risky refactors of header scaffolding that touch unrelated components.
- Do not break existing grid/typography tokens for other UI blocks.

## Verification Strategy
- ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: TDD-oriented with Playwright or equivalent; UI and accessibility tests.
- QA policy: Every task has agent-executed scenarios; happy path and edge cases.
- Evidence: store results under .sisyphus/evidence/task-mobile-ui-*.md

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. Early waves focus on foundational decisions, later waves on implementation details.

- [x] Specification & acceptance criteria consolidation (deep)
- [ ] Global search visibility design in SettingsContext (deep)

Wave 2: UI/UX and theming foundations
- 3. Implement mobile search reveal toggle (visual-engineering)
- 4. ProfileHeader visual refinements (visual-engineering)

Wave 3: Accessibility and theming alignment
- 5. Accessibility plan and ARIA/focus strategy (writing)
- 6. Theming compatibility updates (Tailwind vars) (visual-engineering)

Wave 4: Verification and documentation
- 7. Testing & QA plan (writing)
- 8. Documentation updates (Drafts) (writing)

Wave 5: Final review and guardrails
- 9. Final plan review and optional expansion guardrails (deep)

### Dependency Matrix (full, all tasks)
| Task | Depends On | Reason |
|------|------------|--------|
| T1. Specification & acceptance criteria consolidation | None | Foundations; scope and success metrics |
| T2. Global search visibility design in SettingsContext | T1 | Cross-cutting context for header behavior |
| T3. Implement mobile search reveal toggle (header) | T2 | UI pattern for mobile search toggle |
| T4. ProfileHeader visual refinements | T1 | Design language and typography improvements |
| T5. Accessibility plan and ARIA/focus strategy | T2, T3, T4 | Accessibility across header interactions |
| T6. Theming compatibility updates (Tailwind vars) | T2, T3, T4 | Theming across header visuals |
| T7. Testing & QA plan (TDD-oriented) | T5 | Verification strategy |
| T8. Documentation updates (Drafts) | T1, T7 | Documentation alignment |
| T9. Final plan review and guardrails | T6, T7, T8 | Consolidates plan; guardrails |

Critical Path: T1 → T2 → T3 → T5 → T7 → T9

### Parallel Execution Graph
Wave 1: T1, T2
Wave 2: T3, T4
Wave 3: T5, T6
Wave 4: T7, T8
Wave 5: T9

### CATEGORY + SKILLS Recommendations (MANDATORY)
For every task, provide a delegation recommendation (category + skills) and justify. (Omitted in this plan for brevity; rely on the individual task sheets in the next steps.)

### Task 1: Specification & acceptance criteria consolidation
- Delegation: deep; librarian + writing
- Rationale: establishes scope, gaps, and acceptance criteria
- Acceptance: formal spec doc exists

### Task 2: Global search visibility design in SettingsContext
- Delegation: deep; frontend-ui-ux + git-master
- Rationale: architecture/state design with cross-cutting impact
- Acceptance: SettingsContext exposes showSearch flag; header reads it

### Task 3: Implement mobile search reveal toggle (header)
- Delegation: visual-engineering; frontend-ui-ux + git-master
- Rationale: UI/UX for mobile search toggle while preserving accessibility
- Acceptance: ARIA attributes; input focus on open

### Task 4: ProfileHeader visual refinements
- Delegation: visual-engineering; frontend-ui-ux + git-master
- Rationale: polish typography and contrast across themes
- Acceptance: readability improvements validated visually and via contrast checks

### Task 5: Accessibility plan and ARIA/focus strategy
- Delegation: writing
- Rationale: formalize a11y guidelines and tests
- Acceptance: ARIA plan documented

### Task 6: Theming compatibility updates (Tailwind vars)
- Delegation: visual-engineering; frontend-ui-ux + git-master
- Rationale: ensure theme tokens are consistent across header components
- Acceptance: theming changes integrated without regressions

### Task 7: Testing & QA plan (TDD-oriented)
- Delegation: writing
- Rationale: define tests for header and search interactions
- Acceptance: test plan exists

### Task 8: Documentation updates (Drafts)
- Delegation: writing
- Rationale: document decisions, gaps, tests
- Acceptance: updated drafts in repo

### Task 9: Final plan review and guardrails
- Delegation: deep
- Rationale: finalize decisions and expansion guardrails
- Acceptance: final plan with guardrails

## TODOs (for execution phase)
> This section will be populated during plan execution; see the Wave-based TODO list in Task Graph above.

## Final Verification Wave (MANDATORY)
- Will be executed by dedicated QA agents; see plan for detailed checks.

## References / Evidence
- Explored files: SearchBar.tsx, ProfileHeader.tsx, ClientLayout.tsx, SettingsContext.tsx, ThemeToggle.tsx
- Theming: globals.css, tailwind.config.ts
- Data/types: types/index.ts
