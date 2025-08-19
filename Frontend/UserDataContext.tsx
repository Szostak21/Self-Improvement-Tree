import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_BASE } from './config';


// Typy danych użytkownika
export interface GoodHabit {
  id?: string; // stable id to keep references across renames
  name: string;
  expLevel: number;
  goldLevel: number;
  isCompleted?: boolean;
  upgrades?: { [upgradeName: string]: number };
}

export interface BadHabit {
  id?: string; // stable id to keep references across renames
  name: string;
  decayLevel: number;
  expLossLevel: number;
  upgrades?: { [upgradeName: string]: number };
}

export interface UserData {
  goodHabits: GoodHabit[];
  badHabits: BadHabit[];
  coins: number;
  gems: number;
  exp: number;
  decay: number;
  lastOpenDate: string | null;
  calendarBoughtCount: number;
  maxGoodHabits: number;
  treeStage?: number;
  expToLevel?: number;
  // Persist daily checks per habit (keyed by stable key, prefer id)
  checkedGoodToday?: { [key: string]: boolean };
  checkedBadToday?: { [key: string]: boolean };
  // logical timestamp used only for merge between local and backend
  updatedAt?: number;
}

const defaultUserData: UserData = {
  goodHabits: [],
  badHabits: [],
  coins: 50,
  gems: 10,
  exp: 0,
  decay: 0,
  lastOpenDate: null,
  calendarBoughtCount: 0,
  maxGoodHabits: 1,
  treeStage: 1,
  expToLevel: 40,
  checkedGoodToday: {},
  checkedBadToday: {},
};


const UserDataContext = createContext<{
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  saveUserData: () => Promise<void>;
  resetUserData: () => Promise<void>;
} | undefined>(undefined);

