import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function BookingDetailsScreen({ route }) {
  const { booking } = route.params;
  const date = booking.date?.toDate();

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

  const getServiceIcon = (serviceName) => {
    const icons = {
      Grooming: 'content-cut',
      Walking: 'directions-walk',
      Sitting: 'home',
      Training: 'school',
      'Vet Visit': 'local-hospital',
      Boarding: 'hotel',
    };
    return icons[serviceName] || 'event';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getStatusColor(booking.status) + '20' },
            ]}
          >
            <Icon
              name={getServiceIcon(booking.serviceName)}
              size={40}
              color={getStatusColor(booking.status)}
            />
          </View>
          <Text style={styles.serviceName}>{booking.serviceName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(booking.status) },
              ]}
            >
              {booking.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.infoRow}>
            <Icon name="pets" size={24} color="#4A90E2" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Pet</Text>
              <Text style={styles.infoValue}>{booking.petName}</Text>
            </View>
          </View>

          {date && (
            <>
              <View style={styles.infoRow}>
                <Icon name="calendar-today" size={24} color="#4A90E2" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>
                    {format(date, 'MMMM dd, yyyy')}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="access-time" size={24} color="#4A90E2" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Time</Text>
                  <Text style={styles.infoValue}>
                    {format(date, 'hh:mm a')}
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.infoRow}>
            <Icon name="attach-money" size={24} color="#4A90E2" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>${booking.amount}</Text>
            </View>
          </View>
        </View>

        {booking.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{booking.notes}</Text>
          </View>
        )}
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
  header: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  notes: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});


