# FlowModels Components Generic Refactor Plan

## TL;DR

> **Quick Summary**: Refactor all `src/pages/FlowModels/components` into global reusable components while preserving 100% of current behavior and keeping FlowModels consuming them with existing mock data.
>
> **Deliverables**:
> - Globalized component modules for all current FlowModels components
> - Updated FlowModels imports/usages to consume globalized generic components
> - Compatibility and parity verification artifacts proving zero functional drift
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves + final verification wave
> **Critical Path**: Foundation contracts/indexes → low-coupling extraction → high-coupling extraction → FlowModels rewiring → final parity verification

---

## Context

### Original Request
Refatorar todos os componentes de `pages/FlowModels/components`, migrar para pasta de componentes globais, tornar genéricos e no `FlowModels` continuar usando esses componentes com os dados mockados já presentes, sem alterar funcionalidade.

### Interview Summary
**Key Discussions**:
- Objective is explicit pure refactor; behavior must remain unchanged.
- Scope includes **all** FlowModels components (not selective migration).
- Existing mock-driven behavior in FlowModels must be preserved as-is.

**Research Findings**:
- 14 component files identified under `src/pages/FlowModels/components`.
- Main consumption points: `FlowModelsPage.tsx`, `EditStageModal.tsx`, `StageCard.tsx`.
- Coupling hotspots: `StageCard`, `EditStageModal`, `AddComponentModal`.
- No automated test infrastructure present (no framework/scripts/config/CI tests).

### Metis Review
**Identified Gaps** (addressed in this plan):
- Missing explicit guardrails against scope creep into feature work.
- Missing acceptance criteria for behavior parity at interaction level.
- Missing anti-break strategy for temporary transition (barrels/adapters).
- Missing explicit risk handling for tightly-coupled components and component maps.

---

## Work Objectives

### Core Objective
Move all FlowModels page-local components into globally reusable component locations and generic APIs, then rewire FlowModels to consume those global components with no visual/behavioral regression.

### Concrete Deliverables
- Global component files and barrels for all migrated FlowModels components.
- Generic type/prop contracts for extracted components.
- FlowModels imports updated to global paths.
- Verified parity evidence for modals, previews, drag/drop, status chips, and mock-data rendering.

### Definition of Done
- [ ] No imports from `src/pages/FlowModels/components/*` remain in FlowModels runtime code.
- [ ] All migrated components render and behave identically under existing mocks.
- [ ] `pnpm run build` passes.
- [ ] No new feature behavior, logic branch, or UX additions introduced.

### Must Have
- Full migration of all 14 components.
- Genericized component contracts suitable for global reuse.
- Zero functional behavior change.

### Must NOT Have (Guardrails)
- No business-logic changes.
- No API/backend integration changes.
- No redesign or style drift.
- No migration split into multiple plans (single-plan mandate).
- No silent prop semantic changes without adapters/compat mapping.

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (current repo status)
- **Framework**: none
- **Primary verification**: build/type/lint checks + agent-executed QA scenarios

### QA Policy
Every task includes executable QA scenarios with evidence artifacts under `.sisyphus/evidence/`.

- **Frontend/UI**: Playwright scenarios for render and interaction parity.
- **CLI/Build**: Bash for `pnpm run build` and diagnostics checks.
- **Module parity**: targeted runtime checks through FlowModels pages.

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Foundation — can start immediately, max parallel):
├── Task 1: Define global component directory taxonomy + barrel contract [quick]
├── Task 2: Define shared generic type contracts for migrated components [quick]
├── Task 3: Create compatibility import strategy (temporary adapters if needed) [unspecified-high]
├── Task 4: Establish migration checklist matrix for all 14 components [quick]
└── Task 5: Baseline parity capture from current FlowModels (screens/states checklist) [unspecified-high]

Wave 2 (Low/Medium coupling extraction — max parallel):
├── Task 6: Extract low-coupling display components set A to global [unspecified-high]
├── Task 7: Extract low-coupling display components set B to global [unspecified-high]
├── Task 8: Extract low-coupling modal/dialog components to global [unspecified-high]
├── Task 9: Extract medium-coupling CreateStageModal with generic props [deep]
└── Task 10: Rewire imports in FlowModels for tasks 6–9 and verify parity [deep]