// simple UUID v4 generator
function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ensureHabitIds(data: UserData): { data: UserData; changed: boolean } {
  let changed = false;
  const good = (data.goodHabits || []).map(h => {
    if (!h.id) {
      changed = true;
      return { ...h, id: genId() };
    }
    return h;
  });
  const bad = (data.badHabits || []).map(h => {
    if (!h.id) {
      changed = true;
      return { ...h, id: genId() };
    }
    return h;
  });
  return { data: { ...data, goodHabits: good, badHabits: bad }, changed };
}

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loaded, setLoaded] = useState(false); // mark when initial load/migration is done
  const userIdKey = 'sut_user_id';
  const guestIdKey = 'sut_guest_user_id';
  const { auth } = useAuth();

  function localKeyFor(id: string) {
    return `userData:${id}`;
  }

  async function getOrCreateGuestId() {
    let gid = await AsyncStorage.getItem(guestIdKey);
    if (!gid) {
      gid = genId();
      await AsyncStorage.setItem(guestIdKey, gid);
    }
    return gid;
  }

  async function getOrCreateUserId() {
    // If logged in, always use accountId and persist it locally
    if (auth?.accountId) {
      try { await AsyncStorage.setItem(userIdKey, auth.accountId); } catch {}
      return auth.accountId;
    }
    // Use dedicated persistent guest id
    const gid = await getOrCreateGuestId();
    try { await AsyncStorage.setItem(userIdKey, gid); } catch {}
    return gid;
  }

  async function fetchFromBackend(id: string): Promise<UserData | null> {
    try {
      const headers: Record<string, string> = {};
      if (auth?.token) headers['Authorization'] = `Bearer ${auth.token}`;
      const res = await fetch(`${API_BASE}/api/userdata/${id}`, { headers });
      if (res.status === 200) {
        const json = await res.text();
        return JSON.parse(json) as UserData;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async function readFromLocal(id: string): Promise<UserData | null> {
    try {
      const key = localKeyFor(id);
      let json = await AsyncStorage.getItem(key);
      if (json) return JSON.parse(json) as UserData;
      // migrate from legacy single key if present
      const legacy = await AsyncStorage.getItem('userData');
      if (legacy) {
        const parsed = JSON.parse(legacy) as UserData;
        try { await AsyncStorage.setItem(key, legacy); } catch {}
        try { await AsyncStorage.removeItem('userData'); } catch {}
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function saveToLocal(id: string, data: UserData) {
    try { await AsyncStorage.setItem(localKeyFor(id), JSON.stringify(data)); } catch {}
  }

  async function saveToBackend(id: string, data: UserData) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (auth?.token) headers['Authorization'] = `Bearer ${auth.token}`;
      await fetch(`${API_BASE}/api/userdata/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
    } catch (e) {
      // ignore offline
    }
  }

  // Init: pick the newer of backend vs local and sync the other side
  useEffect(() => {
    (async () => {
      const id = await getOrCreateUserId();

      // If we already have an accountId (e.g., returning user on new device), always prefer backend first
      if (auth?.accountId) {
        const backendData = await fetchFromBackend(id);
        if (backendData) {
          const ensured = ensureHabitIds(backendData);
          setUserData(ensured.data);
          const dataToPersist = { ...ensured.data, updatedAt: Date.now() } as UserData;
          await saveToLocal(id, dataToPersist);
          await saveToBackend(id, dataToPersist);
          setLoaded(true);
          return;
        }
      }

      const [backendData, localData] = await Promise.all([
        fetchFromBackend(id),
        readFromLocal(id),
      ]);

      let chosen: UserData | null = null;
      if (backendData && localData) {
        const bTs = backendData.updatedAt ?? 0;
        const lTs = localData.updatedAt ?? 0;
        chosen = lTs >= bTs ? localData : backendData;
      } else {
        chosen = backendData || localData;
      }

      if (chosen) {
        const ensured = ensureHabitIds(chosen);
        setUserData(ensured.data);
        const dataToPersist = { ...ensured.data, updatedAt: Date.now() } as UserData;
        await saveToLocal(id, dataToPersist);
        await saveToBackend(id, dataToPersist);
      } else {
        // nothing found; keep defaults but persist them for this id
        const dataToPersist = { ...defaultUserData, updatedAt: Date.now() } as UserData;
        setUserData(dataToPersist);
        await saveToLocal(id, dataToPersist);
        // Also create/seed backend copy for both guests and accounts to prevent later data-loss
        await saveToBackend(id, dataToPersist);
      }
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to auth changes: when logging in, switch to account id and prefer backend.
  // When logging out, switch to guest id and load its local/backend copy.
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      if (auth?.accountId) {
        const accountId = auth.accountId;
        const current = await AsyncStorage.getItem(userIdKey);
        if (current !== accountId) {
          try { await AsyncStorage.setItem(userIdKey, accountId); } catch {}
        }
        // Always try backend first and adopt it without overwriting until saved later
        const backendData = await fetchFromBackend(accountId);
        if (backendData) {
          const ensured = ensureHabitIds(backendData);
          const dataToPersist = { ...ensured.data, updatedAt: Date.now() } as UserData;
          setUserData(dataToPersist);
          await saveToLocal(accountId, dataToPersist);
          // Do not immediately push to backend; backend already had the source of truth
          return;
        }
        // Fallback: local for this account id
        const localData = await readFromLocal(accountId);
        if (localData) {
          const ensured = ensureHabitIds(localData);
          const dataToPersist = { ...ensured.data, updatedAt: Date.now() } as UserData;
          setUserData(dataToPersist);
          await saveToLocal(accountId, dataToPersist);
          await saveToBackend(accountId, dataToPersist);
        } else {
          const fresh = { ...defaultUserData, updatedAt: Date.now() } as UserData;
          setUserData(fresh);
          await saveToLocal(accountId, fresh);
          await saveToBackend(accountId, fresh);
        }
      } else {
        // Logged out -> switch to guest context
        const guestId = await getOrCreateGuestId();
        try { await AsyncStorage.setItem(userIdKey, guestId); } catch {}
        const [backendData, localData] = await Promise.all([
          fetchFromBackend(guestId), // allowed for guest ids
          readFromLocal(guestId),
        ]);
        let chosen: UserData | null = null;
        if (backendData && localData) {
          const bTs = backendData.updatedAt ?? 0;
          const lTs = localData.updatedAt ?? 0;
          chosen = lTs >= bTs ? localData : backendData;
        } else {
          chosen = backendData || localData;
        }
        const ensured = ensureHabitIds(chosen || defaultUserData);
        const dataToPersist = { ...ensured.data, updatedAt: Date.now() } as UserData;
        setUserData(dataToPersist);
        await saveToLocal(guestId, dataToPersist);
        // Standardize: always sync guest to backend so linking cannot drop progress
        await saveToBackend(guestId, dataToPersist);
      }
    })();
  }, [auth?.accountId, loaded]);

  // Clear per-day checks when the app detects a new day (lastOpenDate changed)
  useEffect(() => {
    if (!userData.lastOpenDate) return;
    setUserData(prev => ({
      ...prev,
      checkedGoodToday: {},
      checkedBadToday: {},
    }));
  }, [userData.lastOpenDate]);

  // Persist on any change (offline-first: local, then backend)
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      const id = await getOrCreateUserId();
      const dataToPersist = { ...userData, updatedAt: Date.now() } as UserData;
      await saveToLocal(id, dataToPersist);
      // Sync to backend for both guests and accounts to avoid loss during linking
      await saveToBackend(id, dataToPersist);
    })();
  }, [userData, loaded, auth?.accountId]);

  const saveUserData = async () => {
    const id = await getOrCreateUserId();
    const dataToPersist = { ...userData, updatedAt: Date.now() } as UserData;
    await saveToLocal(id, dataToPersist);
    // Sync for all identities
    await saveToBackend(id, dataToPersist);
  };

  const resetUserData = async () => {
    const id = await getOrCreateUserId();
    const reset = { ...defaultUserData, updatedAt: Date.now() } as UserData;
    setUserData(reset);
    await saveToLocal(id, reset);
    // Sync for all identities
    await saveToBackend(id, reset);
  };

  return (
    <UserDataContext.Provider value={{ userData, setUserData, saveUserData, resetUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
};
