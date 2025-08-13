import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ShopScreen from './screens/ShopScreen';
import HabitsScreen from './screens/HabitsScreen';
import TreeScreen from './screens/TreeScreen';
import AccountScreen from './screens/AccountScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useState, useEffect, useContext } from 'react';
import { UserDataProvider, useUserData } from './UserDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { View, ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { userData, setUserData } = useUserData();
  // Daily reset logic
  useEffect(() => {
    (async () => {
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const json = await AsyncStorage.getItem('userData');
        if (json) {
          const data = JSON.parse(json);
          if (data.lastOpenDate !== todayStr) {
            // New day: reset isCompleted for all good habits
            const resetGoodHabits = (data.goodHabits || []).map((habit: any) => ({ ...habit, isCompleted: false }));
            setUserData((prev: any) => ({
              ...prev,
              goodHabits: resetGoodHabits,
              lastOpenDate: todayStr,
            }));
            // Save to AsyncStorage as well
            await AsyncStorage.setItem('userData', JSON.stringify({ ...data, goodHabits: resetGoodHabits, lastOpenDate: todayStr }));
          }
        }
      } catch (e) { /* handle error */ }
    })();
  }, [setUserData]);

  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Tree">
        <Tab.Screen name="Shop" options={{ headerShown: false }} component={ShopScreen} />
        <Tab.Screen name="Habits" options={{ headerShown: false }} component={HabitsScreen} />
        <Tab.Screen name="Tree" options={{ headerShown: false }} component={TreeScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      await Asset.loadAsync([
        // Tree images
        require('./assets/tree/tree_1.png'),
        require('./assets/tree/tree_2.png'),
        require('./assets/tree/tree_3.png'),
        require('./assets/tree/tree_4.png'),
        require('./assets/tree/tree_5.png'),
        require('./assets/tree/tree_6.png'),
        require('./assets/tree/tree_7.png'),
        require('./assets/coin.png'),
        require('./assets/gem.png'),
        require('./assets/tree_background.png'),
        require('./assets/items/calendar.png'),
        require('./assets/items/fertilizer.png'),
        require('./assets/items/shovel.png'),
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
    <UserDataProvider>
      <AppContent />
    </UserDataProvider>
  );
}
