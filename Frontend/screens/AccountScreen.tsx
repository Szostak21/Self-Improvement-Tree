import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert, DevSettings, Pressable } from 'react-native';
import { useAuth } from '../AuthContext';

export default function AccountScreen() {
  const { auth, registerInit, verifyRegistration, loginAndLink, forgotInit, forgotConfirm } = useAuth();

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

  const [fpStep, setFpStep] = useState<'init' | 'code'>('init');
  const [fpIdentifier, setFpIdentifier] = useState(''); // username or email for init
  const [fpEmail, setFpEmail] = useState(''); // email for confirm
  const [fpCode, setFpCode] = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpNewUsername, setFpNewUsername] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  async function handleRegister() {
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
        const lr = await loginAndLink(regUsername.trim(), regPass);
        if (!lr.ok) {
          Alert.alert('Login failed', lr.error || 'Try again');
          return;
        }
        setRegVisible(false);
        setRegStep('form');
        setRegCode('');
        DevSettings.reload();
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
      DevSettings.reload();
    } finally {
      setLogLoading(false);
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
        // Ask for code next
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
        DevSettings.reload();
      } finally {
        setFpLoading(false);
      }
    }
  }

  return (
    <View style={styles.screen}>
      <View style={{ width: '85%', maxWidth: 420, alignItems: 'center' }}>
        <Text style={styles.header}>
          {auth.token ? `Logged in as ${auth.username || 'Account'}` : 'Logged in as Guest'}
        </Text>

        {!auth.token && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => {
                setRegUsername('');
                setRegEmail('');
                setRegPass('');
                setRegVisible(true);
              }}
            >
              <Text style={styles.authButtonText}>Register</Text>
            </TouchableOpacity>
            <View style={{ width: 16 }} />
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => {
                setLogUsername('');
                setLogPass('');
                setLogVisible(true);
              }}
            >
              <Text style={styles.authButtonText}>Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Register Modal */}
      <Modal visible={regVisible} transparent animationType="fade" onRequestClose={() => { setRegVisible(false); setRegStep('form'); setRegCode(''); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{regStep === 'form' ? 'Create Account' : 'Verify Email'}</Text>
            {regStep === 'form' ? (
              <>
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#9e9e9e"
                  style={styles.input}
                  autoCapitalize="none"
                  value={regUsername}
                  onChangeText={setRegUsername}
                />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#9e9e9e"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={regEmail}
                  onChangeText={setRegEmail}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#9e9e9e"
                  style={styles.input}
                  secureTextEntry
                  value={regPass}
                  onChangeText={setRegPass}
                />
              </>
            ) : (
              <TextInput
                placeholder="Verification code"
                placeholderTextColor="#9e9e9e"
                style={styles.input}
                keyboardType="number-pad"
                value={regCode}
                onChangeText={setRegCode}
              />
            )}
            {regLoading ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => { setRegVisible(false); setRegStep('form'); setRegCode(''); }} />
                <View style={{ width: 12 }} />
                <Button title={regStep === 'form' ? 'Send code' : 'Verify'} onPress={handleRegister} />
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
              placeholderTextColor="#9e9e9e"
              style={styles.input}
              autoCapitalize="none"
              value={logUsername}
              onChangeText={setLogUsername}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9e9e9e"
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
              <TextInput
                placeholder="Username or Email"
                placeholderTextColor="#9e9e9e"
                style={styles.input}
                autoCapitalize="none"
                value={fpIdentifier}
                onChangeText={setFpIdentifier}
              />
            ) : (
              <>
                <Text style={{ fontSize: 12, color: '#7c4d00', marginBottom: 4 }}>Email</Text>
                <View style={[styles.input, { backgroundColor: '#eee' }]}>
                  <Text style={{ color: '#555' }}>{fpEmail}</Text>
                </View>
                <TextInput
                  placeholder="Reset code"
                  placeholderTextColor="#9e9e9e"
                  style={styles.input}
                  keyboardType="number-pad"
                  value={fpCode}
                  onChangeText={setFpCode}
                />
                <TextInput
                  placeholder="New password (optional)"
                  placeholderTextColor="#9e9e9e"
                  style={styles.input}
                  secureTextEntry
                  value={fpNewPass}
                  onChangeText={setFpNewPass}
                />
                <TextInput
                  placeholder="New username (optional)"
                  placeholderTextColor="#9e9e9e"
                  style={styles.input}
                  autoCapitalize="none"
                  value={fpNewUsername}
                  onChangeText={setFpNewUsername}
                />
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
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButton: {
    borderWidth: 2,
    borderColor: '#176d3b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
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
    width: '85%',
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
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});
