import React, { useState } from 'react';
import { useUserData } from '../UserDataContext';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Image, Alert, Animated } from 'react-native';
import { useTutorialProgress } from '../hooks/useTutorialProgress';

// simple UUID v4 generator for stable habit ids
const genId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

const UpgradeButton = ({ label = "Upgrade", cost = 10, maxed = false }) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    minWidth: 64,
  }}>
    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#176d3b', marginBottom: 2 }}>{maxed ? 'Max Level' : label}</Text>
    {!maxed && (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={require('../assets/coin.png')}
          style={{ width: 16, height: 16, marginRight: 4 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#000' }}>{cost}</Text>
      </View>
    )}
  </View>
);

export default function HabitsScreen() {
  const { userData, setUserData } = useUserData();
  // Use maxGoodHabits from userData (context) so it updates when buying Calendar
  const maxGoodHabits = userData.maxGoodHabits ?? 1;
  const goodHabits = userData.goodHabits;
  const badHabits = userData.badHabits;
  const coins = userData.coins;
  // Replace setGoodHabits, setBadHabits, setCoins with setUserData wrappers
  const setGoodHabits = (cb: ((prev: typeof goodHabits) => typeof goodHabits) | typeof goodHabits) =>
    setUserData(prev => ({ ...prev, goodHabits: typeof cb === 'function' ? (cb as (prev: typeof goodHabits) => typeof goodHabits)(prev.goodHabits) : cb }));
  const setBadHabits = (cb: ((prev: typeof badHabits) => typeof badHabits) | typeof badHabits) =>
    setUserData(prev => ({ ...prev, badHabits: typeof cb === 'function' ? (cb as (prev: typeof badHabits) => typeof badHabits)(prev.badHabits) : cb }));
  const setCoins = (cb: any) => setUserData(prev => ({ ...prev, coins: typeof cb === 'function' ? cb(prev.coins) : cb }));
  // EXP gain by level: 0:10, 1:20, 2:30, 3:50, 4:100, 5:200
  // expLevel 0 (bar 0/5): 10, expLevel 1 (bar 1/5): 20, ..., expLevel 5 (bar 5/5): 200
  const expGainLevels = [10, 20, 30, 50, 100, 200];
  // Gold gain by level: 0:10, 1:15, 2:20, 3:30, 4:50, 5:100
  const goldGainLevels = [10, 15, 20, 30, 50, 100];
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editHabitIdx, setEditHabitIdx] = useState<number | null>(null);
  const [editHabitText, setEditHabitText] = useState('');
  const [editExpLevel, setEditExpLevel] = useState(1);
  const [editGoldLevel, setEditGoldLevel] = useState(1);

  // Tutorial state
  const { hasSeenTutorial, markTutorialAsDone, isLoading } = useTutorialProgress();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const tutorialOpacity = React.useRef(new Animated.Value(0)).current;

  // Check if tutorial should start when component mounts
  React.useEffect(() => {
    if (!isLoading && !hasSeenTutorial('habit')) {
      // Show welcome modal after a short delay
      setTimeout(() => setShowWelcomeModal(true), 800);
    }
  }, [hasSeenTutorial, isLoading]);

  // Reset tutorial opacity when overlay is hidden
  React.useEffect(() => {
    if (!showTutorialOverlay) {
      tutorialOpacity.setValue(0);
    }
  }, [showTutorialOverlay, tutorialOpacity]);

  // Tutorial handlers
  const handleStartTutorial = () => {
    setShowWelcomeModal(false);
    setCurrentTutorialStep(1);
    setShowTutorialOverlay(true);
    setIsTutorialActive(true);
    // Fade in animation
    Animated.timing(tutorialOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    console.log('📖 Starting habits tutorial - Step 1: Add good habit explanation');
  };

  const handleSkipTutorial = async () => {
    // Fade out animation
    Animated.timing(tutorialOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowWelcomeModal(false);
      setShowTutorialOverlay(false);
    });
    await markTutorialAsDone('habit');
    console.log('⏭️ Habits tutorial skipped');
  };

  const handleNextTutorialStep = () => {
    if (currentTutorialStep === 1) {
      // Move to step 2: Upgrade tutorial
      setCurrentTutorialStep(2);
      console.log('📖 Habits tutorial - Step 2: Upgrade explanation');
    } else if (currentTutorialStep === 2) {
      // Fade out and complete tutorial
      Animated.timing(tutorialOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowTutorialOverlay(false);
        setCurrentTutorialStep(0);
        setIsTutorialActive(false);
      });
      markTutorialAsDone('habit');
      console.log('✅ Habits tutorial completed');
    }
  };

  const handleTutorialOverlayClose = () => {
    setShowTutorialOverlay(false);
    setCurrentTutorialStep(0);
  };

  // Upgrade handlers for good and bad habits
  // New upgrade costs for bad habits: 0:10, 1:20, 2:50, 3:100, 4:200 (for upgrades from 0→1, 1→2, ..., 4→5)
  const badUpgradeCosts = [10, 20, 50, 100, 200]; // 5 upgrades, 6 levels (0-5)
  // Now, cost for upgrading from n to n+1 is badUpgradeCosts[n]
  const getBadUpgradeCost = (level: number) => badUpgradeCosts[Math.max(0, Math.min(level, badUpgradeCosts.length - 1))];
  // Good habits upgrade costs (unchanged): 0:10, 1:50, 2:100, 3:500, 4:1000 (for upgrades from 0→1, ..., 4→5)
  const upgradeCosts = [10, 50, 100, 500, 1000];
  const getUpgradeCost = (level: number) => upgradeCosts[Math.max(0, Math.min(level, upgradeCosts.length - 1))];
  const MAX_LEVEL = 5; // max level is 5, starting at 0

  // Decay gain scaling by level (0-5): lvl0=10, lvl1=8, lvl2=6, lvl3=4, lvl4=2, lvl5=0
  const decayGainByLevel = [10, 8, 6, 4, 2, 0]; // 6 levels
  const getDecayGain = (level: number) => decayGainByLevel[Math.max(0, Math.min(level, decayGainByLevel.length - 1))];

  // New EXP loss scaling by level (0-5): 0:40, 1:32, 2:24, 3:16, 4:8, 5:4
  const expLossByLevel = [40, 32, 24, 16, 8, 4]; // 6 levels
  const getExpLoss = (level: number) => expLossByLevel[Math.max(0, Math.min(level, expLossByLevel.length - 1))];

  // Upgrade handlers for bad habits
  const handleUpgradeDecay = () => {
    if (editBadHabitIdx === null) return;
    const cost = getBadUpgradeCost(editDecayLevel);
    if (coins < cost || editDecayLevel >= MAX_LEVEL) return;
    setBadHabits(prev => {
      const updated = [...prev];
      updated[editBadHabitIdx] = {
        ...updated[editBadHabitIdx],
        decayLevel: updated[editBadHabitIdx].decayLevel + 1,
      };
      return updated;
    });
    setEditDecayLevel(lvl => lvl + 1);
    setCoins(coins - cost);
  };

  const handleUpgradeExpLoss = () => {
    if (editBadHabitIdx === null) return;
    const cost = getBadUpgradeCost(editExpLossLevel);
    if (coins < cost || editExpLossLevel >= MAX_LEVEL) return;
    setBadHabits(prev => {
      const updated = [...prev];
      updated[editBadHabitIdx] = {
        ...updated[editBadHabitIdx],
        expLossLevel: updated[editBadHabitIdx].expLossLevel + 1,
      };
      return updated;
    });
    setEditExpLossLevel(lvl => lvl + 1);
    setCoins(coins - cost);
  };
  const handleUpgradeExp = () => {
    if (editHabitIdx === null) return;
    const cost = getUpgradeCost(editExpLevel);
    if (coins < cost || editExpLevel >= MAX_LEVEL) return;
    setGoodHabits(prev => {
      const updated = [...prev];
      updated[editHabitIdx] = {
        ...updated[editHabitIdx],
        expLevel: updated[editHabitIdx].expLevel + 1,
      };
      return updated;
    });
    setEditExpLevel(lvl => lvl + 1);
    setCoins(coins - cost);
  };

  const handleUpgradeGold = () => {
    if (editHabitIdx === null) return;
    const cost = getUpgradeCost(editGoldLevel);
    if (coins < cost || editGoldLevel >= MAX_LEVEL) return;
    setGoodHabits(prev => {
      const updated = [...prev];
      updated[editHabitIdx] = {
        ...updated[editHabitIdx],
        goldLevel: updated[editHabitIdx].goldLevel + 1,
      };
      return updated;
    });
    setEditGoldLevel(lvl => lvl + 1);
    setCoins(coins - cost);
  };
  // Use maxGoodHabits from userData (context) so it updates when buying Calendar
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [badModalVisible, setBadModalVisible] = useState(false);
  const [newBadHabit, setNewBadHabit] = useState('');
  const [editBadModalVisible, setEditBadModalVisible] = useState(false);
  const [editBadHabitIdx, setEditBadHabitIdx] = useState<number | null>(null);
  const [editBadHabitText, setEditBadHabitText] = useState('');
  const [editDecayLevel, setEditDecayLevel] = useState(1);
  const [editExpLossLevel, setEditExpLossLevel] = useState(1);
  const [maxBadHabits, setMaxBadHabits] = useState(6);
  const [badLimitModalVisible, setBadLimitModalVisible] = useState(false);

  // Good habits logic
  const handleAddHabit = () => {
    const name = newHabit.trim();
    if (name && name.length <= 25) {
      setGoodHabits([
        ...goodHabits,
        { id: genId(), name, expLevel: 0, goldLevel: 0 },
      ]);
      setNewHabit('');
      setModalVisible(false);
      // If tutorial is active and in step 1, advance to step 2 and show overlay
      if (isTutorialActive && currentTutorialStep === 1) {
        setCurrentTutorialStep(2);
        // Fade in step 2 overlay after a short delay
        setTimeout(() => {
          Animated.timing(tutorialOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }, 300); // Wait for modal to fully close
        console.log('📖 Habits tutorial - Step 2: Upgrade explanation');
      }
    } else if (name.length > 25) {
      Alert.alert('Too long', 'Habit name must be 25 characters or fewer.');
    }
  };
  const handleEditHabit = () => {
    if (editHabitIdx === null) return;
    const name = editHabitText.trim();
    if (!name) return;
    if (name.length > 25) {
      Alert.alert('Too long', 'Habit name must be 25 characters or fewer.');
      return;
    }
    const updated = [...goodHabits];
    updated[editHabitIdx] = {
      ...updated[editHabitIdx],
      name,
      expLevel: editExpLevel,
      goldLevel: editGoldLevel,
    } as any;
    setGoodHabits(updated);
    setEditModalVisible(false);
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
      // Fade out tutorial overlay when modal opens
      if (isTutorialActive && currentTutorialStep === 1) {
        Animated.timing(tutorialOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
      setModalVisible(true);
    }
  };

  // Bad habits logic
  const handleAddBadHabit = () => {
    const name = newBadHabit.trim();
    if (name && name.length <= 25) {
      setBadHabits([
        ...badHabits,
        { id: genId(), name, decayLevel: 0, expLossLevel: 0 },
      ]);
      setNewBadHabit('');
      setBadModalVisible(false);
    } else if (name.length > 25) {
      Alert.alert('Too long', 'Habit name must be 25 characters or fewer.');
    }
  };
  const handleEditBadHabit = () => {
    if (editBadHabitIdx !== null && editBadHabitText.trim()) {
      const updated = [...badHabits];
      updated[editBadHabitIdx] = {
        ...updated[editBadHabitIdx],
        name: editBadHabitText.trim(),
        decayLevel: editDecayLevel,
        expLossLevel: editExpLossLevel,
      } as any;
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
      {/* Welcome Tutorial Modal */}
      <Modal
        visible={showWelcomeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSkipTutorial}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tutorialModal}>
            <Text style={styles.tutorialTitle}>Welcome to Habits!</Text>
            <Text style={styles.tutorialText}>
              Here you can create and manage your habits to help grow your tree.{'\n\n'}
              Let's take a quick tour to learn how it works!
            </Text>
            <View style={styles.tutorialButtons}>
              <TouchableOpacity
                style={[styles.tutorialButton, styles.skipButton]}
                onPress={handleSkipTutorial}
              >
                <Text style={styles.skipButtonText}>Skip Tutorial</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tutorialButton, styles.startButton]}
                onPress={handleStartTutorial}
              >
                <Text style={styles.startButtonText}>Start Tutorial</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tutorial Overlay - Step 1: Add Good Habit Explanation */}
      {showTutorialOverlay && currentTutorialStep === 1 && (
        <Animated.View style={[styles.tutorialOverlay, { opacity: tutorialOpacity }]}>
          {/* Semi-transparent overlay pieces that highlight bottom right corner */}
          {/* Top piece - covers top 80% */}
          <View style={[styles.tutorialBackdropPiece, {
            top: 0,
            left: 0,
            right: 0,
            height: '85%',
          }]} />
          
          {/* Left piece - covers left 80% of bottom */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '85%',
            left: 0,
            right: '80%',
            bottom: 0,
          }]} />
          
          {/* Right piece - leaves small gap for green + button */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '90%',
            left: '25%',
            right: 0,
            bottom: '25%',
          }]} />
          
          {/* Bottom piece - leaves gap for green + button */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '85%',
            left: '20%',
            right: '30%',
            bottom: 0,
          }]} />
          
          {/* Tutorial tooltip - centered on screen */}
          <View style={[styles.tutorialModal, { top: '40%', left: '5%', right: '5%' }]}>
            <Text style={styles.tutorialTitle}>➕ Add Your First Good Habit</Text>
            <Text style={styles.tutorialText}>
              Tap the <Text style={{color: '#176d3b', fontWeight: 'bold'}}>green "+" button</Text> to create positive habits that will help grow your tree!{'\n\n'}
              Good habits give you experience points and coins when completed daily.
            </Text>
          </View>
          
          {/* Transparent button exactly over the green + button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 30,
              bottom: 30,
              width: 60,
              height: 60,
              backgroundColor: 'transparent',
              zIndex: 1004,
            }}
            onPress={handleAddButtonPress}
          />
        </Animated.View>
      )}

      {/* Tutorial Overlay - Step 2: Upgrade Explanation */}
      {showTutorialOverlay && currentTutorialStep === 2 && (
        <Animated.View style={[styles.tutorialOverlay, { opacity: tutorialOpacity }]}>
          {/* Semi-transparent overlay pieces that highlight good habits area */}
          {/* Top piece - covers top 20% */}
          <View style={[styles.tutorialBackdropPiece, {
            top: 0,
            left: 0,
            right: 0,
            height: '6%',
          }]} />
          
          {/* Left piece - covers left 60% */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '6%',
            left: 0,
            right: '50%',
            bottom: '0%',
          }]} />
          
          {/* Bottom piece - covers bottom 40% */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '25%',
            left: '50%',
            right: 0,
            bottom: 0,
          }]} />
          
          {/* Right piece - covers right 40% of middle */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '20%',
            left: '100%',
            right: 0,
            bottom: '40%',
          }]} />
          
          {/* Tutorial tooltip - positioned at bottom center */}
          <View style={[styles.tutorialModal, { bottom: '10%', left: '5%', right: '5%' }]}>
            <Text style={styles.tutorialTitle}>⬆️ Upgrade Your Habits</Text>
            <Text style={styles.tutorialText}>
              Tap on your habit to edit it and access <Text style={{color: '#176d3b', fontWeight: 'bold'}}>upgrade options</Text>!{'\n\n'}
              Upgrading increases EXP and gold rewards but costs coins. Higher levels = better rewards!
            </Text>
          </View>
          
          {/* Transparent button exactly over the first habit box */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: '6%', // Start where first habit box appears (marginTop: 90)
              left: '55%', // Start of centered 80% container in right half
              width: '40%', // Width of container (80% of 50% half)
              height: '19%', // Height for one habit box with some padding
              backgroundColor: 'transparent',
              zIndex: 1004,
            }}
            onPress={() => {
              // Open edit modal for the first habit (index 0)
              if (goodHabits.length > 0) {
                setEditHabitIdx(0);
                setEditHabitText(goodHabits[0].name);
                setEditExpLevel(goodHabits[0].expLevel);
                setEditGoldLevel(goodHabits[0].goldLevel);
                setEditModalVisible(true);
                // Fade out tutorial overlay when modal opens
                Animated.timing(tutorialOpacity, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              }
            }}
          />
        </Animated.View>
      )}

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
                  <Text style={styles.decayLabel}>Decay ↓</Text>
                  <View style={styles.decayBarContainer}>
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.decayBarLevel,
                          i < habit.decayLevel ? styles.decayBarLevelFilled : null
                        ]}
                      />
                    ))}
                  </View>
                </View>
                {/* EXP loss label and progress bar */}
                <View style={styles.expLossRow}>
                  <Text style={styles.expLossLabel}>EXP loss ↓</Text>
                  <View style={styles.expLossBarContainer}>
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.expLossBarLevel,
                          i < habit.expLossLevel ? styles.expLossBarLevelFilled : null
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
                maxLength={25}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button 
                  title="Cancel" 
                  onPress={() => {
                    // Don't allow canceling during tutorial
                    if (!isTutorialActive) {
                      setBadModalVisible(false);
                    }
                  }} 
                  color="#888" 
                />
                <View style={{ width: 12 }} />
                <Button title="Add" onPress={handleAddBadHabit} color="#4b2e19" />
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal for editing/deleting bad habit */}
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
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>{coins}</Text>
              </View>
              {/* Habit name input */}
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#4b2e19' }}>Edit Bad Habit</Text>
              <TextInput
                value={editBadHabitText}
                onChangeText={setEditBadHabitText}
                placeholder="Habit name"
                style={{ borderWidth: 1, borderColor: '#4b2e19', borderRadius: 8, padding: 8, marginBottom: 16 }}
                autoFocus={false}
                maxLength={25}
              />
              {/* Decay row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                <Text style={styles.decayLabel}>Decay ↓</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.decayBarContainer}>
                    {[...Array(MAX_LEVEL)].map((_, i) => (
                      <View
                        key={i}
                        style={[styles.decayBarLevel, i < editDecayLevel ? styles.decayBarLevelFilled : styles.decayBarLevelEmpty]}
                      />
                    ))}
                  </View>
                  <View style={{ width: 16 }} />
                  <TouchableOpacity
                    onPress={handleUpgradeDecay}
                    disabled={editDecayLevel >= MAX_LEVEL || coins < getBadUpgradeCost(editDecayLevel)}
                  >
                    <UpgradeButton 
                      cost={getBadUpgradeCost(editDecayLevel)} 
                      label="Upgrade" 
                      maxed={editDecayLevel >= MAX_LEVEL}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {/* EXP loss row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                <Text style={styles.expLossLabel}>EXP loss ↓</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.expLossBarContainer}>
                    {[...Array(MAX_LEVEL)].map((_, i) => (
                      <View
                        key={i}
                        style={[styles.expLossBarLevel, i < editExpLossLevel ? styles.expLossBarLevelFilled : styles.expLossBarLevelEmpty]}
                      />
                    ))}
                  </View>
                  <View style={{ width: 16 }} />
                  <TouchableOpacity
                    onPress={handleUpgradeExpLoss}
                    disabled={editExpLossLevel >= MAX_LEVEL || coins < getBadUpgradeCost(editExpLossLevel)}
                  >
                    <UpgradeButton 
                      cost={getBadUpgradeCost(editExpLossLevel)} 
                      label="Upgrade" 
                      maxed={editExpLossLevel >= MAX_LEVEL}
                    />
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
                    if (editBadHabitIdx !== null) {
                      const name = editBadHabitText.trim();
                      if (!name) {
                        setEditBadModalVisible(false);
                        return;
                      }
                      if (name.length > 25) {
                        Alert.alert('Too long', 'Habit name must be 25 characters or fewer.');
                        return;
                      }
                      const updated = [...badHabits];
                      updated[editBadHabitIdx] = {
                        ...updated[editBadHabitIdx],
                        name,
                        decayLevel: editDecayLevel,
                        expLossLevel: editExpLossLevel,
                      } as any;
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
                maxLength={25}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button 
                  title="Cancel" 
                  onPress={() => {
                    // Don't allow canceling during tutorial
                    if (isTutorialActive) return;
                    setModalVisible(false);
                  }} 
                  color="#888" 
                />
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
          onRequestClose={() => {
            setEditModalVisible(false);
            // Complete tutorial when modal is closed via back button/swipe
            if (isTutorialActive && currentTutorialStep === 2) {
              handleNextTutorialStep();
            }
          }}
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
                maxLength={25}
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
                          i < editExpLevel ? styles.expBarLevelFilled : styles.expBarLevelEmpty
                        ]}
                      />
                    ))}
                  </View>
                  <View style={{ width: 16 }} />
                  <TouchableOpacity
                    onPress={handleUpgradeExp}
                    disabled={editExpLevel >= MAX_LEVEL || coins < getUpgradeCost(editExpLevel)}
                  >
                    <UpgradeButton 
                      cost={getUpgradeCost(editExpLevel)} 
                      label="Upgrade" 
                      maxed={editExpLevel >= MAX_LEVEL}
                    />
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
                          i < editGoldLevel ? styles.goldBarLevelFilled : styles.goldBarLevelEmpty
                        ]}
                      />
                    ))}
                  </View>
                  <View style={{ width: 16 }} />
                  <TouchableOpacity
                    onPress={handleUpgradeGold}
                    disabled={editGoldLevel >= MAX_LEVEL || coins < getUpgradeCost(editGoldLevel)}
                  >
                    <UpgradeButton 
                      cost={getUpgradeCost(editGoldLevel)} 
                      label="Upgrade" 
                      maxed={editGoldLevel >= MAX_LEVEL}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Delete and Exit buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <Button 
                  title="Delete" 
                  onPress={() => {
                    // Don't allow deleting during tutorial
                    if (isTutorialActive) return;
                    handleDeleteHabit();
                  }} 
                  color="#d32f2f" 
                />
                <View style={{ width: 12 }} />
                <Button
                  title="Exit"
                  onPress={() => {
                    if (editHabitIdx !== null) {
                      const name = editHabitText.trim();
                      if (!name) {
                        setEditModalVisible(false);
                        return;
                      }
                      if (name.length > 25) {
                        Alert.alert('Too long', 'Habit name must be 25 characters or fewer.');
                        return;
                      }
                      const updated = [...goodHabits];
                      updated[editHabitIdx] = {
                        ...updated[editHabitIdx],
                        name,
                        expLevel: editExpLevel,
                        goldLevel: editGoldLevel,
                      } as any;
                      setGoodHabits(updated);
                    }
                    setEditModalVisible(false);
                    // Complete tutorial when exiting edit modal
                    if (isTutorialActive && currentTutorialStep === 2) {
                      handleNextTutorialStep();
                    }
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
    backgroundColor: '#81bd7eff', // slightly darker light green
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  habitsHalfBad: {
    flex: 1,
    backgroundColor: '#755d57ff', // slightly darker light brown
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
  decayBarLevelEmpty: {
    backgroundColor: '#fff',
  },
  expLossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
    // Remove space-between, use flex for label and bar
    // justifyContent: 'space-between',
  },
  expLossLabel: {
    color: '#b71c1c',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 5, // Reduced margin for tighter spacing
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
  expLossBarLevelEmpty: {
    backgroundColor: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  tutorialModal: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1003,
  },
  tutorialTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 15,
    textAlign: 'center',
  },
  tutorialText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  tutorialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  tutorialButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#4a7c2c',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Tutorial overlay styles
  tutorialBackdropPiece: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  tutorialTooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1003, // Highest z-index
  },
  tutorialNextButton: {
    backgroundColor: '#4a7c2c',
  },
  tutorialNextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});