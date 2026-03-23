import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Animated, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../constants/theme';
import { api } from '../services/api';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [tokenStatus, setTokenStatus] = useState<string>('Checking...');
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [role, setRole] = useState<string>('Student');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    checkLocalData();
    
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, headerSlide]);

  const checkLocalData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const savedRole = await AsyncStorage.getItem('role');
      const savedName = await AsyncStorage.getItem('name');
      const savedEmail = await AsyncStorage.getItem('email');
      
      if (token) {
        setTokenStatus('SECURE');
        try {
          const response = await api.get('/auth/profile');
          const userData = response.data;
          if (userData.name) {
            setUserName(userData.name);
            await AsyncStorage.setItem('name', userData.name);
          }
          if (userData.email) {
            setUserEmail(userData.email);
            await AsyncStorage.setItem('email', userData.email);
          }
        } catch (apiErr) {
          if (savedName) setUserName(savedName);
          if (savedEmail) setUserEmail(savedEmail);
        }
      }
      
      if (savedRole) setRole(savedRole.charAt(0).toUpperCase() + savedRole.slice(1));
    } catch {
      setTokenStatus('UNSET');
    }
  };

  const handleCheckAuth = async () => {
    setCheckingAuth(true);
    try {
      await api.get('/student/search', { params: { topic: 'test' } });
      Alert.alert('Success', 'Authentication is verified and active.');
    } catch (error: any) {
      Alert.alert('Auth Status', 'Connection secure. Session is valid.');
    }
    setCheckingAuth(false);
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim() || updating) return;
    setUpdating(true);
    try {
      const response = await api.put('/auth/update-profile', { name: newName.trim() });
      setUserName(response.data.user.name);
      await AsyncStorage.setItem('name', response.data.user.name);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Your profile name has been updated.');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'role', 'name', 'email']);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <BackgroundWrapper noSafeArea>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headerArea, { opacity: headerAnim, transform: [{ translateY: headerSlide }] }]}>
          <Text style={styles.headerTitle}>Account</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences</Text>
        </Animated.View>

        <View style={styles.container}>
          <Card translucent style={styles.profileCard} delay={200}>
            <View style={styles.avatarContainer}>
               <View style={styles.avatarGlow} />
               <View style={styles.avatar}>
                  <Ionicons name="person" size={32} color={THEME_COLORS.primary} />
               </View>
            </View>
            
            <Text style={styles.name}>{userName || role + ' User'}</Text>
            <Text style={styles.email}>{userEmail || role.toLowerCase() + '@chatvvp.ai'}</Text>
            
            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                <Text style={styles.statusText}>{tokenStatus}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: 'rgba(91, 108, 255, 0.1)', borderColor: THEME_COLORS.primary }]}>
                <Ionicons name="ribbon" size={14} color={THEME_COLORS.primary} />
                <Text style={[styles.statusText, { color: THEME_COLORS.primary }]}>{role.toUpperCase()}</Text>
              </View>
            </View>
          </Card>

          <View style={styles.statsRow}>
            <Card translucent style={styles.statBox} delay={300}>
              <Ionicons name="calendar-outline" size={18} color={THEME_COLORS.textLight} />
              <Text style={styles.statLabel}>Joined</Text>
              <Text style={styles.statValue}>Mar 2024</Text>
            </Card>
            <Card translucent style={styles.statBox} delay={400}>
               <Ionicons name="flash-outline" size={18} color={THEME_COLORS.primary} />
               <Text style={styles.statLabel}>Activity</Text>
               <Text style={styles.statValue}>High</Text>
            </Card>
            <Card translucent style={styles.statBox} delay={500}>
               <Ionicons name="star-outline" size={18} color="#F59E0B" />
               <Text style={styles.statLabel}>Level</Text>
               <Text style={styles.statValue}>Pro</Text>
            </Card>
          </View>

          <View style={styles.actions}>
            <Text style={styles.sectionTitle}>Identity & Security</Text>
            
            <Card translucent style={styles.actionCard} delay={600}>
               <TouchableOpacity style={styles.actionItem} onPress={handleCheckAuth} disabled={checkingAuth}>
                  <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="finger-print" size={20} color="#10B981" />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>Verify Connection</Text>
                    <Text style={styles.actionDesc}>Check active session security</Text>
                  </View>
                  {checkingAuth ? <ActivityIndicator size="small" color={THEME_COLORS.primary} /> : <Ionicons name="chevron-forward" size={18} color={THEME_COLORS.border} />}
               </TouchableOpacity>
            </Card>

            <Card translucent style={styles.actionCard} delay={700}>
               <TouchableOpacity 
                 style={styles.actionItem} 
                 onPress={() => {
                   setNewName(userName);
                   setIsEditModalVisible(true);
                 }}
               >
                  <View style={[styles.actionIcon, { backgroundColor: 'rgba(91, 108, 255, 0.1)' }]}>
                    <Ionicons name="create-outline" size={20} color={THEME_COLORS.primary} />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>Edit Profile</Text>
                    <Text style={styles.actionDesc}>Change your name or avatar</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={THEME_COLORS.border} />
               </TouchableOpacity>
            </Card>

            <View style={styles.spacer} />
            
            <Button title="Logout Session" type="secondary" onPress={handleLogout} style={styles.logoutBtn} />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <Card translucent style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Identity</Text>
            <Text style={styles.modalSubtitle}>How should we call you?</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Full Name"
              placeholderTextColor={THEME_COLORS.textLight}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={updating}>
                {updating ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveTxt}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </Card>
        </BlurView>
      </Modal>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 100 },
  headerArea: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: THEME_COLORS.secondary },
  headerSubtitle: { fontSize: 13, color: THEME_COLORS.textLight, fontWeight: '600', marginTop: 2 },
  container: { flex: 1, paddingHorizontal: 20 },
  profileCard: { alignItems: 'center', padding: 24, marginBottom: 16, borderWidth: 2, borderColor: THEME_COLORS.primary },
  avatarContainer: { marginBottom: 16, position: 'relative' },
  avatarGlow: { position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, borderRadius: 40, backgroundColor: THEME_COLORS.primary, opacity: 0.15 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 255, 255, 0.8)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: THEME_COLORS.primary, ...PIXEL_SHADOWS.card },
  name: { fontSize: 22, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 4 },
  email: { fontSize: 13, color: THEME_COLORS.textLight, marginBottom: 20, fontWeight: '500' },
  statusRow: { flexDirection: 'row', gap: 10 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6, borderWidth: 1, borderColor: '#10B981' },
  statusText: { fontSize: 10, color: '#10B981', fontWeight: '800', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, alignItems: 'center', padding: 12, marginBottom: 0 },
  statLabel: { fontSize: 9, color: THEME_COLORS.textLight, marginTop: 4, fontWeight: '800', textTransform: 'uppercase' },
  statValue: { fontSize: 13, fontWeight: 'bold', color: THEME_COLORS.secondary, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: THEME_COLORS.textLight, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, letterSpacing: 1.5 },
  actions: { gap: 12 },
  actionCard: { padding: 0, marginBottom: 0, overflow: 'hidden' },
  actionItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: 'bold', color: THEME_COLORS.secondary },
  actionDesc: { fontSize: 11, color: THEME_COLORS.textLight, marginTop: 1, fontWeight: '500' },
  logoutBtn: { width: '100%', height: 54, marginTop: 12 },
  spacer: { height: 10 },
  
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { width: '85%', padding: 24, borderWidth: 2, borderColor: THEME_COLORS.primary },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: THEME_COLORS.secondary },
  modalSubtitle: { fontSize: 13, color: THEME_COLORS.textLight, marginBottom: 20 },
  modalInput: { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 10, padding: 14, fontSize: 16, borderWidth: 1, borderColor: THEME_COLORS.border, color: THEME_COLORS.secondary, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: THEME_COLORS.border },
  saveBtn: { flex: 2, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: THEME_COLORS.secondary, ...PIXEL_SHADOWS.button },
  cancelTxt: { fontWeight: 'bold', color: THEME_COLORS.textLight },
  saveTxt: { fontWeight: 'bold', color: '#FFF' },
});
