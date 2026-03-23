import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import Button from '../../components/Button';
import { api } from '../../services/api';

export default function UploadNoteScreen({ navigation }: any) {
  const [subject, setSubject] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [topic, setTopic] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!subject || !branch || !year || !topic || !image) {
      Alert.alert('Missing Fields', 'Please fill all fields and select an image.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
      uri: image,
      name: 'note.jpg',
      type: 'image/jpeg',
    });
    formData.append('subject', subject);
    formData.append('branch', branch);
    formData.append('year', year);
    formData.append('topic', topic);
    if (youtubeUrl) formData.append('youtubeUrl', youtubeUrl);

    try {
      const response = await api.post('/teacher/upload-note', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Note uploaded and processed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Check your connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.headerWrapper}>
        <BlurView intensity={80} tint="light" style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={THEME_COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Upload Note</Text>
          <View style={{ width: 40 }} />
        </BlurView>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Fill in details for OCR extraction</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Mathematics" 
                placeholderTextColor={THEME_COLORS.textLight}
                value={subject} 
                onChangeText={setSubject} 
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Branch</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. CSE" 
                  placeholderTextColor={THEME_COLORS.textLight}
                  value={branch} 
                  onChangeText={setBranch} 
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Year</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="1-4" 
                  placeholderTextColor={THEME_COLORS.textLight}
                  keyboardType="numeric"
                  value={year} 
                  onChangeText={setYear} 
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Topic / Chapter</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Calculus" 
                placeholderTextColor={THEME_COLORS.textLight}
                value={topic} 
                onChangeText={setTopic} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>YouTube Video Link (Optional)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="https://youtube.com/..." 
                placeholderTextColor={THEME_COLORS.textLight}
                value={youtubeUrl} 
                onChangeText={setYoutubeUrl} 
              />
            </View>

            <Text style={styles.label}>Attachment (Handwritten/Printed Note)</Text>
            <View style={styles.imagePickerContainer}>
              {image ? (
                <View style={styles.previewWrapper}>
                  <Image source={{ uri: image }} style={styles.preview} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
                    <Ionicons name="close-circle" size={28} color="#f43f5e" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pickerButtons}>
                  <TouchableOpacity style={styles.pickerBtn} onPress={takePhoto}>
                    <View style={styles.iconBg}>
                      <Ionicons name="camera" size={28} color={THEME_COLORS.primary} />
                    </View>
                    <Text style={styles.pickerText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerBtn} onPress={pickImage}>
                    <View style={styles.iconBg}>
                      <Ionicons name="images" size={28} color={THEME_COLORS.primary} />
                    </View>
                    <Text style={styles.pickerText}>Choose File</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Button 
              title="EXTRACT & PUBLISH" 
              type="primary"
              onPress={handleUpload}
              loading={uploading}
              icon={<Ionicons name="rocket-outline" size={18} color="#FFF" />}
              style={styles.uploadBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: 2,
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.card,
    zIndex: 10,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.border
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  subtitle: {
    fontSize: 12,
    color: THEME_COLORS.textLight,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME_COLORS.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1.5,
    borderColor: THEME_COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: THEME_COLORS.secondary,
    fontWeight: '500'
  },
  imagePickerContainer: {
    height: 200,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  pickerButtons: {
    flexDirection: 'row',
    gap: 40,
  },
  pickerBtn: {
    alignItems: 'center',
  },
  iconBg: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
    ...PIXEL_SHADOWS.card
  },
  pickerText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME_COLORS.primary,
    textTransform: 'uppercase'
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 2,
    ...PIXEL_SHADOWS.card
  },
  uploadBtn: {
    marginTop: 10,
  },
});
