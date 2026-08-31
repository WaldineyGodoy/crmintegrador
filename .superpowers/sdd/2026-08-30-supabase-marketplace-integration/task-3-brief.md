### Task 3: RLS (Row Level Security) Policies

**Files:**
- Create: `supabase/migrations/20260830000002_rls_policies.sql`
- Create: `tests/supabase_rls.test.js`

**Interfaces:**
- Produces: Regras de RLS barrando o acesso indevido às propostas (project_proposals) por instaladores e liberando a edição apenas aos responsáveis.

- [ ] **Step 1: Write the failing test**
Create `tests/supabase_rls.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('RLS Policies Migration', () => {
  it('should contain RLS policies protecting project_installations by assigned_installer_id', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('rls_policies.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('CREATE POLICY "Installer can edit assigned installation"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test tests/supabase_rls.test.js`

- [ ] **Step 3: Write minimal implementation**
Crie o arquivo `supabase/migrations/*_rls_policies.sql`:
```sql
-- Instaladores podem ler os projetos onde estão designados
CREATE POLICY "Installer can read assigned project"
  ON public.projects FOR SELECT
  USING (auth.uid() = assigned_installer_id);

-- Instaladores podem editar a aba de instalação de seus projetos
CREATE POLICY "Installer can edit assigned installation"
  ON public.project_installations FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE assigned_installer_id = auth.uid()
    )
  );

-- Gestores/Integradores podem ver todos os prestadores do marketplace
CREATE POLICY "Everyone can see installers in marketplace"
  ON public.profiles FOR SELECT
  USING (role = 'Instalador');
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test tests/supabase_rls.test.js`

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: add RLS policies for strict marketplace isolation"
```
