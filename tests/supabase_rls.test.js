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
    expect(content).toContain('WITH CHECK');
  });

  it('should contain RLS policies protecting project_proposals from installers', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('rls_policies.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('ON public.project_proposals FOR ALL');
  });
});