Wave 3 (High-coupling core extraction — controlled parallel):
├── Task 11: Extract AddComponentModal with generic contracts/adapters [deep]
├── Task 12: Extract StageCard with component map abstraction [deep]
├── Task 13: Extract EditStageModal with decoupled dependencies [deep]
└── Task 14: Rewire FlowModelsPage/EditStageModal/StageCard import graph to global [deep]

Wave 4 (Stabilization + decommission local components):
├── Task 15: Remove/retire legacy local FlowModels component paths safely [quick]
├── Task 16: Normalize barrels/exports and path aliases for global components [quick]
├── Task 17: Run full parity sweep across all mock-driven flows [unspecified-high]
└── Task 18: Build/diagnostics hardening and regression triage [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan Compliance Audit (oracle)
├── F2: Code Quality Review (unspecified-high)
├── F3: Real QA Execution of all task scenarios (unspecified-high)
└── F4: Scope Fidelity Check vs refactor-only mandate (deep)

Critical Path: 1 → 2 → 9 → 13 → 14 → 17 → FINAL
Parallel Speedup: ~60% versus strict sequential
Max Concurrent: 5 (Wave 1/2)

### Dependency Matrix (full)

- **1**: Blocked By: None | Blocks: 3, 4, 6, 7, 8, 9
- **2**: Blocked By: None | Blocks: 6, 7, 8, 9, 11, 12, 13
- **3**: Blocked By: 1 | Blocks: 10, 14, 15
- **4**: Blocked By: 1 | Blocks: 10, 17
- **5**: Blocked By: None | Blocks: 17
- **6**: Blocked By: 1,2 | Blocks: 10
- **7**: Blocked By: 1,2 | Blocks: 10
- **8**: Blocked By: 1,2 | Blocks: 10
- **9**: Blocked By: 1,2 | Blocks: 10, 14
- **10**: Blocked By: 3,4,6,7,8,9 | Blocks: 14, 17
- **11**: Blocked By: 2 | Blocks: 14
- **12**: Blocked By: 2 | Blocks: 13, 14
- **13**: Blocked By: 2,12 | Blocks: 14, 17
- **14**: Blocked By: 3,9,10,11,12,13 | Blocks: 15,16,17,18
- **15**: Blocked By: 3,14 | Blocks: 18
- **16**: Blocked By: 14 | Blocks: 18
- **17**: Blocked By: 4,5,10,13,14 | Blocks: FINAL
- **18**: Blocked By: 14,15,16 | Blocks: FINAL

---

## TODOs

- [ ] 1. Define global component taxonomy and barrels

  **What to do**:
  - Define target folders under `src/components/` for all migrated FlowModels components.
  - Define export barrel strategy to avoid broken imports during migration.

  **Must NOT do**:
  - Do not change component runtime logic.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with 2,4,5)
  - **Blocks**: 3,4,6,7,8,9
  - **Blocked By**: None

  **References**:
  - `src/pages/FlowModels/components/*` - source inventory.
  - `src/components/modals/*` - existing global naming/layout patterns.

  **Acceptance Criteria**:
  - [ ] Global destination map exists for all 14 components.
  - [ ] Export path strategy documented with no ambiguous target.

  **QA Scenarios**:
  ```
  Scenario: Mapping completeness
    Tool: Bash
    Steps:
      1. Compare source component list against destination map.
      2. Assert all 14 source components have a destination path.
    Expected Result: 14/14 mapped.
    Evidence: .sisyphus/evidence/task-1-mapping-complete.txt

  Scenario: Naming conflict detection
    Tool: Bash
    Steps:
      1. Validate no destination filename collision with existing global components.
      2. Assert unique target paths.
    Expected Result: Zero conflicts.
    Evidence: .sisyphus/evidence/task-1-name-conflicts.txt
  ```

