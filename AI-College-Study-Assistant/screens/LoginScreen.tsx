import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { Logo } from '../components/Logo';

const { width } = Dimensions.get('window');

// Path to the retro sky image generated earlier
const SKY_BG = require('../assets/images/retro-sky.png');

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  // Animated values for press effect
  const loginScale = new Animated.Value(1);

  const handlePressIn = (val: Animated.Value) => {
    Animated.spring(val, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = (val: Animated.Value) => {
    Animated.spring(val, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      const role = response.data.user.role; // Get role from backend response

      if (!token) {
        throw new Error('No token received');
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('name', response.data.user.name || '');
      await AsyncStorage.setItem('email', response.data.user.email || '');
      if (response.data.user.branch) await AsyncStorage.setItem('branch', response.data.user.branch);
      if (response.data.user.year) await AsyncStorage.setItem('year', String(response.data.user.year));
      
      navigation.replace('Main');
    } catch (error: any) {
      console.log('Login error:', error);
      const msg = error.response?.data?.message || 'Login failed. Check your connection.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={SKY_BG} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.innerContainer}>
            {/* Glassmorphism Card with Pixel Edges */}
            <View style={styles.cardContainer}>
              <BlurView intensity={50} tint="light" style={styles.blurCard}>
                <View style={StyleSheet.absoluteFill}>
                  <View style={styles.watermarkContainer}>
                    <Text style={styles.watermarkText}>CHAT. VVP</Text>
                  </View>
                </View>

                <View style={styles.header}>
                  <Text style={styles.headerTitle}>CHAT. VVP</Text>
                </View>
                <View style={styles.form}>
                  {/* Email Input */}
                  <View style={styles.inputArea}>
                    <View style={[styles.inputWrapper, emailFocus && styles.inputFocus]}>
                      <Ionicons name="mail" size={18} color={emailFocus ? "#5b6cff" : "#9CA3AF"} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputArea}>
                    <View style={[styles.inputWrapper, passFocus && styles.inputFocus]}>
                      <Ionicons name="lock-closed" size={18} color={passFocus ? "#5b6cff" : "#9CA3AF"} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setPassFocus(true)}
                        onBlur={() => setPassFocus(false)}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.buttonContainer}>
                    <Animated.View style={{ transform: [{ scale: loginScale }] }}>
                      <TouchableOpacity
                        activeOpacity={1}
                        onPressIn={() => handlePressIn(loginScale)}
                        onPressOut={() => handlePressOut(loginScale)}
                        onPress={handleLogin}
                        disabled={loading}
                        style={[styles.btn, styles.loginBtn]}
                      >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Login</Text>}
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  cardContainer: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#5b6cff',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
    // Pixel-style Hard Shadow
    shadowColor: '#5b6cff',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 8,
  },
  blurCard: {
    padding: 24,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputArea: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    height: 54,
    paddingHorizontal: 16,
  },
  inputFocus: {
    borderColor: '#5b6cff',
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  buttonContainer: {
    marginTop: 10,
  },
  btn: {
    height: 52,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    // Offset shadow for 3D look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  loginBtn: {
    backgroundColor: '#0f172a',
  },
  startBtn: {
    backgroundColor: '#1e293b',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.15, // Increased opacity as requested
  },
  watermarkText: {
    fontSize: 100, // Slightly larger
    fontWeight: '900',
    color: '#5b6cff', // Colorful (Primary Blue)
    textAlign: 'center',
    transform: [{ rotate: '-15deg' }],
  },
});
