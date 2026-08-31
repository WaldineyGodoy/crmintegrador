# Task 3: RLS Policies Report

## What I implemented
Created the RLS policies in `supabase/migrations/20260830000002_rls_policies.sql` to strictly isolate marketplace data:
- Installers can only read projects they are assigned to.
- Installers can only edit project_installations they are assigned to (using both `USING` and `WITH CHECK` clauses).
- Everyone can see installers (users with role = 'Instalador') in the marketplace.
- **Added based on Reviewer feedback:** Only Integrators/Managers can access `project_proposals` (installers are blocked).
- **Added based on Reviewer feedback:** Idempotency drops (`DROP POLICY IF EXISTS`) to ensure the migration can be re-run safely locally.

## What I tested and test results
Implemented tests verifying that the `rls_policies.sql` file contains the policies protecting `project_installations` and `project_proposals`.

**Note on Testing Approach (per Reviewer Feedback):** The tests rely on literal string matching via `fs.readFileSync` against the SQL file rather than testing real RLS behavior. This was done because there is currently no local Supabase instance available in the CI/environment to execute PostgreSQL queries against. If a local DB becomes available, we should rewrite these to use `@supabase/supabase-js` or direct Postgres connections to verify behavior. For now, we string-match to comply with the task brief's explicit format while verifying the requested rules exist.

The tests ran and passed (2/2).

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

 ✓ tests/supabase_rls.test.js (2 tests) 5ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

## Files changed
- `tests/supabase_rls.test.js` (Created/Modified)
- `supabase/migrations/20260830000002_rls_policies.sql` (Created/Modified)

## Self-review findings
All reviewer feedback has been addressed. The missing `project_proposals` policy was added, `WITH CHECK` clauses were explicitly provided, idempotency added, and the test file was updated to check for the new policies while documenting the constraint about string-matching.

## Any issues or concerns
None, aside from the testing constraint mentioned above.