- [ ] 2. Define generic prop/type contracts for migrated components

  **What to do**:
  - Create/refine shared type interfaces so components are page-agnostic.
  - Preserve existing prop semantics via aliases/adapters where needed.

  **Must NOT do**:
  - No behavior changes hidden as “type cleanup”.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 6,7,8,9,11,12,13
  - **Blocked By**: None

  **References**:
  - `src/pages/FlowModels/components/StageCard.tsx` - complex prop surface.
  - `src/pages/FlowModels/components/EditStageModal.tsx` - nested contracts.

  **Acceptance Criteria**:
  - [ ] All migrated components compile with generic contracts.
  - [ ] FlowModels-specific data still type-checks through adapters or direct compatibility.

  **QA Scenarios**:
  ```
  Scenario: Type compatibility pass
    Tool: Bash
    Steps:
      1. Run TypeScript diagnostics/build.
      2. Validate zero new type errors for FlowModels components.
    Expected Result: Pass.
    Evidence: .sisyphus/evidence/task-2-types-pass.txt

  Scenario: Contract regression check
    Tool: Bash
    Steps:
      1. Compare pre/post prop names used in FlowModels consumers.
      2. Assert no unresolved prop references.
    Expected Result: Zero unresolved props.
    Evidence: .sisyphus/evidence/task-2-contract-regression.txt
  ```

- [ ] 3. Implement compatibility import strategy

  **What to do**:
  - Add temporary compatibility exports/adapters to support staged migration.
  - Ensure incremental rewiring does not break runtime.

  **Must NOT do**:
  - No permanent duplicate logic.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: 10,14,15
  - **Blocked By**: 1

  **References**:
  - `src/pages/FlowModels/FlowModelsPage.tsx` import patterns.
  - Existing project barrel conventions in `src/components/`.

  **Acceptance Criteria**:
  - [ ] Transition path allows partial migration without broken imports.
  - [ ] No circular import introduced.

  **QA Scenarios**:
  ```
  Scenario: Incremental import stability
    Tool: Bash
    Steps:
      1. Migrate a subset and run build.
      2. Assert app compiles with mixed local/global references.
    Expected Result: Build succeeds.
    Evidence: .sisyphus/evidence/task-3-incremental-stability.txt

  Scenario: Circular dependency guard
    Tool: Bash
    Steps:
      1. Run dependency inspection over changed modules.
      2. Assert no new circular dependencies introduced.
    Expected Result: Zero new cycles.
    Evidence: .sisyphus/evidence/task-3-circular-check.txt
  ```

- [ ] 4. Create migration checklist matrix for 14 components

  **What to do**:
  - Build explicit per-component checklist: source path, destination path, props parity, consumer updates.

  **Must NOT do**:
  - No untracked “drive-by” migrations outside listed components.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 10,17
  - **Blocked By**: 1

  **References**:
  - Exploration inventory output for all 14 files.

  **Acceptance Criteria**:
  - [ ] Matrix includes 14/14 components with ownership and status fields.

  **QA Scenarios**:
  ```
  Scenario: Checklist completeness
    Tool: Bash
    Steps:
      1. Count source files and checklist rows.
      2. Assert counts match.
    Expected Result: Equal counts.
    Evidence: .sisyphus/evidence/task-4-checklist-complete.txt

  Scenario: Migration traceability
    Tool: Bash
    Steps:
      1. For each row, verify destination path exists after migration.
      2. Assert no row missing artifacts.
    Expected Result: 100% traceability.
    Evidence: .sisyphus/evidence/task-4-traceability.txt
  ```

