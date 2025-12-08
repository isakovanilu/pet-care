import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { getCurrentUser, queryCollection, deleteDocument, where, orderBy } from '../../utils/firebaseHelpers';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PetsScreen({ navigation }) {
  const { theme } = useTheme();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPets();
    });

    fetchPets();
    return unsubscribe;
  }, [navigation]);

  const fetchPets = async () => {
    const user = getCurrentUser();
    
    // If no user (authentication disabled), load from localStorage
    if (!user) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          const stored = window.localStorage.getItem('pets');
          if (stored) {
            const petsData = JSON.parse(stored);
            // Sort by createdAt descending
            petsData.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0);
              const dateB = new Date(b.createdAt || 0);
              return dateB - dateA;
            });
            setPets(petsData);
          } else {
            setPets([]);
          }
        } catch (parseError) {
          // Error parsing pets from localStorage
          setPets([]);
        }
      } else {
        setPets([]);
      }
      setLoading(false);
      return;
    }

    try {
      const petsData = await queryCollection('pets', [
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      ]);

      setPets(petsData);
    } catch (error) {
      console.error('Error fetching pets:', error);
      // Don't show alert if Firebase is not configured
      if (error.message && !error.message.includes('Firebase')) {
        Alert.alert('Error', 'Failed to load pets');
      }
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = (petId) => {
    Alert.alert(
      'Delete Pet',
      'Are you sure you want to delete this pet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              
              if (!user) {
                // Delete from localStorage
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  try {
                    const stored = window.localStorage.getItem('pets');
                    if (stored) {
                      const petsData = JSON.parse(stored);
                      const filteredPets = petsData.filter(pet => pet.id !== petId);
                      window.localStorage.setItem('pets', JSON.stringify(filteredPets));
                      fetchPets(); // Refresh the list
                    }
                  } catch (error) {
                    Alert.alert('Error', 'Failed to delete pet');
                  }
                }
              } else {
                // Delete from Firebase
                await deleteDocument('pets', petId);
                fetchPets();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete pet');
            }
          },
        },
      ]
    );
  };

  const renderPet = ({ item }) => (
    <TouchableOpacity
      style={[styles.petCard, { 
        backgroundColor: theme.colors.card,
        borderLeftColor: theme.colors.primary 
      }]}
      onPress={() => navigation.navigate('EditPet', { pet: item })}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.petImage} />
      ) : (
        <View style={[styles.placeholderImage, { backgroundColor: theme.colors.surface }]}>
          <Icon name="pets" size={40} color={theme.colors.textSecondary} />
        </View>
      )}
      <View style={styles.petInfo}>
        <Text style={[styles.petName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.petDetails, { color: theme.colors.textSecondary }]}>
          {item.breed} • {item.age} years old
        </Text>
        <Text style={[styles.petType, { color: theme.colors.primary }]}>{item.type}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeletePet(item.id)}
        style={styles.deleteButton}
      >
        <Icon name="delete" size={24} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="pets" size={80} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>No pets yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Add your first pet to get started
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddPet')}
            activeOpacity={0.9}
          >
            <Icon name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Pet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={pets}
            renderItem={renderPet}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddPet')}
            activeOpacity={0.9}
          >
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
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
  list: {
    padding: 24,
  },
  petCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  petDetails: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  petType: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  deleteButton: {
    justifyContent: 'center',
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 24,
  },
  emptySubtext: {
    fontSize: 17,
    fontWeight: '300',
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

