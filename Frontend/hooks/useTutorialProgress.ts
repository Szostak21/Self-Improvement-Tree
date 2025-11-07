/**
 * useTutorialProgress Hook
 * 
 * Manages tutorial progress state both locally (AsyncStorage) and remotely (backend API).
 * Ensures tutorials are shown only once per screen per user.
 * 
 * Usage:
 * ```
 * const { hasSeenTutorial, markTutorialAsDone, isLoading } = useTutorialProgress();
 * 
 * // Check if user has seen the tree tutorial
 * if (!hasSeenTutorial('tree') && !isLoading) {
 *   // Start tutorial
 * }
 * 
 * // Mark tutorial as completed
 * await markTutorialAsDone('tree');
 * ```
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';

// We'll use auth state from AsyncStorage directly since AuthContext doesn't export it
// Alternative: You could modify AuthContext to export it, but this approach works standalone

const TUTORIAL_STORAGE_KEY = '@tutorialProgress';

export interface TutorialProgress {
  tree: boolean;
  habit: boolean;
  shop: boolean;
}

const defaultProgress: TutorialProgress = {
  tree: false,
  habit: false,
  shop: false,
};

export const useTutorialProgress = () => {
  const [progress, setProgress] = useState<TutorialProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  /**
   * Load auth state from AsyncStorage
   */
  useEffect(() => {
    const loadAuthState = async () => {
      const [token, user] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('username'),
      ]);
      setAuthToken(token);
      setUsername(user);
    };
    loadAuthState();
  }, []);

  /**
   * Load tutorial progress from AsyncStorage and sync with backend
   */
  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Load from AsyncStorage first (fast, works offline)
      const cachedData = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setProgress(parsed);
        console.log('📖 Tutorial progress loaded from cache:', parsed);
      }

      // 2. If user is logged in, sync with backend
      if (authToken && username) {
        try {
          const response = await fetch(`${API_BASE}/api/user/tutorial-progress`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const serverProgress: TutorialProgress = await response.json();
            console.log('☁️  Tutorial progress synced from backend:', serverProgress);
            
            // Update local state and cache with server data
            setProgress(serverProgress);
            await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(serverProgress));
          } else {
            console.warn('⚠️  Failed to fetch tutorial progress from backend');
          }
        } catch (error) {
          console.warn('⚠️  Network error fetching tutorial progress (using cached data):', error);
          // Continue with cached data in offline mode
        }
      }
    } catch (error) {
      console.error('❌ Error loading tutorial progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, username]);

  /**
   * Load progress on mount and when auth state changes
   */
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  /**
   * Check if user has seen a specific tutorial
   */
  const hasSeenTutorial = useCallback(
    (screen: keyof TutorialProgress): boolean => {
      return progress[screen] === true;
    },
    [progress]
  );

  /**
   * Mark a tutorial as completed
   * Updates both local cache and backend
   */
  const markTutorialAsDone = useCallback(
    async (screen: keyof TutorialProgress) => {
      try {
        const updatedProgress = { ...progress, [screen]: true };
        
        // 1. Update local state immediately for instant UI feedback
        setProgress(updatedProgress);
        
        // 2. Save to AsyncStorage
        await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(updatedProgress));
        console.log(`✅ Tutorial '${screen}' marked as done locally`);

        // 3. Sync with backend if user is logged in
        if (authToken && username) {
          try {
            const response = await fetch(`${API_BASE}/api/user/tutorial-progress`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedProgress),
            });

            if (response.ok) {
              const serverProgress = await response.json();
              console.log('☁️  Tutorial progress synced to backend:', serverProgress);
            } else {
              console.warn('⚠️  Failed to sync tutorial progress to backend');
            }
          } catch (error) {
            console.warn('⚠️  Network error syncing tutorial progress (saved locally):', error);
            // Continue - data is saved locally and will sync later
          }
        }
      } catch (error) {
        console.error('❌ Error marking tutorial as done:', error);
      }
    },
    [progress, authToken, username]
  );

  /**
   * Reset all tutorial progress (for testing/debugging)
   */
  const resetTutorialProgress = useCallback(async () => {
    try {
      const resetProgress = defaultProgress;
      setProgress(resetProgress);
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(resetProgress));
      
      if (authToken && username) {
        await fetch(`${API_BASE}/api/user/tutorial-progress`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resetProgress),
        });
      }
      
      console.log('🔄 Tutorial progress reset');
    } catch (error) {
      console.error('❌ Error resetting tutorial progress:', error);
    }
  }, [authToken, username]);

  return {
    progress,
    hasSeenTutorial,
    markTutorialAsDone,
    resetTutorialProgress,
    isLoading,
  };
};
