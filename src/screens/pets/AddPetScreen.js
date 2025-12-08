import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { getCurrentUser, createDocument, uploadFile } from '../../utils/firebaseHelpers';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];
const GENDERS = ['Male', 'Female'];

export default function AddPetScreen({ navigation }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    // Convert image to base64 data URL for local storage
    return await uploadFile(uri);
  };

  const handleSave = async () => {
    if (!name || !type || !breed || !age || !gender) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const user = getCurrentUser();
      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage(image);
      }

      const petData = {
        id: `pet_${Date.now()}`,
        ownerId: user ? user.uid : 'guest',
        name,
        type,
        breed,
        age: parseInt(age),
        gender,
        weight: weight ? parseFloat(weight) : null,
        notes: notes || null,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      // If no user (auth disabled), save to localStorage
      if (!user) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          let existingPets = [];
          try {
            const stored = window.localStorage.getItem('pets');
            if (stored) {
              existingPets = JSON.parse(stored);
            }
          } catch (parseError) {
            console.warn('Error parsing existing pets:', parseError);
            existingPets = [];
          }
          
          existingPets.push(petData);
          window.localStorage.setItem('pets', JSON.stringify(existingPets));
          // Pet saved to localStorage
        } else {
          Alert.alert('Error', 'This feature requires authentication or web browser');
          setLoading(false);
          return;
        }
      } else {
        // Save to Firebase if user exists
        await createDocument('pets', petData);
      }

      Alert.alert('Success', 'Pet added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'Failed to add pet: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="add-a-photo" size={40} color="#ccc" />
              <Text style={styles.placeholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Pet Name *"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Pet Type *</Text>
        <View style={styles.typeContainer}>
          {PET_TYPES.map((petType) => (
            <TouchableOpacity
              key={petType}
              style={[
                styles.typeButton,
                type === petType && styles.typeButtonActive,
              ]}
              onPress={() => setType(petType)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === petType && styles.typeButtonTextActive,
                ]}
              >
                {petType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Breed *"
          value={breed}
          onChangeText={setBreed}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Age (years) *"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text style={styles.label}>Gender *</Text>
        <View style={styles.typeContainer}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.typeButton,
                gender === g && styles.typeButtonActive,
              ]}
              onPress={() => setGender(g)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  gender === g && styles.typeButtonTextActive,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Save Pet'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  placeholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 10,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

