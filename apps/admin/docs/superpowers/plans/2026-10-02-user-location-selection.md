# User Location Selection Implementation Plan

**Goal:** Assign church, fellowship, and cell IDs when creating leadership users in Manage Users.

**Architecture:** Extend AddNewAdmin using its existing TanStack form and selects. Load children from the selected parent's detail endpoint with query keys scoped to that parent. Keep existing church-admin restrictions. Admins can select any church, loaded from every API page rather than their stored church list (updated user requirement).

**Tech Stack:** Next.js, React, TanStack Form/Query, Zod.

**Spec:** User request in this task dated 2026-10-02.

### Implementation
- [x] Update components/AddNewAdmin.tsx: require church for church pastors, fellowship leaders, cell leaders, and existing church admins; require fellowship for fellowship/cell leaders and cell for cell leaders.
- [x] Add dependent queries using getChurchById(churchId).fellowships and getFellowshipById(fellowshipId).cells, enabled only while relevant and with a selected parent.
- [x] Clear fellowship/cell when church changes, cell when fellowship changes, and hidden assignments when role changes. Start child selections empty instead of inheriting the creator's assignments.
- [x] Render loading, error, and empty states and submit selected IDs through registerUser.
- [x] Verify validation for each role, syntax/type checks, and diff whitespace. Report any existing tooling failures.

Validation: TypeScript passed; nine role-schema cases passed; git diff --check passed. Lint is blocked by the existing Unexpected identifier 'js' error. Live API/database persistence was not exercised.
