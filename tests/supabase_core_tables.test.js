import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Core Tables Migration', () => {
  it('should define the mega modal tables and marketplace availability', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('create_core_tables.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('CREATE TABLE public.projects');
    expect(content).toContain('CREATE TABLE public.project_installations');
    expect(content).toContain('CREATE TABLE public.installer_availability');
  });
});
