import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';

export default function HabitsScreen({
  goodHabits,
  setGoodHabits,
  badHabits,
  setBadHabits,
}: {
  goodHabits: string[];
  setGoodHabits: React.Dispatch<React.SetStateAction<string[]>>;
  badHabits: string[];
  setBadHabits: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editHabitIdx, setEditHabitIdx] = useState<number | null>(null);
  const [editHabitText, setEditHabitText] = useState('');
  const [maxGoodHabits, setMaxGoodHabits] = useState(2);
  const [limitModalVisible, setLimitModalVisible] = useState(false);

  const [badModalVisible, setBadModalVisible] = useState(false);
  const [newBadHabit, setNewBadHabit] = useState('');
  const [editBadModalVisible, setEditBadModalVisible] = useState(false);
  const [editBadHabitIdx, setEditBadHabitIdx] = useState<number | null>(null);
  const [editBadHabitText, setEditBadHabitText] = useState('');
  const [maxBadHabits, setMaxBadHabits] = useState(2);
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
});