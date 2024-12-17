import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Import for tab icons
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import CameraScreen from './screens/CameraScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // Hide the header if you prefer
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home', // Tab label
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ), // Tab icon
          }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarLabel: 'Map', // Tab label
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ), // Tab icon
          }}
        />
        <Tab.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            tabBarLabel: 'Camera', // Tab label
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera" size={size} color={color} />
            ), // Tab icon
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
