import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ShopScreen from './screens/ShopScreen';
import HabitsScreen from './screens/HabitsScreen';
import TreeScreen from './screens/TreeScreen';
import AccountScreen from './screens/AccountScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useState, useEffect } from 'react';
import { UserDataProvider, useUserData } from './UserDataContext';
import { Asset } from 'expo-asset';
import { View, ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { userData, setUserData } = useUserData();
  // Daily reset logic
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    if (userData.lastOpenDate !== todayStr) {
      const resetGoodHabits = (userData.goodHabits || []).map((habit: any) => ({ ...habit, isCompleted: false }));
      setUserData((prev: any) => ({
        ...prev,
        goodHabits: resetGoodHabits,
        lastOpenDate: todayStr,
      }));
    }
  }, [userData.lastOpenDate]);

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
