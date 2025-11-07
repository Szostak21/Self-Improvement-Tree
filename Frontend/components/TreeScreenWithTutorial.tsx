/**
 * TreeScreenWithTutorial.tsx
 * 
 * Enhanced TreeScreen with integrated step-by-step tutorial using react-native-copilot.
 * 
 * Features:
 * - Shows tutorial only once per user
 * - Syncs completion state with backend API
 * - Works offline with AsyncStorage caching
 * - Clean "Skip" option on first step
 * - 6 tutorial steps explaining all UI elements
 * 
 * Tutorial Steps:
 * 1. Welcome message with Start/Skip options
 * 2. Tree view explanation
 * 3. XP bar (green)  
 * 4. DK bar (red decay)
 * 5. Habit list at bottom
 * 6. Bottom navigation bar
 * 
 * HOW TO REUSE FOR OTHER SCREENS:
 * 
 * HabitScreen:
 * ```tsx
 * import { copilot, walkthroughable, CopilotStep } from 'react-native-copilot';
 * import { useTutorialProgress } from '../hooks/useTutorialProgress';
 * 
 * function HabitScreenComponent({ start, copilotEvents }: any) {
 *   const { hasSeenTutorial, markTutorialAsDone } = useTutorialProgress();
 *   const habitListRef = useRef(null);
 *   const addButtonRef = useRef(null);
 * 
 *   useEffect(() => {
 *     if (!hasSeenTutorial('habit')) {
 *       setTimeout(() => start(), 500);
 *     }
 *   }, [hasSeenTutorial, start]);
 * 
 *   useEffect(() => {
 *     const handleStop = () => markTutorialAsDone('habit');
 *     copilotEvents.on('stop', handleStop);
 *     return () => copilotEvents.off('stop', handleStop);
 *   }, [copilotEvents, markTutorialAsDone]);
 * 
 *   return (
 *     <View>
 *       <CopilotStep text="Track your daily habits here!" order={1} name="habitList">
 *         <WalkthroughableView ref={habitListRef}>
 *           {habits}
 *         </WalkthroughableView>
 *       </CopilotStep>
 *     </View>
 *   );
 * }
 * 
 * export default copilot({
 *   overlay: 'svg',
 *   animated: true,
 * })(HabitScreenComponent);
 * ```
 * 
 * ShopScreen: Same pattern, just change tutorial steps and screen name to 'shop'
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { copilot, walkthroughable, CopilotStep } from 'react-native-copilot';
import TreeScreen from '../screens/TreeScreen';
import { useTutorialProgress } from '../hooks/useTutorialProgress';

// Make any View walkthroughable for highlighting
const WalkthroughableView = walkthroughable(View);
const WalkthroughableText = walkthroughable(Text);

/**
 * Tutorial component that wraps the TreeScreen
 */
function TreeScreenWithTutorialComponent({ start, copilotEvents }: any) {
  const { hasSeenTutorial, markTutorialAsDone, isLoading } = useTutorialProgress();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Refs for UI elements to highlight
  const treeViewRef = useRef(null);
  const xpBarRef = useRef(null);
  const dkBarRef = useRef(null);
  const habitListRef = useRef(null);
  const bottomNavRef = useRef(null);

  /**
   * Check if tutorial should start when component mounts
   */
  useEffect(() => {
    if (!isLoading && !hasSeenTutorial('tree')) {
      // Show welcome modal first
      setTimeout(() => setShowWelcomeModal(true), 800);
    }
  }, [hasSeenTutorial, isLoading]);

  /**
   * Listen for tutorial completion
   */
  useEffect(() => {
    const handleStopEvent = () => {
      console.log('📖 Tree tutorial completed');
      markTutorialAsDone('tree');
    };

    copilotEvents.on('stop', handleStopEvent);
    return () => {
      copilotEvents.off('stop', handleStopEvent);
    };
  }, [copilotEvents, markTutorialAsDone]);

  /**
   * Start tutorial handler
   */
  const handleStartTutorial = () => {
    setShowWelcomeModal(false);
    setTimeout(() => {
      start();
    }, 300);
  };

  /**
   * Skip tutorial handler
   */
  const handleSkipTutorial = async () => {
    setShowWelcomeModal(false);
    await markTutorialAsDone('tree');
    console.log('⏭️  Tree tutorial skipped');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Welcome Modal - Only shown on first step */}
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

      {/* Main TreeScreen with Tutorial Steps */}
      <View style={{ flex: 1 }}>
        {/* 
          Note: The actual TreeScreen components need to be wrapped with CopilotStep.
          Since TreeScreen is a separate component, we have two options:
          
          Option 1: Modify TreeScreen.tsx to accept refs and wrap key elements
          Option 2: Create a new TreeScreenTutorial.tsx that reimplements the layout with tutorial steps
          
          For this implementation, I'll show the structure. You'll need to:
          1. Add refs to TreeScreen components (treeView, xpBar, dkBar, habitList, bottomNav)
          2. Pass those refs to this wrapper
          3. Or integrate this tutorial logic directly into TreeScreen.tsx
          
          Here's the tutorial step structure:
        */}
        
        {/* Step 1: Tree View */}
        <CopilotStep
          text="Your tree grows when you complete good habits and decays when you neglect them."
          order={1}
          name="treeView"
        >
          <WalkthroughableView ref={treeViewRef} style={styles.highlightWrapper}>
            {/* Tree container would go here */}
          </WalkthroughableView>
        </CopilotStep>

        {/* Step 2: XP Bar */}
        <CopilotStep
          text="The green XP bar shows your growth progress. When it fills, your tree levels up!"
          order={2}
          name="xpBar"
        >
          <WalkthroughableView ref={xpBarRef} style={styles.highlightWrapper}>
            {/* XP bar would go here */}
          </WalkthroughableView>
        </CopilotStep>

        {/* Step 3: Decay Bar */}
        <CopilotStep
          text="The red DK bar represents decay. If it reaches maximum, your tree stops growing until you buy fertilizer."
          order={3}
          name="dkBar"
        >
          <WalkthroughableView ref={dkBarRef} style={styles.highlightWrapper}>
            {/* Decay bar would go here */}
          </WalkthroughableView>
        </CopilotStep>

        {/* Step 4: Habit List */}
        <CopilotStep
          text="Here you can quickly mark your habits as done or missed."
          order={4}
          name="habitList"
        >
          <WalkthroughableView ref={habitListRef} style={styles.highlightWrapper}>
            {/* Habit list would go here */}
          </WalkthroughableView>
        </CopilotStep>

        {/* Step 5: Bottom Navigation */}
        <CopilotStep
          text="You can switch between screens using the bottom navigation bar. Try opening the Habit Screen next!"
          order={5}
          name="bottomNav"
        >
          <WalkthroughableView ref={bottomNavRef} style={styles.highlightWrapper}>
            {/* Bottom nav would go here */}
          </WalkthroughableView>
        </CopilotStep>

        {/* Render the actual TreeScreen */}
        <TreeScreen />
      </View>
    </View>
  );
}

// Export with copilot HOC
export default copilot({
  overlay: 'svg', // Use SVG overlay for better performance
  animated: true, // Smooth animations
  androidStatusBarVisible: true,
  backdropColor: 'rgba(0, 0, 0, 0.7)',
  labels: {
    previous: 'Previous',
    next: 'Next',
    skip: 'Skip',
    finish: 'Finish',
  },
})(TreeScreenWithTutorialComponent);

const styles = StyleSheet.create({
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
  highlightWrapper: {
    // Wrapper styles for highlighted elements
  },
});
