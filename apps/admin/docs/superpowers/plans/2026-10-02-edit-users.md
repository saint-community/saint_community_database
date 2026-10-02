# Edit Users Implementation Plan

Goal: Allow authorized managers to edit existing user details from Manage Users.
Architecture: Reuse AddNewAdmin with an optional account prop; prefill on open, omit password on edit, send PUT /api/account/{account_id}, and invalidate all account list queries. Keep create behavior intact.

- Modify services/auth.ts and utils/constants.ts for typed managed-user update payload and endpoint.
- Modify components/AddNewAdmin.tsx to support edit defaults, conditional password validation/UI, explicit null assignments on edit, server errors, and cache refresh. Reset on each opening without clearing saved child IDs.
- Modify app/d/settings/users/page.tsx to show Edit beside Delete; church admins may edit only leadership accounts in their own church, matching backend enforcement.
- Add AuthController.UpdateManagedAccount and authenticated role-protected route. Validate email uniqueness excluding the edited user, valid role, required hierarchy and parent relationships. Preserve credentials. Reject out-of-scope church-admin requests.
- Test updates, validation, role changes clearing stale assignments, permission boundaries, and unchanged credentials with isolated SQLite. Run frontend TypeScript and diff checks.

Implemented. Backend HTTP regression tests passed: 17 tests, 46 assertions. Eight frontend schema checks passed. PHP syntax and diff checks passed. Tests use isolated in-memory SQLite; no live account records were changed.
