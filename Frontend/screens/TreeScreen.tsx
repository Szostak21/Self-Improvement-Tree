// Nagrody za kolejne etapy drzewa (możesz dostosować wartości)
const gemRewardsByStage = [0, 1, 2, 3, 4, 5, 6];
import React, { useState } from 'react';
import { useUserData } from '../UserDataContext';
import { View, Text, Image, ImageBackground, StyleSheet, ScrollView, TouchableOpacity, Animated, useWindowDimensions, Modal } from 'react-native';
import { useTutorialProgress } from '../hooks/useTutorialProgress';

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

export default function TreeScreen() {
  const { userData, setUserData } = useUserData();
  const goodHabits = userData.goodHabits;
  const badHabits = userData.badHabits;
  const coins = userData.coins;
  const gems = userData.gems;
  const exp = userData.exp;
  const decay = userData.decay;
  
  // Tutorial state
  const { hasSeenTutorial, markTutorialAsDone, isLoading } = useTutorialProgress();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);
  const tutorialOpacity = React.useRef(new Animated.Value(0)).current;

  // Check if tutorial should start when component mounts
  React.useEffect(() => {
    if (!isLoading && !hasSeenTutorial('tree')) {
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
    // Fade in animation
    Animated.timing(tutorialOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    console.log('📖 Starting tree tutorial - Step 1: Tree explanation');
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
    await markTutorialAsDone('tree');
    console.log('⏭️ Tree tutorial skipped');
  };

  const handleNextTutorialStep = () => {
    if (currentTutorialStep === 1) {
      // Fade out current step
      Animated.timing(tutorialOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Change to step 2
        setCurrentTutorialStep(2);
        // Fade in new step
        Animated.timing(tutorialOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
      console.log('📖 Tree tutorial - Step 2: EXP and decay bars explanation');
    } else if (currentTutorialStep === 2) {
      // Fade out current step
      Animated.timing(tutorialOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Change to step 3
        setCurrentTutorialStep(3);
        // Fade in new step
        Animated.timing(tutorialOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
      console.log('📖 Tree tutorial - Step 3: Bottom navigation explanation');
    } else if (currentTutorialStep === 3) {
      // Fade out and complete tutorial
      Animated.timing(tutorialOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowTutorialOverlay(false);
        setCurrentTutorialStep(0);
      });
      markTutorialAsDone('tree');
      console.log('✅ Tree tutorial completed');
    }
  };

  const handleTutorialOverlayClose = () => {
    setShowTutorialOverlay(false);
    setCurrentTutorialStep(0);
  };
  // Tree stages and exp requirements
  const expStages = [40, 100, 160, 200, 300, 400, 0];
  // Restore treeStage and expToLevel from userData if present, else default
  const [treeStage, setTreeStage] = React.useState(userData.treeStage ?? 1);
  const [expToLevel, setExpToLevel] = React.useState(userData.expToLevel ?? expStages[0]);

  // When userData.treeStage or userData.expToLevel changes (e.g. after reload), update local state
  React.useEffect(() => {
    if (userData.treeStage && userData.treeStage !== treeStage) setTreeStage(userData.treeStage);
    if (userData.expToLevel && userData.expToLevel !== expToLevel) setExpToLevel(userData.expToLevel);
  }, [userData.treeStage, userData.expToLevel]);

  // Save treeStage and expToLevel to userData whenever they change (Context will sync to backend)
  React.useEffect(() => {
    setUserData(prev => ({ ...prev, treeStage, expToLevel }));
  }, [treeStage, expToLevel, setUserData]);

  // Replace setters with setUserData wrappers
  const setCoins = (cb: any) => setUserData(prev => ({ ...prev, coins: typeof cb === 'function' ? cb(prev.coins) : cb }));
  const setGems = (cb: any) => setUserData(prev => ({ ...prev, gems: typeof cb === 'function' ? cb(prev.gems) : cb }));
  const setExp = (cb: any) => setUserData(prev => ({ ...prev, exp: typeof cb === 'function' ? cb(prev.exp) : cb }));
  const setDecay = (cb: any) => setUserData(prev => ({ ...prev, decay: typeof cb === 'function' ? cb(prev.decay) : cb }));
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
  // Use percentages for top position for responsive layout
  // const treeStageTops = ['57%', '55%', '52%', '48%', '46%', '46%', '46%']; // deprecated
  const treeStageScales = [1, 1.2, 1.7, 2.4, 2.7, 2.7, 2.8]; // scale for each stage
  const treeStageScale = treeStageScales[treeStage - 1];
  const BASE_TREE_SIZE = 83; // px
  const treeW = BASE_TREE_SIZE * treeStageScale;
  const treeH = BASE_TREE_SIZE * treeStageScale;

  // Fix background aspect ratio so it doesn't crop differently on devices
  const { width: winW } = useWindowDimensions();
  const bgSrc = require('../assets/tree_background.png');
  const bgMeta = Image.resolveAssetSource(bgSrc);
  const bgRatio = bgMeta && bgMeta.width && bgMeta.height ? bgMeta.width / bgMeta.height : 1.6; // fallback ratio
  const bgWidth = winW;
  const bgHeight = bgWidth / bgRatio;

  // Anchor the tree by bottom offset so its base sits on the hill consistently
  // Increased baseline and compensate for possible transparent padding at bottom of tree assets
  const treeBottomPerc = [21, 20.4, 17, 12.5, 10, 10, 8.7];
  const baseOffsetPercOfTree = [0.26, 0.28, 0.30, 0.32, 0.34, 0.34, 0.34];
  const stageIdx = Math.max(0, Math.min(treeStage - 1, treeBottomPerc.length - 1));
  const fineTuneUpPerc = 0.05; // +3% of bg height upwards
  const bottomPx = bgHeight * ((treeBottomPerc[stageIdx] / 100) + fineTuneUpPerc) + treeH * baseOffsetPercOfTree[stageIdx];

  // New decay gain scaling by level (0-5): 0:20, 1:16, 2:12, 3:8, 4:4, 5:2
  const decayGainByLevel = [20, 16, 12, 8, 4, 2];
  const getDecayGain = (level: number) => decayGainByLevel[Math.max(0, Math.min(level, 5))];

  // New EXP loss scaling by expLossLevel (0-5): 0:-10, 1:-8, 2:-6, 3:-4, 4:-2, 5:0
  const expLossByLevel = [10, 8, 6, 4, 2, 0];
  const getExpLoss = (level: number) => expLossByLevel[Math.max(0, Math.min(level, 5))];
  // coins, setCoins, gems, setGems are now received as props

  // Helper to build stable keys for daily checks (prefer stable id)
  const habitKeyById = (idx: number, type: 'good' | 'bad') => {
    const id = type === 'good' ? (goodHabits[idx] as any)?.id : (badHabits[idx] as any)?.id;
    return id ? `${type}:id:${id}` : `${type}:idx:${idx}`;
  };
  // Legacy key (pre-ids): name+index
  const habitLegacyKey = (name: string, idx: number, type: 'good' | 'bad') => `${type}:${idx}:${name}`;

  // Derive checked flags from persistent maps in userData (support legacy keys)
  const checkedGood = goodHabits.map((h, idx) => {
    const map = userData.checkedGoodToday || {};
    const k1 = habitKeyById(idx, 'good');
    const k2 = habitLegacyKey(h.name, idx, 'good');
    return !!(map[k1] || map[k2]);
  });
  const checkedBad = badHabits.map((h, idx) => {
    const map = userData.checkedBadToday || {};
    const k1 = habitKeyById(idx, 'bad');
    const k2 = habitLegacyKey(h.name, idx, 'bad');
    return !!(map[k1] || map[k2]);
  });

  // Handler for checking a good habit
  // EXP gain by level: 0:10, 1:20, 2:30, 3:50, 4:100, 5:200
  // expLevel 0 (bar 0/5): 10, expLevel 1 (bar 1/5): 20, ..., expLevel 5 (bar 5/5): 200
  // Gold gain by level: 0:10, 1:15, 2:20, 3:30, 4:50, 5:100
  const expGainLevels = [10, 20, 30, 50, 100, 200];
  const goldGainLevels = [10, 15, 20, 30, 50, 100];
  const handleCheckGoodHabit = (idx: number) => {
    const key = habitKeyById(idx, 'good');
    // Only allow checking once per day
    if (userData.checkedGoodToday && userData.checkedGoodToday[key]) return;

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
    let lastStage = treeStage;
    let totalGemReward = 0;
    while (leftoverExp >= currentExpToLevel && currentStage < 7) {
      leftoverExp -= currentExpToLevel;
      currentStage += 1;
      currentExpToLevel = expStages[currentStage - 1];
      leveledUp = true;
      if (currentStage > 1 && currentStage <= 7) {
        totalGemReward += gemRewardsByStage[Math.max(0, Math.min(currentStage - 1, gemRewardsByStage.length - 1))];
        lastStage = currentStage;
      }
    }

    // Prepare resulting resources
    let finalExp = leveledUp ? leftoverExp : Math.min(leftoverExp, currentExpToLevel);
    let finalCoins = (typeof coins === 'number' ? coins : 0) + coinGain;
    let finalGems = (typeof gems === 'number' ? gems : 0) + (leveledUp ? totalGemReward : 0);

    // Update persistent map and resources in one state update
    setUserData(prev => ({
      ...prev,
      coins: finalCoins,
      gems: finalGems,
      exp: finalExp,
      checkedGoodToday: { ...(prev.checkedGoodToday || {}), [key]: true },
    }));

    if (leveledUp) {
      setTreeStage(currentStage);
      setExpToLevel(currentExpToLevel);
      if (lastStage > 1 && lastStage <= 7) {
        setPopupStage(lastStage);
        setPopupGemReward(totalGemReward);
        setShowStagePopup(true);
      }
    }
  };

  const handleCheckBadHabit = (idx: number) => {
    const key = habitKeyById(idx, 'bad');
    // Only allow checking once per day
    if (userData.checkedBadToday && userData.checkedBadToday[key]) return;

    // Use decayLevel and expLossLevel for gain/loss
    const decayLevel = badHabits[idx]?.decayLevel ?? 0;
    const expLossLevel = badHabits[idx]?.expLossLevel ?? 0;
    const decayGain = getDecayGain(decayLevel);
    const expLoss = getExpLoss(expLossLevel);

    const finalDecay = Math.min(decay + decayGain, 200);
    const finalExp = Math.max(exp - expLoss, 0);

    setUserData(prev => ({
      ...prev,
      decay: finalDecay,
      exp: finalExp,
      checkedBadToday: { ...(prev.checkedBadToday || {}), [key]: true },
    }));
  };

  return (
    <View style={{flex: 1}}>
      {/* Welcome Modal - Only shown on first visit */}
      <Modal
        visible={showWelcomeModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipTutorial}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌱 Welcome!</Text>
            <Text style={styles.modalText}>
              Welcome to Self Improvement Tree! {'\n\n'}
              Here your personal growth takes the form of a living tree.
              {'\n\n'}
              Would you like a quick tour?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.skipButton]}
                onPress={handleSkipTutorial}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.startButton]}
                onPress={handleStartTutorial}
              >
                <Text style={styles.startButtonText}>Start Tour</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tutorial Overlay - Step 1: Tree Explanation */}
      {showTutorialOverlay && currentTutorialStep === 1 && (
        <Animated.View style={[styles.tutorialOverlay, { opacity: tutorialOpacity }]}>
          {/* Semi-transparent overlay pieces that avoid the highlight area */}
          {/* Top piece */}
          <View style={[styles.tutorialBackdropPiece, {
            top: 0,
            left: 0,
            right: 0,
            height: bgHeight * 0.55,
          }]} />
          
          {/* Bottom piece */}
          <View style={[styles.tutorialBackdropPiece, {
            top: bgHeight * 0.7,
            left: 0,
            right: 0,
            bottom: 0,
          }]} />
          
          {/* Left piece */}
          <View style={[styles.tutorialBackdropPiece, {
            top: bgHeight * 0.55,
            left: 0,
            right: '47.5%',
            marginRight: bgHeight * 0.1,
            height: bgHeight * 0.15,
          }]} />
          
          {/* Right piece */}
          <View style={[styles.tutorialBackdropPiece, {
            top: bgHeight * 0.55,
            left: '47.5%',
            marginLeft: bgHeight * 0.1,
            right: 0,
            height: bgHeight * 0.15,
          }]} />
          
          {/* Tutorial tooltip */}
          <View style={[styles.tutorialTooltip, { top: '60%' }]}>
            <Text style={styles.tutorialTitle}>🌳 Your Tree</Text>
            <Text style={styles.tutorialText}>
              This is your personal growth tree!{'\n\n'}
              • It grows when you complete good habits{'\n'}
              • It decays when you neglect bad habits{'\n\n'}
              Keep it healthy to reach higher levels!
            </Text>
            
            <View style={styles.tutorialButtons}>
              <TouchableOpacity
                style={[styles.tutorialButton, styles.tutorialNextButton]}
                onPress={handleNextTutorialStep}
              >
                <Text style={styles.tutorialNextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Tutorial Overlay - Step 2: EXP and Decay Bars Explanation */}
      {showTutorialOverlay && currentTutorialStep === 2 && (
        <Animated.View style={[styles.tutorialOverlay, { opacity: tutorialOpacity }]}>
          {/* Semi-transparent overlay pieces that avoid the progress bars area */}
          {/* Top piece - above progress bars */}
          <View style={[styles.tutorialBackdropPiece, {
            top: 0,
            left: 0,
            right: 0,
            height: '77.5%', // Above the progress bars area
          }]} />
          
          {/* Bottom piece - below progress bars */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '84%', // Below progress bars area
            left: 0,
            right: 0,
            bottom: 0,
          }]} />
          
          {/* Left piece */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '77.5%',
            left: 0,
            right: '97%', // Leave space for progress bars
            height: '6.5%', // Height of progress bars area
          }]} />
          
          {/* Right piece */}
          <View style={[styles.tutorialBackdropPiece, {
            top: '77.5%',
            left: '97%',
            right: 0,
            height: '6.5%',
          }]} />
          
          {/* Tutorial tooltip */}
          <View style={[styles.tutorialTooltip, { top: '30%' }]}>
            <Text style={styles.tutorialTitle}>📊 Progress Bars</Text>
            <Text style={styles.tutorialText}>
              • <Text style={{color: '#4bbf7f', fontWeight: 'bold'}}>EXP Bar (Green)</Text>: Represents tree growth{'\n'}
                When filled, your tree advances to the next stage!{'\n\n'}
              • <Text style={{color: '#ff0000', fontWeight: 'bold'}}>Decay Bar (Red)</Text>: Represents rot and decay{'\n'}
                When filled, growth stops. Use fertilizer cure your tree and set this bar back to 0!
            </Text>
            
            <View style={styles.tutorialButtons}>
              <TouchableOpacity
                style={[styles.tutorialButton, styles.tutorialNextButton]}
                onPress={handleNextTutorialStep}
              >
                <Text style={styles.tutorialNextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Tutorial Overlay - Step 3: Bottom Navigation Explanation */}
      {showTutorialOverlay && currentTutorialStep === 3 && (
        <Animated.View style={[styles.tutorialOverlay, { opacity: tutorialOpacity }]}>
          {/* Semi-transparent overlay pieces that avoid the bottom navigation area */}
          {/* Top piece - covers everything above navigation */}
          <View style={[styles.tutorialBackdropPiece, {
            top: 0,
            left: 0,
            right: 0,
            bottom: '0%', // Leave bottom 15% for navigation
          }]} />
          
          {/* Tutorial tooltip */}
          <View style={[styles.tutorialTooltip, { bottom: '10%' }]}>
            <Text style={styles.tutorialTitle}>🧭 Navigation</Text>
            <Text style={styles.tutorialText}>
              Use the bottom navigation bar to explore different sections of the app!{'\n\n'}
              • <Text style={{fontWeight: 'bold'}}>Tree Screen</Text>: Your tree and daily habits{'\n'}
              • <Text style={{fontWeight: 'bold'}}>Habits Screen</Text>: Upgrade and add habits{'\n'}
              • <Text style={{fontWeight: 'bold'}}>Shop Screen</Text>: Buy upgrades and items{'\n'}
              • <Text style={{fontWeight: 'bold'}}>Account Screen</Text>: Inventory, login and stats{'\n\n'}
              Try visiting another screen now to continue learning!
            </Text>
            
            <View style={styles.tutorialButtons}>
              <TouchableOpacity
                style={[styles.tutorialButton, styles.tutorialNextButton]}
                onPress={handleNextTutorialStep}
              >
                <Text style={styles.tutorialNextButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

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
      {/* Top: Tree background with fixed aspect ratio */}
      <View style={{ height: bgHeight }}>
        <ImageBackground source={bgSrc} style={{ width: bgWidth, height: bgHeight, alignSelf: 'center' }} resizeMode="contain">
          {/* Centered tree anchored to bottom baseline */}
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: bottomPx, alignItems: 'center', zIndex: 2 }}>
            <Image
              source={(treeImages as any)[`tree_${treeStage}`]}
              style={{ width: treeW, height: treeH, resizeMode: 'contain' }}
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
              <View style={[styles.progressBar, { width: `${Math.min((decay / 200) * 100, 100)}%`, backgroundColor: '#ff0000', height: 12, borderRadius: 6 }]} />
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
                    <Text style={styles.habitTextBad}>{(habit.name ?? '').slice(0, 25)}</Text>
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
                    <Text style={styles.habitTextGood}>{(habit.name ?? '').slice(0, 25)}</Text>
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
    flexWrap: 'wrap',
    fontSize: 14,
    minWidth: 0,
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
    flexWrap: 'wrap',
    fontSize: 14,
    minWidth: 0,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
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
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
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
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  tutorialBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  tutorialBackdropPiece: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  tutorialTreeSpotlight: {
    position: 'absolute',
    zIndex: 1001, // Above backdrop
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialHighlight: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#4bbf7f',
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#4bbf7f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 1002, // Above tree spotlight
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
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 12,
    textAlign: 'center',
  },
  tutorialText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  tutorialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tutorialButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
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