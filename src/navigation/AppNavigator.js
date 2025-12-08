import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import PetsScreen from '../screens/pets/PetsScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddPetScreen from '../screens/pets/AddPetScreen';
import EditPetScreen from '../screens/pets/EditPetScreen';
import ServiceBookingScreen from '../screens/bookings/ServiceBookingScreen';
import PaymentScreen from '../screens/payments/PaymentScreen';
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PetsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PetsList" 
        component={PetsScreen}
        options={{ title: 'My Pets' }}
      />
      <Stack.Screen 
        name="AddPet" 
        component={AddPetScreen}
        options={{ title: 'Add Pet' }}
      />
      <Stack.Screen 
        name="EditPet" 
        component={EditPetScreen}
        options={{ title: 'Edit Pet' }}
      />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BookingsList" 
        component={BookingsScreen}
        options={{ title: 'My Bookings' }}
      />
      <Stack.Screen 
        name="ServiceBooking" 
        component={ServiceBookingScreen}
        options={{ title: 'Book Service' }}
      />
      <Stack.Screen 
        name="BookingDetails" 
        component={BookingDetailsScreen}
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Pets') {
            iconName = 'pets';
          } else if (route.name === 'Bookings') {
            iconName = 'event';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Pets" component={PetsStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


