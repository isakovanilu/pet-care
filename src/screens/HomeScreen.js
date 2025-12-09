import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createDocument, Timestamp } from '../utils/firebaseHelpers';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const SERVICES = [
  { id: 4, name: 'Pop In', price: 25, icon: 'pets', color: '#E987A7' },
  { id: 2, name: 'Walking', price: 25, icon: 'directions-walk', color: '#4ECDC4' },
  { id: 3, name: 'Sitting', price: 75, icon: 'home', color: '#95E1D3' },
  { id: 1, name: 'Grooming', price: 50, icon: 'content-cut', color: '#FF6B6B' },
];

export default function HomeScreen({ navigation }) {
  const { theme, toggleTheme } = useTheme();
  const [selectedServices, setSelectedServices] = useState([]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [address, setAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [telephoneError, setTelephoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const isDarkMode = theme.mode === 'dark';

  // Predefined addresses (can be expanded)
  const addressOptions = [
    '123 Main Street, New York, NY 10001',
    '456 Park Avenue, New York, NY 10002',
    '789 Broadway, New York, NY 10003',
    '321 5th Avenue, New York, NY 10004',
    '654 Lexington Avenue, New York, NY 10005',
    '987 Madison Avenue, New York, NY 10006',
    '111 Central Park West, New York, NY 10023',
    '222 Columbus Avenue, New York, NY 10024',
    '333 Amsterdam Avenue, New York, NY 10025',
    '444 Riverside Drive, New York, NY 10027',
  ];

  // Filter addresses based on user input
  const getFilteredAddresses = () => {
    if (!address || address.trim().length === 0) {
      return addressOptions; // Show all when empty
    }
    return addressOptions.filter(addr =>
      addr.toLowerCase().includes(address.toLowerCase())
    );
  };

  const filteredAddresses = getFilteredAddresses();

  // Phone number formatting and validation
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length === 0) {
      setTelephoneError('');
      return false;
    }
    if (phoneDigits.length < 10) {
      setTelephoneError('Phone number must be at least 10 digits');
      return false;
    }
    if (phoneDigits.length > 10) {
      setTelephoneError('Phone number must be 10 digits');
      return false;
    }
    setTelephoneError('');
    return true;
  };

  const handleTelephoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setTelephone(formatted);
    validatePhoneNumber(formatted);
  };

  const handleAddressSelect = (selectedAddress) => {
    setAddress(selectedAddress);
    setShowAddressDropdown(false);
  };

  // Toggle service selection (multi-select)
  const toggleService = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isPastDate = (dayDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dayDate < today;
  };

  const handleCalendarDateSelect = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isPastDate(selectedDate)) {
      setDate(selectedDate);
      setShowCalendar(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  // Format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time for HTML input (HH:MM)
  const formatTimeForInput = (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle date input change (for web) - accepts YYYY-MM-DD format
  const handleDateInputChange = (text) => {
    // Try to parse as date
    if (text.length === 10 && text.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const newDate = new Date(text + 'T00:00:00');
      if (!isNaN(newDate.getTime()) && newDate >= new Date().setHours(0, 0, 0, 0)) {
        setDate(newDate);
      }
    }
  };

  // Handle time input change (for web) - accepts HH:MM format
  const handleTimeInputChange = (text) => {
    if (text.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = text.split(':').map(Number);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const newTime = new Date();
        newTime.setHours(hours, minutes, 0, 0);
        setTime(newTime);
      }
    }
  };

  // Generate time slots (every 30 minutes from 8 AM to 8 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotSelect = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newTime = new Date();
    newTime.setHours(hours, minutes, 0, 0);
    setTime(newTime);
    setShowTimeSelector(false);
  };

  const handleSave = () => {
    
    if (selectedServices.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Please select at least one service');
      } else {
        Alert.alert('Error', 'Please select at least one service');
      }
      return;
    }

    if (!address.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter an address');
      } else {
        Alert.alert('Error', 'Please enter an address');
      }
      return;
    }

    if (!telephone.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a telephone number');
      } else {
        Alert.alert('Error', 'Please enter a telephone number');
      }
      return;
    }

    // Validate phone number format
    const phoneDigits = telephone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a valid 10-digit phone number');
      } else {
        Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      }
      setTelephoneError('Phone number must be 10 digits');
      return;
    }

    if (!email.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter an email address');
      } else {
        Alert.alert('Error', 'Please enter an email address');
      }
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a valid email address');
      } else {
        Alert.alert('Error', 'Please enter a valid email address');
      }
      return;
    }

    setLoading(true);
    
    try {
      const bookingDate = new Date(date);
      bookingDate.setHours(time.getHours());
      bookingDate.setMinutes(time.getMinutes());

      const totalAmount = selectedServices.reduce((sum, service) => sum + service.price, 0);
      const serviceNames = selectedServices.map(s => s.name).join(', ');
      const serviceIds = selectedServices.map(s => s.id);

      const bookingData = {
        id: `booking_${Date.now()}`,
        services: selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price })),
        serviceNames,
        serviceIds,
        amount: totalAmount,
        date: bookingDate.toISOString(),
        dateFormatted: format(bookingDate, 'MMMM dd, yyyy hh:mm a'),
        address: address.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save booking to localStorage
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Save to localStorage
        let existingBookings = [];
        try {
          const stored = window.localStorage.getItem('bookings');
          if (stored) {
            existingBookings = JSON.parse(stored);
          }
        } catch (parseError) {
          console.warn('Error parsing existing bookings:', parseError);
          existingBookings = [];
        }
        
        existingBookings.push(bookingData);
        
        try {
          window.localStorage.setItem('bookings', JSON.stringify(existingBookings));
        } catch (storageError) {
          console.error('localStorage error:', storageError);
          setLoading(false);
          window.alert('Failed to save booking: ' + storageError.message);
          return;
        }
        
        setLoading(false);
        window.alert('Booking sent successfully!');
        
        // Reset form
        setSelectedServices([]);
        setDate(new Date());
        setTime(new Date());
        setAddress('');
        setTelephone('');
        setEmail('');
        
      } else {
        // For mobile
        setLoading(false);
        Alert.alert('Info', 'This feature is only available on web. Please use a web browser.');
      }
    } catch (error) {
      console.error('❌ Error saving booking:', error);
      console.error('Error details:', error.message, error.stack);
      setLoading(false);
      if (Platform.OS === 'web') {
        window.alert('Error saving booking: ' + (error.message || 'Unknown error'));
      } else {
        Alert.alert('Error', `Failed to save booking: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Book a Service</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.themeButton}
            onPress={() => toggleTheme(isDarkMode ? 'light' : 'dark')}
          >
            <Icon name={isDarkMode ? "brightness-7" : "brightness-2"} size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Icon name="account-circle" size={32} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Service Selection - Multi-select */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Select Services {selectedServices.length > 0 && `(${selectedServices.length} selected)`}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {SERVICES.map((service) => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    {
                      backgroundColor: isSelected 
                        ? service.color 
                        : theme.colors.card,
                      borderColor: isSelected 
                        ? service.color 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => toggleService(service)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Icon name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                  <Icon 
                    name={service.icon} 
                    size={28} 
                    color={isSelected ? '#FFFFFF' : service.color} 
                  />
                  <Text
                    style={[
                      styles.serviceName,
                      {
                        color: isSelected 
                          ? '#FFFFFF' 
                          : theme.colors.text,
                      }
                    ]}
                  >
                    {service.name}
                  </Text>
                  <Text
                    style={[
                      styles.servicePrice,
                      {
                        color: isSelected 
                          ? '#FFFFFF' 
                          : theme.colors.textSecondary,
                      }
                    ]}
                  >
                    ${service.price}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Date Selection with Calendar */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Date</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateTimeInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Icon name="calendar-today" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateTimeText, { color: theme.colors.text }]}>
              {format(date, 'MMMM dd, yyyy')}
            </Text>
            <Icon name={showCalendar ? "expand-less" : "expand-more"} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          {showCalendar && (
            <View style={[styles.calendarContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => navigateMonth(-1)}>
                  <Icon name="chevron-left" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.calendarMonth, { color: theme.colors.text }]}>
                  {format(currentMonth, 'MMMM yyyy')}
                </Text>
                <TouchableOpacity onPress={() => navigateMonth(1)}>
                  <Icon name="chevron-right" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Calendar Days Header */}
              <View style={styles.calendarDaysHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={[styles.calendarDayHeader, { color: theme.colors.textSecondary }]}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.calendarDay} />
                ))}
                {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1).map((day) => {
                  const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isSelected = isSameDay(dayDate, date);
                  const isPast = isPastDate(dayDate);
                  
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDay,
                        isSelected && { backgroundColor: theme.colors.primary },
                        isPast && styles.calendarDayDisabled
                      ]}
                      onPress={() => handleCalendarDateSelect(day)}
                      disabled={isPast}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          { color: isPast ? theme.colors.placeholder : theme.colors.text },
                          isSelected && { color: '#FFFFFF', fontWeight: '700' }
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Fallback to native picker on mobile */}
          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Time Selection with Selectable Time Slots */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Time</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateTimeInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setShowTimeSelector(!showTimeSelector)}
          >
            <Icon name="access-time" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateTimeText, { color: theme.colors.text }]}>
              {format(time, 'hh:mm a')}
            </Text>
            <Icon name={showTimeSelector ? "expand-less" : "expand-more"} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {showTimeSelector && (
            <View style={[styles.timeSelectorContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <ScrollView style={styles.timeSelectorScroll} nestedScrollEnabled>
                <View style={styles.timeSlotsGrid}>
                  {timeSlots.map((timeSlot) => {
                    const [hours, minutes] = timeSlot.split(':').map(Number);
                    const slotTime = new Date();
                    slotTime.setHours(hours, minutes, 0, 0);
                    const isSelected = time.getHours() === hours && time.getMinutes() === minutes;
                    
                    return (
                      <TouchableOpacity
                        key={timeSlot}
                        style={[
                          styles.timeSlot,
                          {
                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          }
                        ]}
                        onPress={() => handleTimeSlotSelect(timeSlot)}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            {
                              color: isSelected ? '#FFFFFF' : theme.colors.text,
                              fontWeight: isSelected ? '600' : '400',
                            }
                          ]}
                        >
                          {format(slotTime, 'hh:mm a')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Fallback to native picker on mobile */}
          {Platform.OS !== 'web' && showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Address with Dropdown and Manual Entry */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Address</Text>
          <View style={{ position: 'relative' }}>
            <View style={[styles.input, styles.dateTimeInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Icon name="location-on" size={20} color={theme.colors.primary} />
              <TextInput
                style={[styles.addressInput, { color: theme.colors.text }]}
                placeholder="Enter or select an address"
                placeholderTextColor={theme.colors.placeholder}
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  // Show dropdown if there are matching addresses or if field is empty (show all)
                  const filtered = text.trim().length === 0 
                    ? addressOptions 
                    : addressOptions.filter(addr => addr.toLowerCase().includes(text.toLowerCase()));
                  setShowAddressDropdown(filtered.length > 0);
                }}
                onFocus={() => {
                  // Show all addresses when focused
                  setShowAddressDropdown(true);
                }}
                onBlur={() => {
                  // Delay closing to allow dropdown selection
                  setTimeout(() => setShowAddressDropdown(false), 300);
                }}
                multiline
                numberOfLines={2}
              />
              {address && (
                <TouchableOpacity onPress={() => setShowAddressDropdown(!showAddressDropdown)}>
                  <Icon name={showAddressDropdown ? "expand-less" : "expand-more"} size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {showAddressDropdown && (
              <View style={[styles.addressDropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <ScrollView style={styles.addressDropdownScroll} nestedScrollEnabled>
                  {filteredAddresses.length > 0 ? (
                    filteredAddresses.map((addr, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.addressOption,
                          {
                            backgroundColor: address === addr ? theme.colors.primary + '20' : 'transparent',
                            borderBottomColor: theme.colors.border,
                          }
                        ]}
                        onPress={() => handleAddressSelect(addr)}
                      >
                        <Icon 
                          name="location-on" 
                          size={18} 
                          color={address === addr ? theme.colors.primary : theme.colors.textSecondary} 
                        />
                        <Text
                          style={[
                            styles.addressOptionText,
                            {
                              color: address === addr ? theme.colors.primary : theme.colors.text,
                              fontWeight: address === addr ? '600' : '400',
                            }
                          ]}
                        >
                          {addr}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.addressOption}>
                      <Text style={[styles.addressOptionText, { color: theme.colors.textSecondary }]}>
                        No matching addresses found
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Telephone with Verification */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Telephone</Text>
          <View style={[
            styles.input, 
            styles.dateTimeInput,
            { 
              backgroundColor: theme.colors.card, 
              borderColor: telephoneError ? theme.colors.error : theme.colors.border 
            }
          ]}>
            <Icon name="phone" size={20} color={theme.colors.primary} />
            <TextInput
              style={[styles.telephoneInput, { color: theme.colors.text }]}
              placeholder="(XXX) XXX-XXXX"
              placeholderTextColor={theme.colors.placeholder}
              value={telephone}
              onChangeText={handleTelephoneChange}
              keyboardType="phone-pad"
              maxLength={14} // (XXX) XXX-XXXX
            />
            {telephone.replace(/\D/g, '').length === 10 && (
              <Icon name="check-circle" size={20} color={theme.colors.success} />
            )}
          </View>
          {telephoneError ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{telephoneError}</Text>
          ) : telephone.replace(/\D/g, '').length === 10 ? (
            <Text style={[styles.successText, { color: theme.colors.success }]}>✓ Valid phone number</Text>
          ) : null}
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Booking'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    width: 140,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 320,
    alignSelf: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarMonth: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 2,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '400',
  },
  timeSelectorContainer: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  timeSelectorScroll: {
    maxHeight: 180,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
  },
  addressDropdown: {
    marginTop: 12,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  addressDropdownScroll: {
    maxHeight: 180,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  addressOptionText: {
    flex: 1,
    fontSize: 14,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    minHeight: 20,
  },
  telephoneInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 50,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
