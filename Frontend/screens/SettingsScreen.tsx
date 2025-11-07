import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput, Modal, DevSettings } from 'react-native';
import { useUserData } from '../UserDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function SettingsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [devUnlocked, setDevUnlocked] = useState(false);
  const { userData, setUserData } = useUserData();

  const handleDevOptions = () => {
    setModalVisible(true);
  };

  const handlePasswordSubmit = () => {
    if (password === 'dupa') {
      setModalVisible(false);
      setPassword('');
      setDevUnlocked(true);
      Alert.alert('Developer Options', 'Access granted!');
    } else {
      Alert.alert('Incorrect Password', 'The password you entered is incorrect.');
    }
  };

  // Clear all local app data (AsyncStorage) and reset in-memory state
  const clearLocalData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const importantKeys = [
        'userData', 
        'authToken', 
        'accountId', 
        'username', 
        'sut_user_id', 
        'sut_guest_user_id',
        '@tutorialProgress'  // Tutorial progress data - will reset tutorials on next app launch
      ];
      const toRemove = keys.filter(k => k.startsWith('userData:') || importantKeys.includes(k));
      if (toRemove.length) {
        await AsyncStorage.multiRemove(toRemove);
      }
      // Do NOT modify in-memory state to avoid triggering sync; reload instead
      Alert.alert('Local data cleared', 'The app will reload.');
      DevSettings.reload();
    } catch (e) {
      Alert.alert('Error', 'Failed to clear local data.');
    }
  };

  // Simulate new day logic (moved from AccountScreen)
  const simulateNewDay = async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yyyy = yesterday.getFullYear();
      const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
      const dd = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayStr = `${yyyy}-${mm}-${dd}`;
      setUserData((prev) => ({ ...prev, lastOpenDate: yesterdayStr }));
      Alert.alert('Test', 'lastOpenDate set to yesterday. Restart app to test daily reset.');
    } catch (e) {
      Alert.alert('Error', 'Failed to simulate new day.');
    }
  };

  // Add 100 gems
  const addGems = async () => {
    const newGems = (userData?.gems || 0) + 100;
    setUserData((prev) => ({ ...prev, gems: newGems }));
    Alert.alert('Gems Added', '+100 gems');
  };

  // Add 1000 coins
  const addCoins = async () => {
    const newCoins = (userData?.coins || 0) + 1000;
    setUserData((prev) => ({ ...prev, coins: newCoins }));
    Alert.alert('Coins Added', '+1000 coins');
  };

  return (
    <View style={styles.screen}>
      <View style={{ marginTop: 32 }}>
        <Button title="Developer Options" color="#888" onPress={handleDevOptions} />
      </View>

      {devUnlocked && (
        <>
          <View style={{ marginTop: 24 }}>
            <Button title="Clear Local Data" color="#d32f2f" onPress={clearLocalData} />
          </View>
          <View style={{ marginTop: 24 }}>
            <Button title="Test: Simulate New Day (for daily reset)" color="#e6b800" onPress={simulateNewDay} />
          </View>
          <View style={{ marginTop: 24, flexDirection: 'row' }}>
            <Button title="+100 Gems" color="#4cafef" onPress={addGems} />
            <View style={{ width: 16 }} />
            <Button title="+1000 Coins" color="#ffd700" onPress={addCoins} />
          </View>
        </>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 12 }}>Enter Developer Password:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              autoFocus
            />
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <Button title="Cancel" onPress={() => { setModalVisible(false); setPassword(''); }} />
              <View style={{ width: 16 }} />
              <Button title="Submit" onPress={handlePasswordSubmit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    minWidth: 260,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    width: 220,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
});
