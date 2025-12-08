import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { 
  signInWithPhoneNumber,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../../../firebase.config';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function OTPLoginScreen({ navigation }) {
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  // Check for email link on mount (web only)
  useEffect(() => {
    // Create reCAPTCHA container for web
    if (typeof window !== 'undefined' && !document.getElementById('recaptcha-container')) {
      const container = document.createElement('div');
      container.id = 'recaptcha-container';
      container.style.display = 'none';
      document.body.appendChild(container);
    }

    // Check for email sign-in link
    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem('emailForSignIn');
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            Alert.alert('Success', 'Login successful!');
            window.localStorage.removeItem('emailForSignIn');
          })
          .catch((error) => {
            Alert.alert('Error', error.message);
          });
      }
    }
  }, []);

  // Setup reCAPTCHA for web
  const setupRecaptcha = () => {
    if (typeof window === 'undefined') {
      return null; // Not on web
    }

    if (!window.recaptchaVerifier) {
      try {
        // Dynamically import RecaptchaVerifier for web
        const { RecaptchaVerifier } = require('firebase/auth');
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
        });
      } catch (error) {
        console.warn('Recaptcha not available:', error);
        return null;
      }
    }
    return window.recaptchaVerifier;
  };

  const handlePhoneOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Format phone number (add + if not present)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    setLoading(true);
    try {
      const appVerifier = setupRecaptcha();
      if (!appVerifier) {
        Alert.alert('Error', 'reCAPTCHA verification not available. Please configure Firebase for phone authentication.');
        setLoading(false);
        return;
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      Alert.alert('Success', 'OTP sent to your phone!');
    } catch (error) {
      console.error('Phone OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Make sure Firebase Phone Auth is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOTP = async () => {
    if (!otp || !verificationId) {
      Alert.alert('Error', 'Please enter the OTP code');
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      Alert.alert('Success', 'Login successful!');
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', error.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const actionCodeSettings = {
        url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:19006',
        handleCodeInApp: true,
      };

      // Store email for later use
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email);
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      setEmailLinkSent(true);
      Alert.alert(
        'Email Sent',
        'Check your email for the sign-in link. Click the link to sign in.'
      );
    } catch (error) {
      console.error('Email OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Pet Care</Text>
        <Text style={styles.subtitle}>Login with OTP</Text>

        {/* Method Selector */}
        <View style={styles.methodSelector}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              loginMethod === 'phone' && styles.methodButtonActive,
            ]}
            onPress={() => {
              setLoginMethod('phone');
              setVerificationId(null);
              setOtp('');
            }}
          >
            <Icon name="phone" size={20} color={loginMethod === 'phone' ? '#fff' : '#4A90E2'} />
            <Text
              style={[
                styles.methodButtonText,
                loginMethod === 'phone' && styles.methodButtonTextActive,
              ]}
            >
              Phone
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodButton,
              loginMethod === 'email' && styles.methodButtonActive,
            ]}
            onPress={() => {
              setLoginMethod('email');
              setEmailLinkSent(false);
            }}
          >
            <Icon name="email" size={20} color={loginMethod === 'email' ? '#fff' : '#4A90E2'} />
            <Text
              style={[
                styles.methodButtonText,
                loginMethod === 'email' && styles.methodButtonTextActive,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone OTP Flow */}
        {loginMethod === 'phone' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phone Number (e.g., +1234567890)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            {!verificationId ? (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handlePhoneOTP}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.otpLabel}>Enter OTP Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={verifyPhoneOTP}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setVerificationId(null);
                    setOtp('');
                  }}
                >
                  <Text style={styles.linkText}>Change Phone Number</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* Email OTP Flow */}
        {loginMethod === 'email' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {!emailLinkSent ? (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleEmailOTP}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Sending Link...' : 'Send Sign-In Link'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emailSentBox}>
                <Icon name="check-circle" size={24} color="#4A90E2" />
                <Text style={styles.emailSentText}>
                  Sign-in link sent! Check your email and click the link to sign in.
                </Text>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setEmailLinkSent(false);
                    setEmail('');
                  }}
                >
                  <Text style={styles.linkText}>Send to Different Email</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Hidden reCAPTCHA container for web - injected via useEffect */}

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  methodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#ddd',
    gap: 8,
  },
  methodButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  methodButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  methodButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  emailSentBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  emailSentText: {
    color: '#1976D2',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
