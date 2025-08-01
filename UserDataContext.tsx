import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Typy danych użytkownika
export interface GoodHabit {
  name: string;
  expLevel: number;
  goldLevel: number;
  isCompleted?: boolean;
  upgrades?: { [upgradeName: string]: number };
}

export interface BadHabit {
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
};


const UserDataContext = createContext<{
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  saveUserData: () => Promise<void>;
  resetUserData: () => Promise<void>;
} | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  // Wczytaj dane z AsyncStorage przy starcie
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem('userData');
        if (json) setUserData(JSON.parse(json));
      } catch (e) { /* obsłuż błąd */ }
    })();
  }, []);

  // Zapisuj dane przy każdej zmianie
  useEffect(() => {
    AsyncStorage.setItem('userData', JSON.stringify(userData));
  }, [userData]);


  const saveUserData = async () => {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  };

  // Reset user data to default and save to AsyncStorage
  const resetUserData = async () => {
    setUserData(defaultUserData);
    await AsyncStorage.setItem('userData', JSON.stringify(defaultUserData));
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
