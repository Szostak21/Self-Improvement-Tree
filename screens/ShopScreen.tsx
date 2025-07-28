import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ShopScreen() {
  return (
    <View style={styles.screen}><Text>Shop</Text></View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
