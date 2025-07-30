import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function ShopScreen({ setDecay, setExp }: { setDecay?: (d: number) => void; setExp?: (e: number) => void }) {
  const handleSetDecayZero = () => {
    if (setDecay) setDecay(0);
  };
  const handleSetExpZero = () => {
    if (setExp) setExp(0);
  };
  return (
    <View style={styles.screen}>
      <Button title="Set decay to 0" onPress={handleSetDecayZero} />
      <View style={{ height: 16 }} />
      <Button title="Set EXP to 0" onPress={handleSetExpZero} />
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
