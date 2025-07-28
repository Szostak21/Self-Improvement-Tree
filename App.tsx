import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ShopScreen from './screens/ShopScreen';
import HabitsScreen from './screens/HabitsScreen';
import TreeScreen from './screens/TreeScreen';
import AccountScreen from './screens/AccountScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Tree">
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen name="Habits" component={HabitsScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Tree" component={TreeScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Account" component={AccountScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
