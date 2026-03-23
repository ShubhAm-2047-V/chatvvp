import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { api } from '../../services/api';

// FIXED: Define InputField OUTSIDE the main component to prevent keyboard dismissal loop
const InputField = ({ label, value, onChangeText, placeholder, keyboardType, icon, secureTextEntry }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={18} color={THEME_COLORS.primary} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME_COLORS.textLight}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  </View>
);

export default function AddUserScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    year: '',
    subject: '',
  });

  const handleCreate = async () => {
    const { name, email, password, branch, year, subject } = formData;

    if (!name || !email || !password) {
      Alert.alert('Required Fields', 'Please enter Name, Email, and Password.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/create-user', {
        ...formData,
        year: year ? Number(year) : undefined,
        role,
      });

      Alert.alert('Success', `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper noSafeArea>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={THEME_COLORS.secondary} />
          </TouchableOpacity>

          <Text style={styles.title}>New Account</Text>
          <Text style={styles.subtitle}>Add a new member to the platform</Text>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleTab, role === 'student' && styles.activeTab]}
              onPress={() => setRole('student')}
              activeOpacity={0.9}
            >
              <Ionicons name="person" size={14} color={role === 'student' ? '#FFF' : THEME_COLORS.textLight} />
              <Text style={[styles.roleTabText, role === 'student' && styles.activeTabText]}>Student</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.roleTab, role === 'teacher' && styles.activeTab]}
              onPress={() => setRole('teacher')}
              activeOpacity={0.9}
            >
              <Ionicons name="school" size={14} color={role === 'teacher' ? '#FFF' : THEME_COLORS.textLight} />
              <Text style={[styles.roleTabText, role === 'teacher' && styles.activeTabText]}>Teacher</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleTab, role === 'admin' && styles.activeTab]}
              onPress={() => setRole('admin')}
              activeOpacity={0.9}
            >
              <Ionicons name="shield-checkmark" size={14} color={role === 'admin' ? '#FFF' : THEME_COLORS.textLight} />
              <Text style={[styles.roleTabText, role === 'admin' && styles.activeTabText]}>Admin</Text>
            </TouchableOpacity>
          </View>

          <BlurView intensity={70} tint="light" style={styles.formCard}>
            <InputField 
              label="Full Name" 
              icon="person-outline"
              value={formData.name} 
              onChangeText={(t: string) => setFormData({...formData, name: t})}
              placeholder="e.g. John Doe"
            />
            
            <InputField 
              label="Email Address"
              icon="mail-outline"
              value={formData.email} 
              onChangeText={(t: string) => setFormData({...formData, email: t})}
              placeholder="john@example.com"
              keyboardType="email-address"
            />

            <InputField 
              label="Initial Password"
              icon="lock-closed-outline"
              value={formData.password} 
              onChangeText={(t: string) => setFormData({...formData, password: t})}
              placeholder="Min 6 characters"
              secureTextEntry
            />

            {role === 'student' ? (
              <>
                <InputField 
                  label="Branch"
                  icon="business-outline"
                  value={formData.branch} 
                  onChangeText={(t: string) => setFormData({...formData, branch: t})}
                  placeholder="e.g. Computer Science"
                />
                <InputField 
                  label="Year"
                  icon="calendar-outline"
                  value={formData.year} 
                  onChangeText={(t: string) => setFormData({...formData, year: t})}
                  placeholder="e.g. 3"
                  keyboardType="numeric"
                />
              </>
            ) : role === 'teacher' ? (
              <InputField 
                label="Subject Specialized"
                icon="book-outline"
                value={formData.subject} 
                onChangeText={(t: string) => setFormData({...formData, subject: t})}
                placeholder="e.g. Advanced Calculus"
              />
            ) : null}

            <Button 
              title="CREATE ACCOUNT"
              onPress={handleCreate}
              loading={loading}
              icon={<Ionicons name="checkmark-circle" size={18} color="#FFF" />}
              style={styles.submitBtn}
            />
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 60
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: THEME_COLORS.border
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  subtitle: {
    fontSize: 14,
    color: THEME_COLORS.textLight,
    marginTop: 4,
    marginBottom: 32,
    fontWeight: '600'
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    padding: 6,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.card
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: THEME_COLORS.primary,
    borderWidth: 1,
    borderColor: '#000',
    ...PIXEL_SHADOWS.button
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME_COLORS.textLight,
  },
  activeTabText: {
    color: '#FFF',
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME_COLORS.textLight,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: THEME_COLORS.secondary,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 12,
  },
});
