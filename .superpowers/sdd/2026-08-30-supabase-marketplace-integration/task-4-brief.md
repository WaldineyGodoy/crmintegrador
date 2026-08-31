### Task 4: Webhooks e Triggers para Edge Functions (WhatsApp)

**Files:**
- Create: `supabase/migrations/20260830000003_notifications_trigger.sql`
- Create: `tests/supabase_triggers.test.js`

**Interfaces:**
- Produces: Trigger do Supabase acionada ao atribuir um Instalador a um Projeto, e chamando uma Edge Function através da extensão `pg_net` para notificação.

- [ ] **Step 1: Write the failing test**
Create `tests/supabase_triggers.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Triggers and Webhooks Migration', () => {
  it('should create a trigger for project installer assignment', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('notifications_trigger.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('CREATE EXTENSION IF NOT EXISTS pg_net');
    expect(content).toContain('CREATE TRIGGER on_installer_assigned');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test tests/supabase_triggers.test.js`

- [ ] **Step 3: Write minimal implementation**
Crie o arquivo `supabase/migrations/*_notifications_trigger.sql`:
```sql
-- Habilita extensão para fazer requisições HTTP a partir do Postgres
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_installer_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_installer_id IS NOT NULL AND OLD.assigned_installer_id IS DISTINCT FROM NEW.assigned_installer_id THEN
    -- Chama a Edge Function do Supabase (que depois chama a Evolution API)
    PERFORM net.http_post(
        url := 'https://[PROJECT_REF].supabase.co/functions/v1/notify-whatsapp',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
        body := json_build_object('project_id', NEW.id, 'installer_id', NEW.assigned_installer_id)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_installer_assigned ON public.projects;
CREATE TRIGGER on_installer_assigned
  AFTER UPDATE OF assigned_installer_id ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_installer_assignment();
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test tests/supabase_triggers.test.js`

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: add pg_net trigger for installer assignment notifications"
```
