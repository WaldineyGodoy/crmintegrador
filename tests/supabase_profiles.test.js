import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Supabase Profiles Migration', () => {
  it('should have a migration file that creates the profiles table and trigger', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('create_profiles.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('CREATE TABLE public.profiles');
    expect(content).toContain('CREATE TRIGGER on_auth_user_created');
  });
});