- [ ] 5. Capture baseline parity states before refactor

  **What to do**:
  - Capture baseline screenshots/interactions for all major FlowModels states powered by mocks.

  **Must NOT do**:
  - No mutation of baseline data/state semantics.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`agent-browser`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 17
  - **Blocked By**: None

  **References**:
  - `src/pages/FlowModels/FlowModelsPage.tsx` screen states.

  **Acceptance Criteria**:
  - [ ] Baseline evidence exists for sidebar cards, stage cards, preview modals, and component-specific previews.

  **QA Scenarios**:
  ```
  Scenario: Baseline capture
    Tool: Playwright
    Steps:
      1. Open FlowModels page with mock data.
      2. Capture key state screenshots.
    Expected Result: Baseline bundle saved.
    Evidence: .sisyphus/evidence/task-5-baseline/*.png

  Scenario: Interaction baseline
    Tool: Playwright
    Steps:
      1. Open edit-stage and component preview flows.
      2. Capture modal states and transitions.
    Expected Result: Interaction baseline saved.
    Evidence: .sisyphus/evidence/task-5-interactions/*.png
  ```

- [ ] 6. Extract low-coupling component batch A to global

  **What to do**:
  - Migrate a first independent batch (e.g., ConfirmDialog, FlowModelCard, SignatureComponent, ApprovalComponent, FilesManagementComponent).

  **Must NOT do**:
  - No runtime behavior changes.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 7,8,9)
  - **Blocks**: 10
  - **Blocked By**: 1,2

  **References**:
  - Component files under `src/pages/FlowModels/components/`.
  - Usage file: `src/pages/FlowModels/FlowModelsPage.tsx`.

  **Acceptance Criteria**:
  - [ ] Batch A components exist globally and compile.
  - [ ] APIs remain compatible with existing FlowModels usage.

  **QA Scenarios**:
  ```
  Scenario: Batch A render parity
    Tool: Playwright
    Steps:
      1. Exercise views using batch A components.
      2. Compare visual output with baseline.
    Expected Result: No visible drift.
    Evidence: .sisyphus/evidence/task-6-render-parity.png

  Scenario: Batch A behavior parity
    Tool: Playwright
    Steps:
      1. Trigger dialog/card actions.
      2. Assert same action availability and responses.
    Expected Result: Same behavior.
    Evidence: .sisyphus/evidence/task-6-behavior-parity.txt
  ```

- [ ] 7. Extract low-coupling component batch B to global

  **What to do**:
  - Migrate remaining low-coupling preview components (Checklist, Comments, Form, Timeline).

  **Must NOT do**:
  - No changes in component mock rendering semantics.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 10
  - **Blocked By**: 1,2

  **References**:
  - `StageCard.tsx` and `EditStageModal.tsx` COMPONENT_MAP usage.

  **Acceptance Criteria**:
  - [ ] Preview component mappings still resolve and render.

  **QA Scenarios**:
  ```
  Scenario: Component map integrity
    Tool: Bash
    Steps:
      1. Validate map keys/types resolve to migrated globals.
      2. Assert no undefined component lookups.
    Expected Result: All keys resolve.
    Evidence: .sisyphus/evidence/task-7-map-integrity.txt

  Scenario: Preview parity
    Tool: Playwright
    Steps:
      1. Open stage preview with each component type.
      2. Assert content/chips/buttons match baseline.
    Expected Result: Parity maintained.
    Evidence: .sisyphus/evidence/task-7-preview-parity.png
  ```

- [ ] 8. Extract low-coupling modal/dialog batch to global

  **What to do**:
  - Migrate CreateFlowModelModal and remaining low-risk modal files.

  **Must NOT do**:
  - No form field or default-value behavior change.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 10
  - **Blocked By**: 1,2

  **References**:
  - `CreateFlowModelModal.tsx` usage in `FlowModelsPage.tsx`.

  **Acceptance Criteria**:
  - [ ] Modal open/close/save flows unchanged.

  **QA Scenarios**:
  ```
  Scenario: Create modal parity
    Tool: Playwright
    Steps:
      1. Open create flow-model modal.
      2. Validate same fields/default stage behavior.
    Expected Result: Identical UX and defaults.
    Evidence: .sisyphus/evidence/task-8-create-modal.png

  Scenario: Cancel/save action parity
    Tool: Playwright
    Steps:
      1. Trigger cancel and save pathways.
      2. Assert identical state transitions.
    Expected Result: No change.
    Evidence: .sisyphus/evidence/task-8-save-cancel.txt
  ```

