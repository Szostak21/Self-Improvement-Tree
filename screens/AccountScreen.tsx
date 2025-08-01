

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


  return (
    <View style={styles.screen}>
      <View style={{ marginTop: 32 }}>
        <Button title="Reset Profile" color="#d32f2f" onPress={handleReset} />
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
