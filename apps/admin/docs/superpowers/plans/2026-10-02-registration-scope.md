# Registration Scope Implementation Plan

Goal: Use the token creator's current IDs to scope registration choices.
Architecture: GetFormDetails resolves FormLink.User through created_by, returns church-scoped options and explicit registrationScope fixed IDs. The public form uses that scope without authenticated lookup endpoints.

- Backend: church only returns all church fellowships/cells; church plus fellowship restricts fellowship and its cells; all three returns all fellowships and the creator's cell. Departments and prayer groups use the same church.
- Frontend: lock church always, fellowship only for fellowship scope, cell only for cell scope. Fixed cell remains selected when fellowship changes.
- Verify all three scopes, current creator IDs versus stored link IDs, expired links, TypeScript, and PHP syntax. Backend writes require sandbox escalation.

Completed: backend and frontend implemented. PHPUnit: 4 tests, 22 assertions passed using in-memory SQLite. TypeScript and PHP syntax passed. No live database modified.
