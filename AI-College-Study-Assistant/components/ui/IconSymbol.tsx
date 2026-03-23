import { Ionicons } from '@expo/vector-icons';
import React from 'react';

// Maps SF Symbols to Ionicons
const mapping: Record<string, keyof typeof Ionicons.glyphMap> = {
  'house.fill': 'home',
  'message.fill': 'chatbubble',
  'book.fill': 'book',
  'chart.bar.fill': 'bar-chart',
  'person.fill': 'person',
  'paperplane.fill': 'send',
  'chevron.right': 'chevron-forward',
  'plus': 'add',
  'function': 'calculator',
  'book': 'book-outline',
  'desktopcomputer': 'desktop',
  'person.crop.circle': 'person-circle-outline',
  'bell': 'notifications-outline',
  'gear': 'settings-outline',
  'questionmark.circle': 'help-circle-outline',
  'doc.text': 'document-text-outline',
};

export function IconSymbol({ name, size = 24, color }: { name: string; size?: number; color: string }) {
  const ioniconName = mapping[name] || 'help-circle';
  return <Ionicons name={ioniconName} size={size} color={color} />;
}
