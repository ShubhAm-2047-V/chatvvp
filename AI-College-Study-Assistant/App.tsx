import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  useEffect(() => {
    const checkAsyncStorage = async () => {
      try {
        // Ensure AsyncStorage works properly
        await AsyncStorage.setItem("test", "123");
        const value = await AsyncStorage.getItem("test");
        console.log("AsyncStorage Initialized Successfully. Test Value:", value);
      } catch (error) {
        console.error("AsyncStorage Initialization Error:", error);
      }
    };
    
    checkAsyncStorage();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
