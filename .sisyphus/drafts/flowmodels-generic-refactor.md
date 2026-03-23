# Draft: FlowModels Generic Components Refactor

## Requirements (confirmed)
- User request: Create a work plan to migrate **all components** from `src/pages/FlowModels/components` to a global components folder.
- Refactor goal: Make migrated components generic/reusable.
- Consumption rule: `FlowModels` must keep using these components with existing mocked data.
- Constraint: **No functionality changes** (pure refactor only).

## Technical Decisions
- Refactor strategy should be dependency-ordered to reduce risk.
- Keep behavior parity by preserving rendered UI, interactions, modal flows, and current mocked data.
- Use staged migration with temporary compatibility exports only if needed during transition.
- Since there is no automated test infra, verification must rely on explicit agent-executed QA scenarios and type/build checks.

## Research Findings
- Inventory found: 14 components in `src/pages/FlowModels/components`.
- Primary usage scope found: `FlowModelsPage.tsx`, `EditStageModal.tsx`, `StageCard.tsx`.
- Coupling hotspots identified: `StageCard`, `EditStageModal`, `AddComponentModal`.
- Lower-coupling components identified for earlier extraction waves.
- Test infra assessment: no test framework/config/scripts/CI tests currently configured.

## Open Questions
- Test strategy preference not explicitly chosen by user yet (tests setup vs no tests).

## Scope Boundaries
- INCLUDE: migration, generic prop contracts, import path rewiring inside FlowModels, parity verification.
- EXCLUDE: feature changes, new business logic, backend/API changes, visual redesign.
