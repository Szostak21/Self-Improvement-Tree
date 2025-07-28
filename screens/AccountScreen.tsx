import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AccountScreen() {
  return (
    <View style={styles.screen}><Text>Account</Text></View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
