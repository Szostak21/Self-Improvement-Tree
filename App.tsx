import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Load saved count on mount
    AsyncStorage.getItem('clickCount').then(value => {
      if (value !== null) setCount(Number(value));
    });
  }, []);

  const handleClick = async () => {
    const newCount = count + 1;
    setCount(newCount);
    await AsyncStorage.setItem('clickCount', String(newCount));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Clicks: {count}</Text>
      <Button title="Click me!" onPress={handleClick} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  counter: {
    fontSize: 20,
    marginVertical: 20,
  },
});
