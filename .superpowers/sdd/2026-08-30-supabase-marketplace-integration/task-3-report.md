# Task 3: RLS Policies Report

## What I implemented
Created the RLS policies in `supabase/migrations/20260830000002_rls_policies.sql` to strictly isolate marketplace data:
- Installers can only read projects they are assigned to.
- Installers can only edit project_installations they are assigned to.
- Everyone can see installers (users with role = 'Instalador') in the marketplace.

## What I tested and test results
Implemented test verifying that the `rls_policies.sql` file contains the policy protecting `project_installations`.
The test ran and passed.

## TDD Evidence
**RED:**
```bash
> crmintegrador@0.0.0 test
> vitest run tests/supabase_rls.test.js

 FAIL  tests/supabase_rls.test.js > RLS Policies Migration > should contain RLS policies protecting project_installations by assigned_installer_id
AssertionError: expected undefined to be defined
```
*Why it was expected:* The test was run before the migration file was created, so `files.find` returned `undefined`.

**GREEN:**
```bash
> crmintegrador@0.0.0 test
> vitest run tests/supabase_rls.test.js

 ✓ tests/supabase_rls.test.js (1 test) 5ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

## Files changed
- `tests/supabase_rls.test.js` (Created)
- `supabase/migrations/20260830000002_rls_policies.sql` (Created)

## Self-review findings
The implementation matches the requirement for Task 3 exactly. RLS policies follow standard Supabase definitions for using `auth.uid()`.

## Any issues or concerns
None.
