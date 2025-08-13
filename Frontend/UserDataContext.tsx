import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.1.2.52:8080';

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

  async function getOrCreateUserId() {
    let id = await AsyncStorage.getItem(userIdKey);
    if (!id) {
      // simple UUID v4 generator
      id = genId();
      await AsyncStorage.setItem(userIdKey, id);
    }
    return id;
  }

  async function fetchFromBackend(id: string): Promise<UserData | null> {
    try {
      const res = await fetch(`${API_BASE}/api/userdata/${id}`);
      if (res.status === 200) {
        const json = await res.text();
        return JSON.parse(json) as UserData;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async function readFromLocal(): Promise<UserData | null> {
    try {
      const json = await AsyncStorage.getItem('userData');
      return json ? (JSON.parse(json) as UserData) : null;
    } catch {
      return null;
    }
  }

  async function saveToBackend(id: string, data: UserData) {
    try {
      await fetch(`${API_BASE}/api/userdata/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const [backendData, localData] = await Promise.all([
        fetchFromBackend(id),
        readFromLocal(),
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
        // sync both sides to the chosen copy
        try { await AsyncStorage.setItem('userData', JSON.stringify(dataToPersist)); } catch {}
        await saveToBackend(id, dataToPersist);
      }
      setLoaded(true);
    })();
  }, []);

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
      const dataToPersist = { ...userData, updatedAt: Date.now() } as UserData;
      try { await AsyncStorage.setItem('userData', JSON.stringify(dataToPersist)); } catch {}
      const id = await getOrCreateUserId();
      await saveToBackend(id, dataToPersist);
    })();
  }, [userData, loaded]);

  const saveUserData = async () => {
    const dataToPersist = { ...userData, updatedAt: Date.now() } as UserData;
    try { await AsyncStorage.setItem('userData', JSON.stringify(dataToPersist)); } catch {}
    const id = await getOrCreateUserId();
    await saveToBackend(id, dataToPersist);
  };

  const resetUserData = async () => {
    const reset = { ...defaultUserData, updatedAt: Date.now() } as UserData;
    setUserData(reset);
    try { await AsyncStorage.setItem('userData', JSON.stringify(reset)); } catch {}
    const id = await getOrCreateUserId();
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
