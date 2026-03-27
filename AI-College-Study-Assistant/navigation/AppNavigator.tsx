import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import LoginScreen from '../screens/LoginScreen';

// Student Screens
import StudentHistoryScreen from '../screens/student/StudentHistoryScreen';
import StudentAIScreen from '../screens/student/StudentAIScreen';
import StudentNotesScreen from '../screens/student/StudentNotesScreen';
import QuizListScreen from '../screens/QuizListScreen';
import QuizDetailScreen from '../screens/QuizDetailScreen';

// Teacher Screens
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import UploadNoteScreen from '../screens/teacher/UploadNoteScreen';
import TeacherLibraryScreen from '../screens/teacher/TeacherLibraryScreen';
import TeacherPersonalNotes from '../screens/teacher/TeacherPersonalNotes';
import TeacherAIScreen from '../screens/teacher/TeacherAIScreen';
import LoadingScreen from '../screens/LoadingScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManagement from '../screens/admin/UserManagement';
import AddUserScreen from '../screens/admin/AddUserScreen';

import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { THEME_COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const commonTabOptions = {
  tabBarStyle: { 
    position: 'absolute' as const, 
    borderTopWidth: 0, 
    elevation: 0, 
    height: 65, 
    paddingBottom: 10,
    backgroundColor: 'transparent'
  },
  tabBarBackground: () => (
    <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
  ),
  tabBarActiveTintColor: THEME_COLORS.primary,
  tabBarInactiveTintColor: THEME_COLORS.textLight,
  headerShown: false,
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...commonTabOptions,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'AI') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Notes') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Practice') iconName = focused ? 'school' : 'school-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="History" component={StudentHistoryScreen} />
      <Tab.Screen name="AI" component={StudentAIScreen} />
      <Tab.Screen name="Notes" component={StudentNotesScreen} />
      <Tab.Screen name="Practice" component={QuizListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...commonTabOptions,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid';
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Users" component={UserManagement} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function TeacherTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...commonTabOptions,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid';
          if (route.name === 'My Notes') iconName = focused ? 'create' : 'create-outline';
          else if (route.name === 'AI') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Upload Notes') iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="My Notes" component={TeacherPersonalNotes} />
      <Tab.Screen name="AI" component={TeacherAIScreen} />
      <Tab.Screen name="Upload Notes" component={TeacherLibraryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RoleNavigator() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      setRole(storedRole);
      setLoading(false);
    };
    fetchRole();
  }, []);

  if (loading) return <LoadingScreen />;

  if (role === 'admin') return <AdminTabs />;
  if (role === 'teacher') return <TeacherTabs />;
  return <MainTabs />;
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={RoleNavigator} />
      <Stack.Screen name="UploadNote" component={UploadNoteScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Library" component={TeacherLibraryScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />
    </Stack.Navigator>
  );
}
