import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function TreeScreen({
  goodHabits = [],
  badHabits = [],
  coins = 100,
  setCoins,
  gems = 10,
  setGems,
}: {
  goodHabits: { name: string; expLevel: number; goldLevel: number }[];
  badHabits: { name: string; decayLevel: number; expLossLevel: number }[];
  coins?: number;
  setCoins?: (c: number) => void;
  gems?: number;
  setGems?: (g: number) => void;
}) {
  const [exp, setExp] = useState(1);
  const [decay, setDecay] = useState(1);
  // coins, setCoins, gems, setGems are now received as props

  // Checkbox state for good and bad habits
  const [checkedGood, setCheckedGood] = useState<boolean[]>(goodHabits.map(() => false));
  const [checkedBad, setCheckedBad] = useState<boolean[]>(badHabits.map(() => false));

  // Update checkbox state when habits change
  React.useEffect(() => {
    setCheckedGood(goodHabits.map(() => false));
  }, [goodHabits]);
  React.useEffect(() => {
    setCheckedBad(badHabits.map(() => false));
  }, [badHabits]);

  // Handler for checking a good habit
  const handleCheckGoodHabit = (idx: number) => {
    setCheckedGood(prev => prev.map((v, i) => i === idx ? !v : v));
    if (!checkedGood[idx]) {
      // TEST LOGIC: advance exp and coins by test values
      setExp(prev => Math.min(prev + 15, 100));
      if (setCoins && typeof coins === 'number') setCoins(coins + 10);
    }
  };

  const handleCheckBadHabit = (idx: number) => {
    setCheckedBad(prev => prev.map((v, i) => i === idx ? !v : v));
    if (!checkedBad[idx]) {
      // TEST LOGIC: advance decay and decrease exp by test values
      setDecay(prev => Math.min(prev + 20, 100));
      setExp(prev => Math.max(prev - 10, 0));
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={[styles.balanceBarContainer, { top: 70 }]}>
        <View style={styles.balanceBar}>
          <Image source={require('../assets/coin.png')} style={styles.balanceIcon} />
          <Text style={styles.balanceText}>{coins}</Text>
        </View>
        <View style={styles.balanceBar}>
          <Image source={require('../assets/gem.png')} style={styles.balanceIcon} />
          <Text style={styles.balanceText}>{gems}</Text>
        </View>
      </View>
      {/* Top 70%: Tree background */}
      <View style={{flex: 7}}>
        <ImageBackground source={require('../assets/tree_background.png')} style={styles.treeBg}>
          <View style={styles.screen}>
            {/* Tree image and other content can go here */}
          </View>
        </ImageBackground>
      </View>
      {/* Bottom 30%: Brown frame with progress bars and habits */}
      <View style={styles.treeFrame}>
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'column' }}>
          {/* Progress bars */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 }}>
            <View style={{ width: 10 }} />
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', height: 20 }}>
              <View style={{ height: 20, minWidth: 38, backgroundColor: '#4bbf7f', borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingLeft: 8, paddingRight: 8 }}>
                <Text style={{ color: '#176d3b', fontWeight: 'bold', fontSize: 12 }}>EXP</Text>
              </View>
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1, minWidth: 0, justifyContent: 'center', alignItems: 'center', height: 20 }}>
              <View style={[styles.progressBarBg, { width: '100%', height: 20, marginVertical: 0 }]}> 
                <View style={[styles.progressBar, { width: `${exp}%`, backgroundColor: '#4bbf7f', height: 20 }]} />
              </View>
            </View>
            <View style={{ width: 54 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', height: 12 }}>
            <View style={{ width: 64 }} />
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', height: 12 }}>
              <View style={{ height: 12, minWidth: 38, backgroundColor: '#ff0000', borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingLeft: 6, paddingRight: 6 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>decay</Text>
              </View>
            </View>
            <View style={{ width: 8 }} />
            <View style={[styles.progressBarBg, { width: '40%', height: 12, backgroundColor: '#eee', borderRadius: 6, marginVertical: 0 }]}> 
              <View style={[styles.progressBar, { width: `${decay}%`, backgroundColor: '#ff0000', height: 12, borderRadius: 6 }]} />
            </View>
            <View style={{ width: 64 + 38 + 24 }} />
          </View>
          {/* Habits below progress bars */}
          <View style={styles.habitsRow}>
            <View style={styles.habitsColumn}>
              <ScrollView style={styles.habitsList} contentContainerStyle={{alignItems: 'center'}}>
                {badHabits.length === 0 && (
                  <Text style={styles.habitEmpty}>No bad habits</Text>
                )}
                {badHabits.map((habit, idx) => (
                  <View key={idx} style={styles.habitBoxBad}>
                    <Text style={styles.habitTextBad}>{habit.name}</Text>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => handleCheckBadHabit(idx)}
                    >
                      <View style={[
                        styles.checkboxBox,
                        checkedBad[idx] ? styles.checkboxCheckedBad : null
                      ]}>
                        {checkedBad[idx] && <Text style={styles.checkboxTickBad}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
            <View style={styles.habitsColumn}>
              <ScrollView style={styles.habitsList} contentContainerStyle={{alignItems: 'center'}}>
                {goodHabits.length === 0 && (
                  <Text style={styles.habitEmpty}>No good habits</Text>
                )}
                {goodHabits.map((habit, idx) => (
                  <View key={idx} style={styles.habitBoxGood}>
                    <Text style={styles.habitTextGood}>{habit.name}</Text>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => handleCheckGoodHabit(idx)}
                    >
                      <View style={[
                        styles.checkboxBox,
                        checkedGood[idx] ? styles.checkboxChecked : null
                      ]}>
                        {checkedGood[idx] && <Text style={styles.checkboxTick}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
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
  treeBg: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  treeFrame: {
    height: '30%',
    backgroundColor: 'brown',
    borderWidth: 0,
    borderColor: 'black',
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
  habitsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 24,
    justifyContent: 'space-evenly',
  },
  habitsColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  habitsHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  habitsList: {
    maxHeight: '100%',
    width: '100%',
  },
  habitBoxBad: {
    backgroundColor: '#fff3e6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    width: '90%',
    alignItems: 'center',
    flexDirection: 'row', // Added for checkbox alignment
    justifyContent: 'space-between',
  },
  habitTextBad: {
    color: '#b71c1c',
    fontWeight: 'bold',
    flex: 1,
  },
  habitBoxGood: {
    backgroundColor: '#e6fff6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    width: '90%',
    alignItems: 'center',
    flexDirection: 'row', // Added for checkbox alignment
    justifyContent: 'space-between',
  },
  habitTextGood: {
    color: '#176d3b',
    fontWeight: 'bold',
    flex: 1,
  },
  checkbox: {
    marginLeft: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#888',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#176d3b',
    backgroundColor: '#c6f7e2',
  },
  checkboxCheckedBad: {
    borderColor: '#b71c1c',
    backgroundColor: '#ffd6d6',
  },
  checkboxTick: {
    color: '#176d3b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxTickBad: {
    color: '#b71c1c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitEmpty: {
    color: '#fff',
    fontStyle: 'italic',
    marginTop: 8,
  },
});