- [ ] 9. Extract CreateStageModal with generic contracts

  **What to do**:
  - Migrate medium-coupling CreateStageModal; preserve existingStages-driven behavior.

  **Must NOT do**:
  - No changes to order/validation semantics.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 10,14
  - **Blocked By**: 1,2

  **References**:
  - `CreateStageModal.tsx` and call site in `FlowModelsPage.tsx`.

  **Acceptance Criteria**:
  - [ ] Stage creation modal behavior identical, including optional/reorder semantics.

  **QA Scenarios**:
  ```
  Scenario: Stage create flow parity
    Tool: Playwright
    Steps:
      1. Open create stage modal and submit valid data.
      2. Assert stage appears exactly as before.
    Expected Result: Identical result.
    Evidence: .sisyphus/evidence/task-9-stage-create.png

  Scenario: Validation parity
    Tool: Playwright
    Steps:
      1. Submit invalid/incomplete stage input.
      2. Assert same validation feedback behavior.
    Expected Result: Same validation.
    Evidence: .sisyphus/evidence/task-9-validation.txt
  ```

- [ ] 10. Rewire FlowModels imports for low/medium extracted components

  **What to do**:
  - Replace local imports with global imports in FlowModels consumers for tasks 6–9.
  - Keep behavior via compatibility layer where necessary.

  **Must NOT do**:
  - No broad unrelated import cleanup outside scope.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 tail
  - **Blocks**: 14,17
  - **Blocked By**: 3,4,6,7,8,9

  **References**:
  - `FlowModelsPage.tsx`, `EditStageModal.tsx`, `StageCard.tsx` imports.

  **Acceptance Criteria**:
  - [ ] All low/medium migrated component imports point to globals.
  - [ ] Build still passes.

  **QA Scenarios**:
  ```
  Scenario: Import rewiring compile check
    Tool: Bash
    Steps:
      1. Run build/type-check.
      2. Assert no unresolved module/import errors.
    Expected Result: Pass.
    Evidence: .sisyphus/evidence/task-10-build-pass.txt

  Scenario: Runtime smoke parity
    Tool: Playwright
    Steps:
      1. Open FlowModels main flows impacted by rewired imports.
      2. Assert no runtime render errors.
    Expected Result: No runtime break.
    Evidence: .sisyphus/evidence/task-10-runtime-smoke.txt
  ```

- [ ] 11. Extract AddComponentModal (high coupling) with generic adapters

  **What to do**:
  - Migrate AddComponentModal to global and abstract flow-specific assumptions behind explicit props.

  **Must NOT do**:
  - No changes to add/edit component behavior.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with 12)
  - **Blocks**: 14
  - **Blocked By**: 2

  **References**:
  - `AddComponentModal.tsx`, `EditStageModal.tsx` integration points.

  **Acceptance Criteria**:
  - [ ] Add/edit component modal parity preserved.

  **QA Scenarios**:
  ```
  Scenario: Add component flow parity
    Tool: Playwright
    Steps:
      1. Open add-component modal and complete flow.
      2. Assert identical component insertion behavior.
    Expected Result: Same output/state.
    Evidence: .sisyphus/evidence/task-11-add-component.png

  Scenario: Edit component flow parity
    Tool: Playwright
    Steps:
      1. Open modal in edit mode.
      2. Assert same prefill/update behavior.
    Expected Result: Same behavior.
    Evidence: .sisyphus/evidence/task-11-edit-component.txt
  ```

- [ ] 12. Extract StageCard (high coupling) with component map abstraction

  **What to do**:
  - Migrate StageCard and decouple internal component map references to global modules.

  **Must NOT do**:
  - No changes to drag/drop, preview dialog, or button actions.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 13,14
  - **Blocked By**: 2

  **References**:
  - `StageCard.tsx` current implementation and preview map.

  **Acceptance Criteria**:
  - [ ] StageCard interactions and modal previews are identical.

  **QA Scenarios**:
  ```
  Scenario: Drag/drop parity
    Tool: Playwright
    Steps:
      1. Reorder stages via drag/drop in edit mode.
      2. Assert same reorder behavior and visual feedback.
    Expected Result: No behavioral drift.
    Evidence: .sisyphus/evidence/task-12-dnd-parity.txt

  Scenario: Preview modal parity
    Tool: Playwright
    Steps:
      1. Open stage preview, toggle expand/fullscreen.
      2. Assert same controls and content behavior.
    Expected Result: Identical interactions.
    Evidence: .sisyphus/evidence/task-12-preview-parity.png
  ```

