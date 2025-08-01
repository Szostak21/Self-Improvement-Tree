

import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useUserData } from '../UserDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AccountScreen() {
  const { userData, setUserData, resetUserData } = useUserData();

  const handleReset = async () => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to reset your profile? This will erase all your progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: async () => { await resetUserData(); Alert.alert('Profile reset!'); } },
      ]
    );
  };

  // Simulate new day logic (copied from ShopScreen)
  const simulateNewDay = async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yyyy = yesterday.getFullYear();
      const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
      const dd = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayStr = `${yyyy}-${mm}-${dd}`;
      const newUserData = { ...userData, lastOpenDate: yesterdayStr };
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      setUserData((prev) => ({ ...prev, lastOpenDate: yesterdayStr }));
      Alert.alert('Test', 'lastOpenDate set to yesterday. Restart app to test daily reset.');
    } catch (e) {
      Alert.alert('Error', 'Failed to simulate new day.');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={{ marginTop: 32 }}>
        <Button title="Reset Profile" color="#d32f2f" onPress={handleReset} />
      </View>
      <View style={{ marginTop: 24 }}>
        <Button title="Test: Simulate New Day (for daily reset)" color="#e6b800" onPress={simulateNewDay} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
