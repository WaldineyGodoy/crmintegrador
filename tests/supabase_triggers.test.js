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