- [ ] 13. Extract EditStageModal (high coupling) with decoupled dependencies

  **What to do**:
  - Migrate EditStageModal to global, preserving complex local state and child-component orchestration.

  **Must NOT do**:
  - No changes to stage editing semantics.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 tail
  - **Blocks**: 14,17
  - **Blocked By**: 2,12

  **References**:
  - `EditStageModal.tsx`, `AddComponentModal.tsx`, `StageCard.tsx` interactions.

  **Acceptance Criteria**:
  - [ ] Edit stage lifecycle unchanged (load/edit/save/duplicate/component management).

  **QA Scenarios**:
  ```
  Scenario: Edit-stage full lifecycle parity
    Tool: Playwright
    Steps:
      1. Open edit-stage modal, modify fields/components, save.
      2. Assert same resulting stage state.
    Expected Result: Behavior unchanged.
    Evidence: .sisyphus/evidence/task-13-edit-lifecycle.txt

  Scenario: Duplicate/cancel parity
    Tool: Playwright
    Steps:
      1. Trigger duplicate and cancel flows.
      2. Assert same side effects and UI transitions.
    Expected Result: Identical behavior.
    Evidence: .sisyphus/evidence/task-13-duplicate-cancel.txt
  ```

- [ ] 14. Rewire high-coupling import graph to global components

  **What to do**:
  - Update FlowModelsPage/EditStageModal/StageCard to global paths for tasks 11–13.

  **Must NOT do**:
  - No side refactors outside targeted import graph.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 completion
  - **Blocks**: 15,16,17,18
  - **Blocked By**: 3,9,10,11,12,13

  **References**:
  - Import maps in the three core consumer files.

  **Acceptance Criteria**:
  - [ ] No remaining runtime imports from `src/pages/FlowModels/components/*`.

  **QA Scenarios**:
  ```
  Scenario: Residual import detection
    Tool: Bash
    Steps:
      1. Search for imports referencing local FlowModels components.
      2. Assert zero runtime references remain.
    Expected Result: 0 matches.
    Evidence: .sisyphus/evidence/task-14-residual-imports.txt

  Scenario: FlowModels end-to-end smoke
    Tool: Playwright
    Steps:
      1. Exercise key FlowModels interactions after rewiring.
      2. Assert no runtime exceptions.
    Expected Result: Stable behavior.
    Evidence: .sisyphus/evidence/task-14-smoke.txt
  ```

- [ ] 15. Decommission local FlowModels component paths safely

  **What to do**:
  - Remove/retire old local component modules once rewiring is complete.

  **Must NOT do**:
  - No deletion before all references are migrated.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: 18
  - **Blocked By**: 3,14

  **References**:
  - Residual import report from task 14.

  **Acceptance Criteria**:
  - [ ] Legacy local components removed or marked non-runtime with no breakage.

  **QA Scenarios**:
  ```
  Scenario: Dead-path cleanup check
    Tool: Bash
    Steps:
      1. Validate no code references deleted paths.
      2. Run build.
    Expected Result: Build passes, no missing modules.
    Evidence: .sisyphus/evidence/task-15-cleanup-check.txt

  Scenario: Route smoke after cleanup
    Tool: Playwright
    Steps:
      1. Open FlowModels route.
      2. Assert page loads and core interactions work.
    Expected Result: No regressions.
    Evidence: .sisyphus/evidence/task-15-route-smoke.png
  ```

