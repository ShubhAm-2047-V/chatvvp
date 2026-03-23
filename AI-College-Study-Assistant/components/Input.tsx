import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
}

export default function Input({ icon, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <TextInput
        style={[styles.input, icon && styles.inputWithIcon, style]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputWithIcon: {
    paddingLeft: 4,
  },
});
