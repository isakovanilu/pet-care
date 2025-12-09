import React, { useState } from 'react';
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
import { signUp } from '../../utils/firebaseHelpers';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Use localStorage authentication only
      await signUp(email, password, { name, phone });
      
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => {
          // User will be automatically logged in after registration
          // Navigation happens automatically via App.js auth state
          // Force a page reload to update auth state
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }}
      ]);
    } catch (error) {
      console.error('[RegisterScreen] Registration error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.message && error.message.includes('already')) {
        errorMessage = 'This email is already registered.';
      } else if (error.message && error.message.includes('email')) {
        errorMessage = 'Invalid email address.';
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Icon name="pets" size={60} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Join Pet Care today</Text>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <Icon name="person" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Full Name"
            placeholderTextColor={theme.colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <Icon name="email" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <Icon name="phone" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Phone Number"
            placeholderTextColor={theme.colors.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <Icon name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Password"
            placeholderTextColor={theme.colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <Icon name="lock-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Confirm Password"
            placeholderTextColor={theme.colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: theme.colors.primary }]}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '300',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

