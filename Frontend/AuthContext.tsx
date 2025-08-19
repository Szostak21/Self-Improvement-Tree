import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from './config';

type AuthState = {
  token: string | null;
  accountId: string | null; // server user id when logged in
  username: string | null;
};

type AuthContextType = {
  auth: AuthState;
  registerInit: (username: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  verifyRegistration: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  registerAndLink: (username: string, email: string, password: string) => Promise<{ ok: boolean; error?: string; accountId?: string; username?: string }>;
  loginAndLink: (username: string, password: string) => Promise<{ ok: boolean; error?: string; accountId?: string; username?: string }>;
  forgotInit: (usernameOrEmail: string) => Promise<{ ok: boolean; error?: string; email?: string }>;
  forgotConfirm: (email: string, code: string, newPassword?: string, newUsername?: string) => Promise<{ ok: boolean; error?: string; accountId?: string; username?: string; token?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ token: null, accountId: null, username: null });
  const userIdKey = 'sut_user_id';
  const guestIdKey = 'sut_guest_user_id';

  useEffect(() => {
    (async () => {
      const [token, accountId, username] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('accountId'),
        AsyncStorage.getItem('username'),
      ]);
      setAuth({ token, accountId, username });
    })();
  }, []);

  async function getOrCreateGuestId(): Promise<string> {
    let gid = await AsyncStorage.getItem(guestIdKey);
    if (!gid) {
      gid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      await AsyncStorage.setItem(guestIdKey, gid);
    }
    return gid;
  }

  async function getCurrentGuestId(): Promise<string | null> {
    try {
      const gid = await AsyncStorage.getItem(guestIdKey);
      return gid ?? (await getOrCreateGuestId());
    } catch {
      return await getOrCreateGuestId();
    }
  }

  async function persistAuth(token: string, accountId: string, username: string | undefined) {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('accountId', accountId);
    if (username) await AsyncStorage.setItem('username', username);
    setAuth({ token, accountId, username: username ?? null });
  }

  async function registerInit(username: string, email: string, password: string) {
    try {
      const r = await fetch(`${API_BASE}/api/auth/register-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        return { ok: false, error: body.error || 'REGISTER_INIT_FAILED' };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async function verifyRegistration(email: string, code: string) {
    try {
      const r = await fetch(`${API_BASE}/api/auth/register-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        return { ok: false, error: body.error || 'REGISTER_VERIFY_FAILED' };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async function registerAndLink(username: string, email: string, password: string) {
    try {
      const r = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        return { ok: false, error: body.error || 'REGISTER_FAILED' };
      }
      const guestId = (await getCurrentGuestId()) || '';
      const lr = await fetch(`${API_BASE}/api/auth/link-guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: username, password, guestId }),
      });
      if (!lr.ok) {
        const body = await lr.json().catch(() => ({}));
        return { ok: false, error: body.error || 'LINK_FAILED' };
      }
      const body = await lr.json();
      const token = body.token as string;
      const accountId = body.accountId as string;
      const uname = body.username as string | undefined;
      await persistAuth(token, accountId, uname);
      return { ok: true, accountId, username: uname };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async function loginAndLink(username: string, password: string) {
    try {
      const guestId = (await getCurrentGuestId()) || '';
      const lr = await fetch(`${API_BASE}/api/auth/link-guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: username, password, guestId }),
      });
      if (!lr.ok) {
        const body = await lr.json().catch(() => ({}));
        return { ok: false, error: body.error || 'LINK_FAILED' };
      }
      const body = await lr.json();
      const token = body.token as string;
      const accountId = body.accountId as string;
      const uname = body.username as string | undefined;
      await persistAuth(token, accountId, uname);
      return { ok: true, accountId, username: uname };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async function forgotInit(usernameOrEmail: string) {
    try {
      const r = await fetch(`${API_BASE}/api/auth/reset-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        return { ok: false, error: body.error || 'RESET_INIT_FAILED' } as const;
      }
      const body = await r.json().catch(() => ({}));
      const email = body.email as string | undefined;
      return { ok: true, email } as const;
    } catch {
      return { ok: false, error: 'NETWORK_ERROR' } as const;
    }
  }

  async function forgotConfirm(email: string, code: string, newPassword?: string, newUsername?: string) {
    try {
      const r = await fetch(`${API_BASE}/api/auth/reset-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword, newUsername }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        return { ok: false, error: body.error || 'RESET_CONFIRM_FAILED' };
      }
      const body = await r.json();
      const token = body.token as string;
      const accountId = body.accountId as string;
      const uname = body.username as string | undefined;
      // Persist fresh auth; if username returned, overwrite cached username, else ensure it's not stale
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('accountId', accountId);
      if (uname && uname.length > 0) {
        await AsyncStorage.setItem('username', uname);
      } else {
        await AsyncStorage.removeItem('username');
      }
      setAuth({ token, accountId, username: uname ?? null });
      return { ok: true, token, accountId, username: uname };
    } catch {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async function logout() {
    await AsyncStorage.multiRemove(['authToken', 'accountId', 'username']);
    // Make sure current pointer switches back to guest id immediately
    const gid = (await getCurrentGuestId()) || '';
    try { await AsyncStorage.setItem(userIdKey, gid); } catch {}
    setAuth({ token: null, accountId: null, username: null });
  }

  return (
    <AuthContext.Provider value={{ auth, registerInit, verifyRegistration, registerAndLink, loginAndLink, forgotInit, forgotConfirm, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
