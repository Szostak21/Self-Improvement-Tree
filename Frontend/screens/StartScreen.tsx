import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, Pressable, Alert, ActivityIndicator, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { useAuth } from '../AuthContext';

type Props = {
  onStart: () => void;
};

export default function StartScreen({ onStart }: Props) {
  const { auth, registerInit, verifyRegistration, loginAndLink, logout, forgotInit, forgotConfirm } = useAuth();

  const [regVisible, setRegVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [fpVisible, setFpVisible] = useState(false);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regStep, setRegStep] = useState<'form' | 'code'>('form');
  const [regLoading, setRegLoading] = useState(false);

  const [logUsername, setLogUsername] = useState('');
  const [logPass, setLogPass] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [fpStep, setFpStep] = useState<'init' | 'code'>('init');
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpNewUsername, setFpNewUsername] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const startLabel = auth.token ? `Start (${auth.username || 'Account'})` : 'Start (as Guest)';

  async function handleRegisterNext() {
    if (regStep === 'form') {
      if (!regUsername || !regPass || !regEmail) {
        Alert.alert('Missing fields', 'Please fill Username, Email and Password.');
        return;
      }
      try {
        setRegLoading(true);
        const res = await registerInit(regUsername.trim(), regEmail.trim(), regPass);
        if (!res.ok) {
          Alert.alert('Register failed', res.error || 'Try again');
          return;
        }
        setRegStep('code');
        Alert.alert('Verification sent', `We sent a code to ${regEmail}. Enter it to verify.`);
      } finally {
        setRegLoading(false);
      }
    } else {
      if (!regCode) {
        Alert.alert('Missing code', 'Please enter the verification code.');
        return;
      }
      try {
        setRegLoading(true);
        const vr = await verifyRegistration(regEmail.trim(), regCode.trim());
        if (!vr.ok) {
          Alert.alert('Verification failed', vr.error || 'Try again');
          return;
        }
        // Now login and link guest data
        const lr = await loginAndLink(regUsername.trim(), regPass);
        if (!lr.ok) {
          Alert.alert('Login failed', lr.error || 'Try again');
          return;
        }
        setRegVisible(false);
        setRegStep('form');
        setRegCode('');
        onStart();
      } finally {
        setRegLoading(false);
      }
    }
  }

  async function handleLogin() {
    if (!logUsername || !logPass) {
      Alert.alert('Missing fields', 'Please fill Username and Password.');
      return;
    }
    try {
      setLogLoading(true);
      const res = await loginAndLink(logUsername.trim(), logPass);
      if (!res.ok) {
        Alert.alert('Login failed', res.error || 'Try again');
        return;
      }
      setLogVisible(false);
      onStart();
    } finally {
      setLogLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLogoutLoading(true);
      await logout();
      // Reset local UI to initial state
      setRegVisible(false);
      setLogVisible(false);
      setRegUsername('');
      setRegEmail('');
      setRegPass('');
      setLogUsername('');
      setLogPass('');
      Alert.alert('Logged out');
    } finally {
      setLogoutLoading(false);
    }
  }

  async function handleForgotFlow() {
    if (fpStep === 'init') {
      if (!fpIdentifier) {
        Alert.alert('Missing field', 'Enter your username or email.');
        return;
      }
      try {
        setFpLoading(true);
        const r = await forgotInit(fpIdentifier.trim());
        if (!r.ok) {
          Alert.alert('Error', r.error || 'Try again');
          return;
        }
        if (r.email) setFpEmail(r.email);
        setFpStep('code');
        Alert.alert('Email sent', `We sent a reset code to ${r.email || 'your email'}.`);
      } finally {
        setFpLoading(false);
      }
    } else {
      if (!fpCode) {
        Alert.alert('Missing fields', 'Enter the code.');
        return;
      }
      try {
        setFpLoading(true);
        const r = await forgotConfirm(fpEmail.trim(), fpCode.trim(), fpNewPass || undefined, fpNewUsername || undefined);
        if (!r.ok) {
          Alert.alert('Error', r.error || 'Try again');
          return;
        }
        setFpVisible(false);
        setFpStep('init');
        setFpIdentifier('');
        setFpEmail('');
        setFpCode('');
        setFpNewPass('');
        setFpNewUsername('');
        setLogUsername('');
        setLogPass('');
        onStart();
      } finally {
        setFpLoading(false);
      }
    }
  }

  // Dynamically size hero image using screen width and asset ratio
  const { width: winW } = useWindowDimensions();
  const heroSrc = require('../assets/tree/tree_6.png');
  const heroMeta = Image.resolveAssetSource(heroSrc);
  const heroRatio = heroMeta && heroMeta.width && heroMeta.height ? heroMeta.width / heroMeta.height : 1;
  const heroWidth = Math.min(winW * 0.8, 380);
  const heroHeight = heroWidth / heroRatio;

  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
      >
        Self-Improvement Tree
      </Text>
      <View style={{ height: 12 }} />
      <Image source={heroSrc} style={{ width: heroWidth, height: heroHeight }} resizeMode="contain" />
      <View style={{ height: 16 }} />

      {/* Big Start button with label below */}
      <View style={styles.startWrapper}>
        <TouchableOpacity style={styles.startButton} onPress={onStart} activeOpacity={0.9}>
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
        <Text style={styles.startSubtitle}>
          {auth.token ? (auth.username || 'Account') : 'as Guest'}
        </Text>
      </View>

      {/* Auth actions */}
      {auth.token ? (
        <View style={styles.authRow}>
          <TouchableOpacity style={[styles.authButton, { borderColor: '#d32f2f' }]} onPress={handleLogout}>
            {logoutLoading ? (
              <ActivityIndicator color="#d32f2f" />
            ) : (
              <Text style={[styles.authButtonText, { color: '#d32f2f' }]}>Log out</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authRow}>
          <TouchableOpacity style={styles.authButton} onPress={() => setRegVisible(true)}>
            <Text style={styles.authButtonText}>Register</Text>
          </TouchableOpacity>
          <View style={{ width: 16 }} />
          <TouchableOpacity style={styles.authButton} onPress={() => setLogVisible(true)}>
            <Text style={styles.authButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Register Modal */}
      <Modal visible={regVisible} transparent animationType="fade" onRequestClose={() => { setRegVisible(false); setRegStep('form'); setRegCode(''); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{regStep === 'form' ? 'Create Account' : 'Verify Email'}</Text>
            {regStep === 'form' ? (
              <>
                <TextInput placeholder="Username" style={styles.input} autoCapitalize="none" value={regUsername} onChangeText={setRegUsername} />
                <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={regEmail} onChangeText={setRegEmail} />
                <TextInput placeholder="Password" style={styles.input} secureTextEntry value={regPass} onChangeText={setRegPass} />
              </>
            ) : (
              <TextInput placeholder="Verification code" style={styles.input} keyboardType="number-pad" value={regCode} onChangeText={setRegCode} />
            )}
            {regLoading ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => { setRegVisible(false); setRegStep('form'); setRegCode(''); }} />
                <View style={{ width: 12 }} />
                <Button title={regStep === 'form' ? 'Send code' : 'Verify'} onPress={handleRegisterNext} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Login Modal */}
      <Modal visible={logVisible} transparent animationType="fade" onRequestClose={() => setLogVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log in</Text>
            <TextInput
              placeholder="Username"
              style={styles.input}
              autoCapitalize="none"
              value={logUsername}
              onChangeText={setLogUsername}
            />
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry
              value={logPass}
              onChangeText={setLogPass}
            />
            <Pressable onPress={() => { setLogVisible(false); setFpStep('init'); setFpVisible(true); }}
              style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
              <Text style={{ color: '#176d3b' }}>Forgot password?</Text>
            </Pressable>
            {logLoading ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setLogVisible(false)} />
                <View style={{ width: 12 }} />
                <Button title="Log in" onPress={handleLogin} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal visible={fpVisible} transparent animationType="fade" onRequestClose={() => { setFpVisible(false); setFpStep('init'); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{fpStep === 'init' ? 'Reset password' : 'Enter code'}</Text>
            {fpStep === 'init' ? (
              <TextInput placeholder="Username or Email" style={styles.input} autoCapitalize="none" value={fpIdentifier} onChangeText={setFpIdentifier} />
            ) : (
              <>
                <Text style={{ fontSize: 12, color: '#7c4d00', marginBottom: 4 }}>Email</Text>
                <View style={[styles.input, { backgroundColor: '#eee' }]}>
                  <Text style={{ color: '#555' }}>{fpEmail}</Text>
                </View>
                <TextInput placeholder="Reset code" style={styles.input} keyboardType="number-pad" value={fpCode} onChangeText={setFpCode} />
                <TextInput placeholder="New password (optional)" style={styles.input} secureTextEntry value={fpNewPass} onChangeText={setFpNewPass} />
                <TextInput placeholder="New username (optional)" style={styles.input} autoCapitalize="none" value={fpNewUsername} onChangeText={setFpNewUsername} />
              </>
            )}
            {fpLoading ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => { setFpVisible(false); setFpStep('init'); }} />
                <View style={{ width: 12 }} />
                <Button title={fpStep === 'init' ? 'Send code' : 'Confirm'} onPress={handleForgotFlow} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7f2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#176d3b',
  },
  heroImage: {
    width: '1%',
    aspectRatio: 1,
  },
  startWrapper: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  startButton: {
    width: '76%',
    height: 88,
    backgroundColor: '#176d3b',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  startText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },
  startSubtitle: {
    marginTop: 10,
    color: '#176d3b',
    fontSize: 14,
    opacity: 0.9,
  },
  authRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButton: {
    flexGrow: 1,
    maxWidth: 200,
    borderWidth: 2,
    borderColor: '#176d3b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  authButtonText: {
    color: '#176d3b',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});
