/**
 * TreeScreenTutorial.tsx
 * 
 * Complete working example of TreeScreen with integrated tutorial
 * using react-native-copilot v3.x API
 * 
 * This is a MINIMAL EXAMPLE showing the correct implementation pattern.
 * You should integrate this logic into your existing TreeScreen.tsx.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { copilot, CopilotStep } from 'react-native-copilot';
import { useTutorialProgress } from '../hooks/useTutorialProgress';

/**
 * Main TreeScreen component with tutorial integration
 */
function TreeScreenTutorialComponent(props: any) {
  const { start, copilotEvents } = props;
  const { hasSeenTutorial, markTutorialAsDone, isLoading } = useTutorialProgress();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  /**
   * Check if tutorial should start on mount
   */
  useEffect(() => {
    if (!isLoading && !hasSeenTutorial('tree')) {
      // Show welcome modal after a short delay
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 800);
      return () => clearTimeout(timer);
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
   * Start tutorial
   */
  const handleStartTutorial = () => {
    setShowWelcomeModal(false);
    setTimeout(() => {
      start();
    }, 300);
  };

  /**
   * Skip tutorial
   */
  const handleSkipTutorial = async () => {
    setShowWelcomeModal(false);
    await markTutorialAsDone('tree');
    console.log('⏭️  Tree tutorial skipped');
  };

  return (
    <View style={styles.container}>
      {/* Welcome Modal */}
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
              Welcome to Self Improvement Tree!{'\n\n'}
              Here your personal growth takes the form of a living tree.{'\n\n'}
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

      {/* Main Content with Tutorial Steps */}
      <ScrollView style={styles.scrollView}>
        {/* Step 1: Tree View */}
        <CopilotStep
          text="Your tree grows when you complete good habits and decays when you neglect them."
          order={1}
          name="treeView"
        >
          <View style={styles.treeContainer}>
            <Text style={styles.treeText}>🌳 Your Tree</Text>
            <Text style={styles.subtitle}>Grows with good habits</Text>
          </View>
        </CopilotStep>

        {/* Step 2: XP Bar */}
        <CopilotStep
          text="The green XP bar shows your growth progress. When it fills, your tree levels up!"
          order={2}
          name="xpBar"
        >
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>XP</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '60%', backgroundColor: '#4a7c2c' }]} />
            </View>
            <Text style={styles.barValue}>60/100</Text>
          </View>
        </CopilotStep>

        {/* Step 3: Decay Bar */}
        <CopilotStep
          text="The red DK bar represents decay. If it reaches maximum, your tree stops growing until you buy fertilizer."
          order={3}
          name="dkBar"
        >
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>DK</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '30%', backgroundColor: '#c53030' }]} />
            </View>
            <Text style={styles.barValue}>30/100</Text>
          </View>
        </CopilotStep>

        {/* Step 4: Habit List */}
        <CopilotStep
          text="Here you can quickly mark your habits as done or missed."
          order={4}
          name="habitList"
        >
          <View style={styles.habitListContainer}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <View style={styles.habitItem}>
              <Text style={styles.habitText}>✓ Morning Exercise</Text>
            </View>
            <View style={styles.habitItem}>
              <Text style={styles.habitText}>○ Read 30 minutes</Text>
            </View>
            <View style={styles.habitItem}>
              <Text style={styles.habitText}>○ Meditation</Text>
            </View>
          </View>
        </CopilotStep>

        {/* Step 5: Bottom Navigation */}
        <CopilotStep
          text="You can switch between screens using the bottom navigation bar. Try opening the Habit Screen next!"
          order={5}
          name="bottomNav"
        >
          <View style={styles.navContainer}>
            <Text style={styles.navText}>📊 Tree | 📝 Habits | 🛒 Shop</Text>
          </View>
        </CopilotStep>
      </ScrollView>
    </View>
  );
}

/**
 * Export with copilot HOC
 */
export default copilot({
  overlay: 'svg',
  animated: true,
  androidStatusBarVisible: true,
  backdropColor: 'rgba(0, 0, 0, 0.7)',
  labels: {
    previous: 'Previous',
    next: 'Next',
    skip: 'Skip',
    finish: 'Finish',
  },
})(TreeScreenTutorialComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
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
  treeContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  treeText: {
    fontSize: 48,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  barContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  barValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  habitListContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 15,
  },
  habitItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  habitText: {
    fontSize: 16,
    color: '#333',
  },
  navContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navText: {
    fontSize: 16,
    color: '#666',
  },
});
