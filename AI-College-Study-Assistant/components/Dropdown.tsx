import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

export default function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={() => setVisible(true)}>
        <Text style={[styles.text, !value && styles.placeholder]} numberOfLines={1}>
          {value || label}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#6B7280" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, value === item && styles.selectedOptionText]}>
                    {item}
                  </Text>
                  {value === item && <Ionicons name="checkmark" size={20} color="#4F46E5" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  text: { fontSize: 16, color: '#1F2937', flex: 1, marginRight: 8 },
  placeholder: { color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: Dimensions.get('window').height * 0.6 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  optionText: { fontSize: 16, color: '#374151' },
  selectedOptionText: { color: '#4F46E5', fontWeight: 'bold' }
});
