import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('initializes with null user and role', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });

  it('updates user when setUser is called', () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('updates role when setRole is called', () => {
    useAuthStore.getState().setRole('admin');
    expect(useAuthStore.getState().role).toBe('admin');
  });

  it('resets user and role on logout', () => {
    useAuthStore.getState().setUser({ id: '123' });
    useAuthStore.getState().setRole('seller');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().role).toBeNull();
  });
});
