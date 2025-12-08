import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { getCurrentUser, queryCollection, where, orderBy } from '../../utils/firebaseHelpers';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

export default function BookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });

    fetchBookings();
    return unsubscribe;
  }, [navigation]);

  const fetchBookings = async () => {
    const user = getCurrentUser();
    
    // If no user (authentication disabled), load from localStorage
    if (!user) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          const stored = window.localStorage.getItem('bookings');
          if (stored) {
            const bookingsData = JSON.parse(stored);
            // Sort by createdAt descending
            bookingsData.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0);
              const dateB = new Date(b.createdAt || 0);
              return dateB - dateA;
            });
            setBookings(bookingsData);
          } else {
            setBookings([]);
          }
        } catch (parseError) {
          // Error parsing bookings from localStorage
          setBookings([]);
        }
      } else {
        setBookings([]);
      }
      setLoading(false);
      return;
    }

    try {
      const bookingsData = await queryCollection('bookings', [
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      ]);

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Don't show alert if Firebase is not configured
      if (error.message && !error.message.includes('Firebase')) {
        Alert.alert('Error', 'Failed to load bookings');
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4ECDC4';
      case 'pending':
        return '#FFD93D';
      case 'completed':
        return '#95E1D3';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return '#ccc';
    }
  };

  const renderBooking = ({ item }) => {
    // Handle both Firebase Timestamp and ISO string dates
    let date;
    if (item.date) {
      if (item.date.toDate) {
        // Firebase Timestamp
        date = item.date.toDate();
      } else if (typeof item.date === 'string') {
        // ISO string from localStorage
        date = new Date(item.date);
      } else {
        date = new Date(item.date);
      }
    }
    
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => navigation.navigate('BookingDetails', { booking: item })}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.serviceIcon}>
            <Icon name={getServiceIcon(item.serviceName)} size={24} color="#4A90E2" />
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.serviceName}>{item.serviceNames || item.serviceName || 'Service'}</Text>
            <Text style={styles.petName}>{item.petName || 'Pet'}</Text>
            {date && (
              <Text style={styles.date}>
                {format(date, 'MMM dd, yyyy • hh:mm a')}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.bookingFooter}>
          <Text style={styles.price}>${item.amount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getServiceIcon = (serviceName) => {
    const icons = {
      Grooming: 'content-cut',
      Walking: 'directions-walk',
      Sitting: 'home',
      'Pop In': 'pets',
      Training: 'school',
      'Vet Visit': 'local-hospital',
      Boarding: 'hotel',
    };
    return icons[serviceName] || 'event';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="event-busy" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubtext}>
            Book a service for your pet to get started
          </Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('ServiceBooking')}
          >
            <Icon name="add" size={24} color="#fff" />
            <Text style={styles.bookButtonText}>Book Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={bookings}
            renderItem={renderBooking}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('ServiceBooking')}
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  petName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