- [ ] 16. Normalize global barrels and aliases

  **What to do**:
  - Finalize stable export surfaces and alias consistency for new global components.

  **Must NOT do**:
  - No broad repository-wide alias rewrites outside FlowModels scope.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with 17)
  - **Blocks**: 18
  - **Blocked By**: 14

  **References**:
  - Existing `src/components/*` barrel patterns.

  **Acceptance Criteria**:
  - [ ] Export paths are stable and consistent.

  **QA Scenarios**:
  ```
  Scenario: Barrel integrity
    Tool: Bash
    Steps:
      1. Validate all barrel exports resolve.
      2. Type-check imports from consumers.
    Expected Result: No unresolved exports.
    Evidence: .sisyphus/evidence/task-16-barrel-integrity.txt

  Scenario: Alias consistency
    Tool: Bash
    Steps:
      1. Search for mixed/legacy alias usage in FlowModels scope.
      2. Assert conventions are consistent.
    Expected Result: Consistent paths.
    Evidence: .sisyphus/evidence/task-16-alias-consistency.txt
  ```

- [ ] 17. Execute full parity sweep vs baseline

  **What to do**:
  - Re-run baseline scenarios and compare evidence to ensure no functional drift.

  **Must NOT do**:
  - No acceptance based on “looks similar” without explicit assertions.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`agent-browser`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: FINAL
  - **Blocked By**: 4,5,10,13,14

  **References**:
  - Baseline artifacts from task 5.

  **Acceptance Criteria**:
  - [ ] All baseline scenarios pass with equivalent outputs.

  **QA Scenarios**:
  ```
  Scenario: Visual parity comparison
    Tool: Playwright
    Steps:
      1. Re-capture screenshots for baseline states.
      2. Compare against task-5 artifacts.
    Expected Result: No unintended visual delta.
    Evidence: .sisyphus/evidence/task-17-visual-parity/*.png

  Scenario: Interaction parity comparison
    Tool: Playwright
    Steps:
      1. Re-run modal/preview/drag flows.
      2. Assert outcomes match baseline transitions.
    Expected Result: Same interactions.
    Evidence: .sisyphus/evidence/task-17-interaction-parity.txt
  ```

- [ ] 18. Build/diagnostics hardening and regression triage

  **What to do**:
  - Run final build/lint/type diagnostics and resolve refactor regressions only.

  **Must NOT do**:
  - No opportunistic feature or architecture changes.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 completion
  - **Blocks**: FINAL
  - **Blocked By**: 14,15,16

  **References**:
  - Current repository build command and diagnostics tooling.

  **Acceptance Criteria**:
  - [ ] `pnpm run build` passes.
  - [ ] No new diagnostics in refactor scope.

  **QA Scenarios**:
  ```
  Scenario: Final build pass
    Tool: Bash
    Steps:
      1. Run pnpm run build.
      2. Assert exit code 0.
    Expected Result: Pass.
    Evidence: .sisyphus/evidence/task-18-build.txt

  Scenario: Refactor-scope diagnostics
    Tool: LSP diagnostics
    Steps:
      1. Scan FlowModels and new global component paths.
      2. Assert no new errors introduced.
    Expected Result: Zero new errors.
    Evidence: .sisyphus/evidence/task-18-diagnostics.txt
  ```

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify every Must Have and Must NOT Have against implemented output and evidence files.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run build/lint/type checks; verify no refactor anti-patterns or dead paths remain.

- [ ] F3. **Real QA Execution** — `unspecified-high`
  Execute all task QA scenarios end-to-end; confirm evidence completeness.

- [ ] F4. **Scope Fidelity Check** — `deep`
  Confirm this stayed a pure refactor: no feature additions, no behavior drift.

---

## Commit Strategy

- Group commits by wave to keep rollback and review clarity:
  1) Foundation contracts/paths
  2) Low/medium extraction + rewiring
  3) High-coupling extraction + rewiring
  4) Cleanup + stabilization

---

## Success Criteria

### Verification Commands
```bash
pnpm run build
```

### Final Checklist
- [ ] All FlowModels local components migrated to global locations
- [ ] FlowModels consumes only global migrated components
- [ ] No functionality/UX change from baseline
- [ ] Build/type checks pass
- [ ] Scope remained pure refactor
