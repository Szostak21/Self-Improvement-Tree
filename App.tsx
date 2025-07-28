import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ImageBackground, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useState } from 'react';
import { Button, TouchableOpacity, Modal, TextInput } from 'react-native';

const Tab = createBottomTabNavigator();

function ShopScreen() {
  return (
    <View style={styles.screen}><Text>Shop</Text></View>
  );
}
function HabitsScreen() {
  const [goodHabits, setGoodHabits] = useState<string[]>([]);
  const [badHabits, setBadHabits] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editHabitIdx, setEditHabitIdx] = useState<number | null>(null);
  const [editHabitText, setEditHabitText] = useState('');
  const [maxGoodHabits, setMaxGoodHabits] = useState(2); // base limit
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  // Bad habits modal state
  const [badModalVisible, setBadModalVisible] = useState(false);
  const [newBadHabit, setNewBadHabit] = useState('');
  const [editBadModalVisible, setEditBadModalVisible] = useState(false);
  const [editBadHabitIdx, setEditBadHabitIdx] = useState<number | null>(null);
  const [editBadHabitText, setEditBadHabitText] = useState('');
  const [maxBadHabits, setMaxBadHabits] = useState(2); // base limit
  const [badLimitModalVisible, setBadLimitModalVisible] = useState(false);

  // Good habits logic
  const handleAddHabit = () => {
    if (newHabit.trim()) {
      setGoodHabits([...goodHabits, newHabit.trim()]);
      setNewHabit('');
      setModalVisible(false);
    }
  };
  const handleEditHabit = () => {
    if (editHabitIdx !== null && editHabitText.trim()) {
      const updated = [...goodHabits];
      updated[editHabitIdx] = editHabitText.trim();
      setGoodHabits(updated);
      setEditModalVisible(false);
    }
  };
  const handleDeleteHabit = () => {
    if (editHabitIdx !== null) {
      const updated = goodHabits.filter((_, idx) => idx !== editHabitIdx);
      setGoodHabits(updated);
      setEditModalVisible(false);
    }
  };
  const handleAddButtonPress = () => {
    if (goodHabits.length >= maxGoodHabits) {
      setLimitModalVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  // Bad habits logic
  const handleAddBadHabit = () => {
    if (newBadHabit.trim()) {
      setBadHabits([...badHabits, newBadHabit.trim()]);
      setNewBadHabit('');
      setBadModalVisible(false);
    }
  };
  const handleEditBadHabit = () => {
    if (editBadHabitIdx !== null && editBadHabitText.trim()) {
      const updated = [...badHabits];
      updated[editBadHabitIdx] = editBadHabitText.trim();
      setBadHabits(updated);
      setEditBadModalVisible(false);
    }
  };
  const handleDeleteBadHabit = () => {
    if (editBadHabitIdx !== null) {
      const updated = badHabits.filter((_, idx) => idx !== editBadHabitIdx);
      setBadHabits(updated);
      setEditBadModalVisible(false);
    }
  };
  const handleAddBadButtonPress = () => {
    if (badHabits.length >= maxBadHabits) {
      setBadLimitModalVisible(true);
    } else {
      setBadModalVisible(true);
    }
  };

  return (
    <View style={styles.habitsScreenSplit}>
      {/* Top left: Bad Habits label box, dark brown */}
      <View style={[styles.habitLabelBox, { left: '8%', width: '34%', alignItems: 'center', backgroundColor: '#4b2e19' }]}> 
        <Text style={styles.habitLabelText}>Bad Habits</Text>
      </View>
      {/* Top right: Good Habits label box, keep as is */}
      <View style={[styles.habitLabelBox, { right: '8%', width: '34%', alignItems: 'center' }]}> 
        <Text style={styles.habitLabelText}>Good Habits</Text>
      </View>
      <View style={styles.habitsHalfBad}>
        {/* Bad Habits List */}
        <View style={{ width: '80%', marginTop: 90 }}>
          {badHabits.map((habit, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setEditBadHabitIdx(idx);
                setEditBadHabitText(habit);
                setEditBadModalVisible(true);
              }}
            >
              <View style={{ backgroundColor: '#fff3e6', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <Text style={{ color: '#4b2e19', fontWeight: 'bold' }}>{habit}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addBadHabit} onPress={handleAddBadButtonPress}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
        {/* Modal for adding bad habit */}
        <Modal
          visible={badModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setBadModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#4b2e19' }}>Add Bad Habit</Text>
              <TextInput
                value={newBadHabit}
                onChangeText={setNewBadHabit}
                placeholder="Habit name"
                style={{ borderWidth: 1, borderColor: '#4b2e19', borderRadius: 8, padding: 8, marginBottom: 16 }}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button title="Cancel" onPress={() => setBadModalVisible(false)} color="#888" />
                <View style={{ width: 12 }} />
                <Button title="Add" onPress={handleAddBadHabit} color="#4b2e19" />
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal for editing/deleting bad habit */}
        <Modal
          visible={editBadModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditBadModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#4b2e19' }}>Edit Bad Habit</Text>
              <TextInput
                value={editBadHabitText}
                onChangeText={setEditBadHabitText}
                placeholder="Habit name"
                style={{ borderWidth: 1, borderColor: '#4b2e19', borderRadius: 8, padding: 8, marginBottom: 16 }}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button title="Delete" onPress={handleDeleteBadHabit} color="#d32f2f" />
                <View style={{ width: 12 }} />
                <Button title="Save" onPress={handleEditBadHabit} color="#4b2e19" />
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal for bad habit limit warning */}
        <Modal
          visible={badLimitModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setBadLimitModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#4b2e19', textAlign: 'center' }}>
                You must increase your maximum number of habits to add more.
              </Text>
              <Button title="OK" onPress={() => setBadLimitModalVisible(false)} color="#4b2e19" />
            </View>
          </View>
        </Modal>
      </View>
      {/* End of habitsHalfBad column */}
      <View style={styles.habitsHalfGood}>
        {/* Good Habits List */}
        <View style={{ width: '80%', marginTop: 90 }}>
          {goodHabits.map((habit, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setEditHabitIdx(idx);
                setEditHabitText(habit);
                setEditModalVisible(true);
              }}
            >
              <View style={{ backgroundColor: '#e6fff6', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <Text style={{ color: '#176d3b', fontWeight: 'bold' }}>{habit}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addGoodHabit} onPress={handleAddButtonPress}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
        {/* Modal for adding habit */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#176d3b' }}>Add Good Habit</Text>
              <TextInput
                value={newHabit}
                onChangeText={setNewHabit}
                placeholder="Habit name"
                style={{ borderWidth: 1, borderColor: '#176d3b', borderRadius: 8, padding: 8, marginBottom: 16 }}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} color="#888" />
                <View style={{ width: 12 }} />
                <Button title="Add" onPress={handleAddHabit} color="#176d3b" />
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal for editing/deleting habit */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#176d3b' }}>Edit Good Habit</Text>
              <TextInput
                value={editHabitText}
                onChangeText={setEditHabitText}
                placeholder="Habit name"
                style={{ borderWidth: 1, borderColor: '#176d3b', borderRadius: 8, padding: 8, marginBottom: 16 }}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button title="Delete" onPress={handleDeleteHabit} color="#d32f2f" />
                <View style={{ width: 12 }} />
                <Button title="Save" onPress={handleEditHabit} color="#176d3b" />
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal for habit limit warning */}
        <Modal
          visible={limitModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setLimitModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#176d3b', textAlign: 'center' }}>
                You must increase your maximum number of habits to add more.
              </Text>
              <Button title="OK" onPress={() => setLimitModalVisible(false)} color="#176d3b" />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
function TreeScreen() {
  const [exp, setExp] = useState(50);
  const [decay, setDecay] = useState(50);
  const [coins, setCoins] = useState(100);
  const [gems, setGems] = useState(10);
  return (
    <View style={{flex: 1}}>
      <View style={[styles.balanceBarContainer, { top: 70 }]}>
        <View style={styles.balanceBar}>
          <Image source={require('./assets/coin.png')} style={styles.balanceIcon} />
          <Text style={styles.balanceText}>{coins}</Text>
        </View>
        <View style={styles.balanceBar}>
          <Image source={require('./assets/gem.png')} style={styles.balanceIcon} />
          <Text style={styles.balanceText}>{gems}</Text>
        </View>
      </View>
      {/* Top 70%: Tree background */}
      <View style={{flex: 7}}>
        <ImageBackground source={require('./assets/tree_background.png')} style={styles.treeBg}>
          <View style={styles.screen}>
            {/* Tree image and other content can go here */}
          </View>
        </ImageBackground>
      </View>
      {/* Bottom 30%: Brown frame with progress bars */}
      <View style={styles.treeFrame}>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'column' }}>
          {/* Green bar at top, 80% width, centered, EXP box in left 10% */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 }}>
            {/* Left padding equal to coin/gem bar left (10px) */}
            <View style={{ width: 10 }} />
            {/* EXP box */}
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', height: 20 }}>
              <View style={{ height: 20, minWidth: 38, backgroundColor: '#4bbf7f', borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingLeft: 8, paddingRight: 8 }}>
                <Text style={{ color: '#176d3b', fontWeight: 'bold', fontSize: 12 }}>EXP</Text>
              </View>
            </View>
            {/* Padding equal to left padding (10px) */}
            <View style={{ width: 10 }} />
            {/* Green bar, width 70% of screen minus exp box and paddings */}
            <View style={{ flex: 1, minWidth: 0, justifyContent: 'center', alignItems: 'center', height: 20 }}>
              <View style={[styles.progressBarBg, { width: '100%', height: 20, marginVertical: 0 }]}> 
                <View style={[styles.progressBar, { width: `${exp}%`, backgroundColor: '#4bbf7f', height: 20 }]} />
              </View>
            </View>
            {/* Padding equal to exp box width + paddings (38+8+8=54px) */}
            <View style={{ width: 54 }} />
          </View>
          {/* Red bar below, 50% width, thinner and closer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', height: 12 }}>
            {/* Further increased left padding */}
            <View style={{ width: 64 }} />
            {/* Decay label box */}
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', height: 12 }}>
              <View style={{ height: 12, minWidth: 38, backgroundColor: '#ff0000', borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingLeft: 6, paddingRight: 6 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>decay</Text>
              </View>
            </View>
            {/* Decreased padding between box and bar */}
            <View style={{ width: 8 }} />
            {/* Red progress bar, even shorter width (40% of available space) */}
            <View style={[styles.progressBarBg, { width: '40%', height: 12, backgroundColor: '#eee', borderRadius: 6, marginVertical: 0 }]}> 
              <View style={[styles.progressBar, { width: `${decay}%`, backgroundColor: '#ff0000', height: 12, borderRadius: 6 }]} />
            </View>
            {/* Further increased right padding to match left + box + between */}
            <View style={{ width: 64 + 38 + 24 }} />
          </View>
        </View>
      </View>
    </View>
  );
}
function AccountScreen() {
  return (
    <View style={styles.screen}><Text>Account</Text></View>
  );
}
function SettingsScreen() {
  return (
    <View style={styles.screen}><Text>Settings</Text></View>
  );
}

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeBg: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  treeFrame: {
    height: '30%',
    backgroundColor: 'brown',
    borderWidth: 0,
    borderColor: 'black', // changed from #ccc to black
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  progressBarContainer: {
    width: '40%',
    marginBottom: 0,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 5,
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
  },
  addGoodHabit: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#176d3b', // match right box color
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  addBadHabit: {
    position: 'absolute',
    left: 30,
    bottom: 30,
    backgroundColor: '#4b2e19', // match left box color
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  plus: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false, // helps vertical centering on Android
    lineHeight: 60, // match button height for perfect vertical centering
    marginTop: -4, // move + sign upwards slightly
  },
  habitsScreenSplit: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fff',
  },
  habitsHalfGood: {
    flex: 1,
    backgroundColor: '#7fd8be', // slightly darker light green
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  habitsHalfBad: {
    flex: 1,
    backgroundColor: '#bfa16b', // slightly darker light brown
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  habitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  habitsLabelContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  habitsLabelLine: {
    width: '80%',
    height: 4,
    backgroundColor: '#000',
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 2,
  },
  balanceBarContainer: {
    position: 'absolute',
    top: 70,
    left: 10,
    zIndex: 10,
  },
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
    minWidth: 80,
  },
  balanceIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitLabelBox: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#176d3b', // slightly darker green for Good Habits box
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 20,
  },
  habitLabelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
