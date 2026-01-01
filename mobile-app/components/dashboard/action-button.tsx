import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ActionButtonProps {
  label: string;
  icon: 'barcode' | 'location.pin' | 'checklist';
  color: string;
  onPress: () => void;
}

export function ActionButton({ label, icon, color, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <IconSymbol name={icon} size={28} color="#FFFFFF" />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
