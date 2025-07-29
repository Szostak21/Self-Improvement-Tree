import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ShopScreen from './screens/ShopScreen';
import HabitsScreen from './screens/HabitsScreen';
import TreeScreen from './screens/TreeScreen';
import AccountScreen from './screens/AccountScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';
import { View, ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  const [goodHabits, setGoodHabits] = useState<
    { name: string; expLevel: number; goldLevel: number }[]
  >([]);
  const [badHabits, setBadHabits] = useState<
    { name: string; decayLevel: number; expLossLevel: number }[]
  >([]);
  const [coins, setCoins] = useState(100);
  const [gems, setGems] = useState(10);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      await Asset.loadAsync([
        require('./assets/coin.png'),
        require('./assets/gem.png'),
        require('./assets/tree_background.png'),
      ]);
      setAssetsLoaded(true);
    }
    loadAssets();
  }, []);

  if (!assetsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#176d3b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Tree">
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen
          name="Habits"
          options={{ headerShown: false }}
        >
          {() => (
            <HabitsScreen
              goodHabits={goodHabits}
              setGoodHabits={setGoodHabits}
              badHabits={badHabits}
              setBadHabits={setBadHabits}
              coins={coins}
              setCoins={setCoins}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Tree"
          options={{ headerShown: false }}
        >
          {() => (
            <TreeScreen
              goodHabits={goodHabits}
              badHabits={badHabits}
              coins={coins}
              setCoins={setCoins}
              gems={gems}
              setGems={setGems}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Account" component={AccountScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
