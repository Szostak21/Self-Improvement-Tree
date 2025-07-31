import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';

// Preload all tree graphics
const treeImages = {
  tree_1: require('../assets/tree/tree_1.png'),
  tree_2: require('../assets/tree/tree_2.png'),
  tree_3: require('../assets/tree/tree_3.png'),
  tree_4: require('../assets/tree/tree_4.png'),
  tree_5: require('../assets/tree/tree_5.png'),
  tree_6: require('../assets/tree/tree_6.png'),
  tree_7: require('../assets/tree/tree_7.png'),
};

export default function TreeScreen({
  goodHabits = [],
  badHabits = [],
  coins = 100,
  setCoins,
  gems = 10,
  setGems,
  exp = 0,
  setExp,
  decay = 0,
  setDecay,
gemRewardsByStage = [0, 1, 1, 2, 2, 4, 10],
}: {
  goodHabits: { name: string; expLevel: number; goldLevel: number }[];
  badHabits: { name: string; decayLevel: number; expLossLevel: number }[];
  coins?: number;
  setCoins?: (c: number) => void;
  gems?: number;
  setGems?: (g: number) => void;
  exp?: number;
  setExp?: (e: number) => void;
  decay?: number;
  setDecay?: (d: number) => void;
  gemRewardsByStage?: number[];
}) {
  // Popup state for stage up
  const [showStagePopup, setShowStagePopup] = React.useState(false);
  const [popupStage, setPopupStage] = React.useState(1);
  const [popupGemReward, setPopupGemReward] = React.useState(1);
  React.useEffect(() => {
    if (showStagePopup) {
      Animated.timing(popupAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      popupAnim.setValue(0);
    }
  }, [showStagePopup]);
  // Animation for popup
  const popupAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (showStagePopup) {
      Animated.timing(popupAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      popupAnim.setValue(0);
    }
  }, [showStagePopup]);
  // Upgrade costs for bad habits (0-5): 0:5, 1:20, 2:50, 3:200, 4:500, 5:1000
  const badUpgradeCosts = [5, 20, 50, 200, 500, 1000];
  const getBadUpgradeCost = (level: number) => badUpgradeCosts[Math.max(0, Math.min(level, 5))];
  // Tree stages and exp requirements
  const expStages = [40, 100, 160, 200, 300, 400, 0];
  // Use percentages for top position for responsive layout
  const treeStageTops = ['57%', '55%', '52%', '48%', '46%', '46%', '46%']; // % top for each stage
  const treeStageScales = [1, 1.2, 1.7, 2.4, 2.7, 2.7, 2.8]; // scale for each stage
  const [treeStage, setTreeStage] = React.useState(1); // 1: tree_1, ..., 7: tree_7
  const [expToLevel, setExpToLevel] = React.useState(expStages[0]);
  const treeStageTop = treeStageTops[treeStage - 1];
  // Convert percentage string to number for marginTop
  const treeStageMarginTop = parseInt(treeStageTop);
  const treeStageScale = treeStageScales[treeStage - 1];

  // New decay gain scaling by level (0-5): 0:20, 1:16, 2:12, 3:8, 4:4, 5:2
  const decayGainByLevel = [20, 16, 12, 8, 4, 2];
  const getDecayGain = (level: number) => decayGainByLevel[Math.max(0, Math.min(level, 5))];

  // New EXP loss scaling by expLossLevel (0-5): 0:-10, 1:-8, 2:-6, 3:-4, 4:-2, 5:0
  const expLossByLevel = [10, 8, 6, 4, 2, 0];
  const getExpLoss = (level: number) => expLossByLevel[Math.max(0, Math.min(level, 5))];
  // coins, setCoins, gems, setGems are now received as props

  // Checkbox state for good and bad habits
  const [checkedGood, setCheckedGood] = React.useState<boolean[]>(goodHabits.map(() => false));
  const [checkedBad, setCheckedBad] = React.useState<boolean[]>(badHabits.map(() => false));

  // Only update checkedGood/checkedBad if habits are added or removed (not upgraded)
  React.useEffect(() => {
    if (goodHabits.length !== checkedGood.length) {
      setCheckedGood(goodHabits.map(() => false));
    }
  }, [goodHabits]);
  React.useEffect(() => {
    if (badHabits.length !== checkedBad.length) {
      setCheckedBad(badHabits.map(() => false));
    }
  }, [badHabits]);

  // Handler for checking a good habit
  // EXP gain by level: 0:10, 1:20, 2:30, 3:50, 4:100, 5:200
  // expLevel 0 (bar 0/5): 10, expLevel 1 (bar 1/5): 20, ..., expLevel 5 (bar 5/5): 200
  const expGainLevels = [10, 20, 30, 50, 100, 200];
  // Gold gain by level: 0:10, 1:15, 2:20, 3:30, 4:50, 5:100
  const goldGainLevels = [10, 15, 20, 30, 50, 100];
  const handleCheckGoodHabit = (idx: number) => {
    setCheckedGood(prev => prev.map((v, i) => i === idx ? !v : v));
    if (!checkedGood[idx]) {
      // Use expLevel and goldLevel for gain
      const expLevel = goodHabits[idx]?.expLevel ?? 0;
      const goldLevel = goodHabits[idx]?.goldLevel ?? 0;
      // Clamp expLevel and goldLevel between 0 and 5
      const expGain = expGainLevels[Math.max(0, Math.min(expLevel, 5))];
      const coinGain = goldGainLevels[Math.max(0, Math.min(goldLevel, goldGainLevels.length - 1))];
      let newExp = exp + expGain;
      let currentStage = treeStage;
      let currentExpToLevel = expToLevel;
      let leftoverExp = newExp;
      let leveledUp = false;
      let leveledUpStage = treeStage;
      let stagesLeveled = 0;
      let totalGemReward = 0;
      let lastStage = treeStage;
      while (leftoverExp >= currentExpToLevel && currentStage < 7) {
        leftoverExp -= currentExpToLevel;
        currentStage += 1;
        currentExpToLevel = expStages[currentStage - 1];
        leveledUp = true;
        leveledUpStage = currentStage;
        stagesLeveled += 1;
        // Add gem reward for each stage reached (use array, clamp index)
        if (currentStage > 1 && currentStage <= 7) {
          totalGemReward += gemRewardsByStage[Math.max(0, Math.min(currentStage - 1, gemRewardsByStage.length - 1))];
          lastStage = currentStage;
        }
      }
      if (leveledUp) {
        setTreeStage(currentStage);
        if (setExp) setExp(leftoverExp);
        setExpToLevel(currentExpToLevel);
        // Show popup only for stages 2-7 (stage 1 is default, so show for 2-7)
        if (lastStage > 1 && lastStage <= 7) {
          setPopupStage(lastStage);
          setPopupGemReward(totalGemReward);
          setShowStagePopup(true);
          if (setGems) setGems((gems ?? 0) + totalGemReward);
        }
      } else {
        if (setExp) setExp(Math.min(leftoverExp, currentExpToLevel));
      }
      if (setCoins && typeof coins === 'number') setCoins(coins + coinGain);
    }
  };

  const handleCheckBadHabit = (idx: number) => {
    setCheckedBad(prev => prev.map((v, i) => i === idx ? !v : v));
    if (!checkedBad[idx]) {
      // Use decayLevel and expLossLevel for gain/loss
      // decayLevel and expLossLevel are now 0-based (0-5)
      const decayLevel = badHabits[idx]?.decayLevel ?? 0;
      const expLossLevel = badHabits[idx]?.expLossLevel ?? 0;
      const decayGain = getDecayGain(decayLevel);
      const expLoss = getExpLoss(expLossLevel);
      if (setDecay) setDecay(Math.min(decay + decayGain, 100));
      if (setExp) setExp(Math.max(exp - expLoss, 0));
    }
  };

  return (
    <View style={{flex: 1}}>
      {/* Popup for stage up */}
      {showStagePopup && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Animated.View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 32,
              alignItems: 'center',
              width: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              opacity: popupAnim,
              transform: [{ scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#176d3b', marginBottom: 12, textAlign: 'center' }}>
              Congratulations!
            </Text>
            <Text style={{ fontSize: 18, color: '#176d3b', marginBottom: 18, textAlign: 'center' }}>
              Your tree has reached stage {popupStage}!
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
              <Text style={{ fontSize: 16, color: '#176d3b', marginRight: 8 }}>You got rewarded with</Text>
              <Image source={require('../assets/gem.png')} style={{ width: 28, height: 28, marginRight: 4 }} />
              <Text style={{ fontSize: 18, color: '#176d3b', fontWeight: 'bold' }}>{popupGemReward}</Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#4bbf7f',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 32,
                marginTop: 8,
              }}
              onPress={() => setShowStagePopup(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Claim</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
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
          {/* Tree image in the middle of the screen, centered horizontally, with independent position for each stage */}
          {/* Tree image in the middle of the screen, centered horizontally, with independent position for each stage */}
          <View style={{ position: 'absolute', top: 0, left: '50%', transform: [{ translateX: -41.5 }], zIndex: 2, marginTop: `${treeStageMarginTop}%` }}>
            <Image
              source={(treeImages as any)[`tree_${treeStage}`]}
              style={{
                width: 83,
                height: 83,
                resizeMode: 'contain',
                transform: [{ scale: treeStageScale }],
              }}
            />
          </View>
          <View style={styles.screen}>
            {/* Other content can go here */}
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
              <View style={[styles.progressBar, { width: `${Math.min((exp / expToLevel) * 100, 100)}%`, backgroundColor: '#4bbf7f', height: 20 }]} />
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
              <ScrollView
                style={[styles.habitsList, { minHeight: 80, maxHeight: 140 }]} 
                contentContainerStyle={{alignItems: 'center', paddingBottom: 24}}
                showsVerticalScrollIndicator={false}
              >
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
              <ScrollView
                style={[styles.habitsList, { minHeight: 80, maxHeight: 140 }]} 
                contentContainerStyle={{alignItems: 'center', paddingBottom: 24}}
                showsVerticalScrollIndicator={false}
              >
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