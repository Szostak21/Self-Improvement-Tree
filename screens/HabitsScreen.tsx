import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Image } from 'react-native';

const UpgradeButton = ({ label = "Upgrade", cost = 10 }) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    minWidth: 64,
  }}>
    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#176d3b', marginBottom: 2 }}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('../assets/coin.png')}
        style={{ width: 16, height: 16, marginRight: 4 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000' }}>{cost}</Text>
    </View>
  </View>
);

export default function HabitsScreen({
  goodHabits,
  setGoodHabits,
  badHabits,
  setBadHabits,
  coins,
}: {
  goodHabits: { name: string; expLevel: number; goldLevel: number }[];
  setGoodHabits: React.Dispatch<React.SetStateAction<{ name: string; expLevel: number; goldLevel: number }[]>>;
  badHabits: { name: string; decayLevel: number; expLossLevel: number }[];
  setBadHabits: React.Dispatch<React.SetStateAction<{ name: string; decayLevel: number; expLossLevel: number }[]>>;
  coins: number;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editHabitIdx, setEditHabitIdx] = useState<number | null>(null);
  const [editHabitText, setEditHabitText] = useState('');
  const [editExpLevel, setEditExpLevel] = useState(1);
  const [editGoldLevel, setEditGoldLevel] = useState(1);
  const [maxGoodHabits, setMaxGoodHabits] = useState(2);
  const [limitModalVisible, setLimitModalVisible] = useState(false);

  const [badModalVisible, setBadModalVisible] = useState(false);
  const [newBadHabit, setNewBadHabit] = useState('');
  const [editBadModalVisible, setEditBadModalVisible] = useState(false);
  const [editBadHabitIdx, setEditBadHabitIdx] = useState<number | null>(null);
  const [editBadHabitText, setEditBadHabitText] = useState('');
  const [editDecayLevel, setEditDecayLevel] = useState(1);
  const [editExpLossLevel, setEditExpLossLevel] = useState(1);
  const [maxBadHabits, setMaxBadHabits] = useState(2);
  const [badLimitModalVisible, setBadLimitModalVisible] = useState(false);

  // Good habits logic
  const handleAddHabit = () => {
    if (newHabit.trim()) {
      setGoodHabits([
        ...goodHabits,
        { name: newHabit.trim(), expLevel: 1, goldLevel: 1 },
      ]);
      setNewHabit('');
      setModalVisible(false);
    }
  };
  const handleEditHabit = () => {
    if (editHabitIdx !== null && editHabitText.trim()) {
      const updated = [...goodHabits];
      updated[editHabitIdx] = {
        name: editHabitText.trim(),
        expLevel: editExpLevel,
        goldLevel: editGoldLevel,
      };
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
      setBadHabits([
        ...badHabits,
        { name: newBadHabit.trim(), decayLevel: 1, expLossLevel: 1 },
      ]);
      setNewBadHabit('');
      setBadModalVisible(false);
    }
  };
  const handleEditBadHabit = () => {
    if (editBadHabitIdx !== null && editBadHabitText.trim()) {
      const updated = [...badHabits];
      updated[editBadHabitIdx] = {
        name: editBadHabitText.trim(),
        decayLevel: editDecayLevel,
        expLossLevel: editExpLossLevel,
      };
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
      {/* Top right: Good Habits label box */}
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
            setEditBadHabitText(habit.name);
            setEditDecayLevel(habit.decayLevel);
            setEditExpLossLevel(habit.expLossLevel);
            setEditBadModalVisible(true);
          }}
        >
          <View style={styles.badHabitBox}>
            {/* Habit name */}
            <Text style={styles.badHabitText}>{habit.name}</Text>
            {/* Decay label and progress bar */}
            <View style={styles.decayRow}>
              <Text style={styles.decayLabel}>Decay</Text>
              <View style={styles.decayBarContainer}>
                {[...Array(5)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.decayBarLevel,
                      i < habit.decayLevel ? styles.decayBarLevelFilled : styles.decayBarLevel
                    ]}
                  />
                ))}
              </View>
            </View>
            {/* EXP loss label and progress bar */}
            <View style={styles.expLossRow}>
              <Text style={styles.expLossLabel}>EXP loss</Text>
              <View style={styles.expLossBarContainer}>
                {[...Array(5)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.expLossBarLevel,
                      i < habit.expLossLevel ? styles.expLossBarLevelFilled : styles.expLossBarLevel
                    ]}
                  />
                ))}
              </View>
            </View>
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
              <View style={{ position: 'absolute', top: 24, right: 24, flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('../assets/coin.png')}
                  style={{ width: 24, height: 24, marginRight: 6 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
                  {coins}
                </Text>
              </View>
              {/* Habit name input */}
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#4b2e19' }}>Edit Bad Habit</Text>
              <TextInput
                value={editBadHabitText}
                onChangeText={setEditBadHabitText}
                placeholder="Habit name"
                style={{ borderWidth: 1, borderColor: '#4b2e19', borderRadius: 8, padding: 8, marginBottom: 16 }}
                autoFocus={false}
              />
              {/* Decay row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                <Text style={styles.decayLabel}>Decay</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.decayBarContainer}>
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.decayBarLevel,
                          i < 1 ? styles.decayBarLevelFilled : styles.decayBarLevel // 1/5 filled
                        ]}
                      />
                    ))}
                  </View>
                  <View style={{ width: 16 }} />
                  <TouchableOpacity onPress={() => { /* upgrade logic here */ }}>
                    <UpgradeButton cost={10} />
                  </TouchableOpacity>
                </View>
              </View>
              {/* EXP loss row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                <Text style={styles.expLossLabel}>EXP loss</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.expLossBarContainer}>
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.expLossBarLevel,
                          i < 1 ? styles.expLossBarLevelFilled : styles.expLossBarLevel // 1/5 filled
                        ]}
                      />
                    ))}
                  </View>
                  <View style={{ width: 16 }} /> 
                  <TouchableOpacity onPress={() => { /* upgrade logic here */ }}>
                    <UpgradeButton cost={10} />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Delete and Exit buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <Button title="Delete" onPress={handleDeleteBadHabit} color="#d32f2f" />
                <View style={{ width: 12 }} />
                <Button
                  title="Exit"
                  onPress={() => {
                    if (editBadHabitIdx !== null && editBadHabitText.trim()) {
                      const updated = [...badHabits];
                      updated[editBadHabitIdx] = {
                        name: editBadHabitText.trim(),
                        decayLevel: editDecayLevel,
                        expLossLevel: editExpLossLevel,
                      };
                      setBadHabits(updated);
                    }
                    setEditBadModalVisible(false);
                  }}
                  color="#4b2e19"
                />
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
            setEditHabitText(habit.name);
            setEditExpLevel(habit.expLevel);
            setEditGoldLevel(habit.goldLevel);
            setEditModalVisible(true);
          }}
        >
          <View style={styles.goodHabitBox}>
            <Text style={styles.goodHabitText}>{habit.name}</Text>
            <View style={styles.expRow}>
              <Text style={styles.expLabel}>EXP gain</Text>
              <View style={styles.expBarContainer}>
                {[...Array(5)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.expBarLevel,
                      i < habit.expLevel ? styles.expBarLevelFilled : styles.expBarLevelEmpty
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={styles.goldRow}>
              <Text style={styles.goldLabel}>Gold gain</Text>
              <View style={styles.goldBarContainer}>
                {[...Array(5)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.goldBarLevel,
                      i < habit.goldLevel ? styles.goldBarLevelFilled : styles.goldBarLevelEmpty
                    ]}
                  />
                ))}
              </View>
            </View>
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
              <View style={{ position: 'absolute', top: 24, right: 24, flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('../assets/coin.png')}
                  style={{ width: 24, height: 24, marginRight: 6 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
                  {coins}
                </Text>
              </View>
              {/* Habit name input */}
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#176d3b' }}>Edit Good Habit</Text>
              <TextInput
                value={editHabitText}
                onChangeText={setEditHabitText}
                placeholder="Habit name"
                style={{ borderWidth: 1, borderColor: '#176d3b', borderRadius: 8, padding: 8, marginBottom: 16 }}
                autoFocus={false} // Change from autoFocus to false
              />
              {/* EXP gain row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                <Text style={styles.expLabel}>EXP gain</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.expBarContainer}>
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.expBarLevel,
                          i < 1 ? styles.expBarLevelFilled : styles.expBarLevelEmpty // 1/5 filled
                        ]}
                      />
                    ))}
                  </View>
                  <View style={{ width: 16 }} /> 
                  <TouchableOpacity onPress={() => { /* upgrade logic here */ }}>
                    <UpgradeButton cost={10} />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Gold gain row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                <Text style={styles.goldLabel}>Gold gain</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.goldBarContainer}>
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.goldBarLevel,
                          i < 1 ? styles.goldBarLevelFilled : styles.goldBarLevelEmpty // 1/5 filled
                        ]}
                      />
                    ))}
                  </View>
                  <View style={{ width: 16 }} /> 
                  <TouchableOpacity onPress={() => { /* upgrade logic here */ }}>
                    <UpgradeButton cost={10} />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Delete and Exit buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <Button title="Delete" onPress={handleDeleteHabit} color="#d32f2f" />
                <View style={{ width: 12 }} />
                <Button
                  title="Exit"
                  onPress={() => {
                    if (editHabitIdx !== null && editHabitText.trim()) {
                      const updated = [...goodHabits];
                      updated[editHabitIdx] = {
                        name: editHabitText.trim(),
                        expLevel: editExpLevel,
                        goldLevel: editGoldLevel,
                      };
                      setGoodHabits(updated);
                    }
                    setEditModalVisible(false);
                  }}
                  color="#176d3b"
                />
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  addGoodHabit: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#176d3b',
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
    backgroundColor: '#4b2e19',
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
    includeFontPadding: false,
    lineHeight: 60,
    marginTop: -4,
  },
  habitLabelBox: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#176d3b',
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
  goodHabitBox: {
    backgroundColor: '#e6fff6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'flex-start',
    elevation: 2,
    paddingRight: 6, // Reduced right padding for smaller margin
  },
  goodHabitText: {
    color: '#176d3b',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',           // Make row fill the box
    justifyContent: 'space-between', // Space label and bar apart
  },
  expLabel: {
    color: '#176d3b',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  expBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
    // Remove marginLeft, let justifyContent handle spacing
  },
  expBarLevel: {
    width: 12,            // reduced width
    height: 7,            // reduced height
    borderRadius: 2,
    marginHorizontal: 1,  // reduced margin
    borderWidth: 1,
    borderColor: '#176d3b',
  },
  expBarLevelFilled: {
    backgroundColor: '#4bbf7f',
  },
  expBarLevelEmpty: {
    backgroundColor: '#fff',
  },
  goldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',           // Make row fill the box
    justifyContent: 'space-between', // Space label and bar apart
  },
  goldLabel: {
    color: '#bfa16b',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  goldBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
    // Remove marginLeft, let justifyContent handle spacing
  },
  goldBarLevel: {
    width: 12,
    height: 7,
    borderRadius: 2,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: '#bfa16b',
  },
  goldBarLevelFilled: {
    backgroundColor: '#ffe082',
  },
  goldBarLevelEmpty: {
    backgroundColor: '#fff',
  },
  badHabitBox: {
    backgroundColor: '#fff3e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'flex-start',
    elevation: 2,
    paddingRight: 6,
  },
  badHabitText: {
    color: '#4b2e19',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  decayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
    justifyContent: 'space-between',
  },
  decayLabel: {
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  decayBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
  },
  decayBarLevel: {
    width: 12,
    height: 7,
    borderRadius: 2,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  decayBarLevelFilled: {
    backgroundColor: '#ffd6d6',
  },
  expLossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
    justifyContent: 'space-between',
  },
  expLossLabel: {
    color: '#b71c1c',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  expLossBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
  },
  expLossBarLevel: {
    width: 12,
    height: 7,
    borderRadius: 2,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: '#b71c1c',
  },
  expLossBarLevelFilled: {
    backgroundColor: '#ffcdd2',
  },
});