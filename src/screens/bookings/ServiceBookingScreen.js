import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { getCurrentUser, createDocument, queryCollection, where, Timestamp } from '../../utils/firebaseHelpers';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const SERVICES = [
  { id: 1, name: 'Grooming', price: 50, icon: 'content-cut', duration: '2 hours' },
  { id: 2, name: 'Walking', price: 25, icon: 'directions-walk', duration: '1 hour' },
  { id: 3, name: 'Sitting', price: 75, icon: 'home', duration: 'Full day' },
  { id: 4, name: 'Training', price: 100, icon: 'school', duration: '2 hours' },
  { id: 5, name: 'Vet Visit', price: 150, icon: 'local-hospital', duration: '1 hour' },
  { id: 6, name: 'Boarding', price: 120, icon: 'hotel', duration: 'Overnight' },
];

export default function ServiceBookingScreen({ route, navigation }) {
  const selectedService = route.params?.service;
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedServiceData, setSelectedServiceData] = useState(
    selectedService
      ? SERVICES.find((s) => s.name === selectedService.name)
      : null
  );
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const petsData = await queryCollection('pets', [
        where('ownerId', '==', user.uid)
      ]);

      setPets(petsData);
      if (petsData.length === 1) {
        setSelectedPet(petsData[0]);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleBook = async () => {
    if (!selectedPet) {
      Alert.alert('Error', 'Please select a pet');
      return;
    }

    if (!selectedServiceData) {
      Alert.alert('Error', 'Please select a service');
      return;
    }

    setLoading(true);
    try {
      const user = getCurrentUser();
      const bookingDate = new Date(date);
      bookingDate.setHours(time.getHours());
      bookingDate.setMinutes(time.getMinutes());

      const bookingData = {
        userId: user.uid,
        petId: selectedPet.id,
        petName: selectedPet.name,
        serviceName: selectedServiceData.name,
        serviceId: selectedServiceData.id,
        amount: selectedServiceData.price,
        date: Timestamp.fromDate(bookingDate),
        notes: notes || null,
        status: 'pending',
      };

      const docRef = await createDocument('bookings', bookingData);

      navigation.navigate('Payment', {
        bookingId: docRef.id,
        amount: selectedServiceData.price,
        booking: bookingData,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {!selectedServiceData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Service</Text>
            <View style={styles.servicesGrid}>
              {SERVICES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedServiceData?.id === service.id &&
                      styles.serviceCardSelected,
                  ]}
                  onPress={() => setSelectedServiceData(service)}
                >
                  <Icon name={service.icon} size={30} color="#4A90E2" />
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>${service.price}</Text>
                  <Text style={styles.serviceDuration}>{service.duration}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedServiceData && (
          <View style={styles.selectedService}>
            <Icon
              name={selectedServiceData.icon}
              size={40}
              color="#4A90E2"
            />
            <Text style={styles.selectedServiceName}>
              {selectedServiceData.name}
            </Text>
            <Text style={styles.selectedServicePrice}>
              ${selectedServiceData.price}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Pet</Text>
          {pets.length === 0 ? (
            <TouchableOpacity
              style={styles.addPetButton}
              onPress={() =>
                navigation.navigate('Pets', { screen: 'AddPet' })
              }
            >
              <Icon name="add" size={24} color="#4A90E2" />
              <Text style={styles.addPetText}>Add a Pet First</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.petsList}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petCard,
                    selectedPet?.id === pet.id && styles.petCardSelected,
                  ]}
                  onPress={() => setSelectedPet(pet)}
                >
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petDetails}>
                    {pet.breed} • {pet.age} years
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-today" size={24} color="#4A90E2" />
            <Text style={styles.dateTimeText}>
              {format(date, 'MMMM dd, yyyy')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="access-time" size={24} color="#4A90E2" />
            <Text style={styles.dateTimeText}>
              {format(time, 'hh:mm a')}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service:</Text>
            <Text style={styles.summaryValue}>
              {selectedServiceData?.name || 'Not selected'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pet:</Text>
            <Text style={styles.summaryValue}>
              {selectedPet?.name || 'Not selected'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryTotal}>
              ${selectedServiceData?.price || 0}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedPet || !selectedServiceData || loading) &&
              styles.bookButtonDisabled,
          ]}
          onPress={handleBook}
          disabled={!selectedPet || !selectedServiceData || loading}
        >
          <Text style={styles.bookButtonText}>
            {loading ? 'Processing...' : 'Continue to Payment'}
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  serviceCardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#f0f7ff',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  selectedService: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedServiceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  selectedServicePrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginTop: 5,
  },
  petsList: {
    gap: 10,
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  petCardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#f0f7ff',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  petDetails: {
    fontSize: 14,
    color: '#666',
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  addPetText: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 10,
    fontWeight: '600',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  summaryTotal: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 30,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

