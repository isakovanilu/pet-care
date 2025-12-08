import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { getCurrentUser, getDocumentData, logout } from '../utils/firebaseHelpers';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen({ navigation }) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Determine if dark mode is active
  const isDarkMode = theme.mode === 'dark';

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });

    fetchUserData();
    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    try {
      const user = getCurrentUser();
      // If no user, set default data (since auth is disabled)
      if (!user) {
        setUserData({ name: 'User', email: 'user@example.com' });
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDocumentData('users', user.uid);
        if (userDoc) {
          setUserData({ ...userDoc, email: user.email });
        } else {
          setUserData({ email: user.email });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default data on error
        setUserData({ name: 'User', email: user.email || 'user@example.com' });
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      // Set default data on any error
      setUserData({ name: 'User', email: 'user@example.com' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  const handleThemeToggle = (value) => {
    toggleTheme(value ? 'dark' : 'light');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.avatar}>
          <Icon name="account-circle" size={100} color={theme.colors.textSecondary} />
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>{userData?.name || 'User'}</Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{userData?.email}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        {/* Dark Mode Toggle - Prominent at top */}
        <View style={[styles.menuItem, styles.themeMenuItem, { 
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          marginBottom: 10,
        }]}>
          <Icon name={isDarkMode ? "brightness-2" : "brightness-7"} size={28} color={theme.colors.primary} />
          <Text style={[styles.menuText, { 
            color: theme.colors.text, 
            flex: 1,
            fontSize: 18,
            fontWeight: '600',
          }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeToggle}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
            ios_backgroundColor={theme.colors.border}
          />
        </View>
        
        {/* Alternative button if Switch doesn't work */}
        <TouchableOpacity 
          style={[styles.themeButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleThemeToggle(!isDarkMode)}
        >
          <Icon name={isDarkMode ? "brightness-7" : "brightness-2"} size={20} color="#fff" />
          <Text style={styles.themeButtonText}>
            Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Icon name="person" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Edit Profile</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Icon name="payment" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Payment Methods</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Icon name="notifications" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Notifications</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Icon name="help" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
          <Icon name="info" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.text }]}>About</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.icon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.colors.card }]} onPress={handleLogout}>
        <Icon name="logout" size={24} color={theme.colors.error} />
        <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
    marginBottom: 32,
  },
  avatar: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 17,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 16,
    letterSpacing: 0.2,
  },
  themeMenuItem: {
    backgroundColor: 'transparent',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

