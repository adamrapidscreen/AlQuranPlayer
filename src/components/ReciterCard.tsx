import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { KiswahTheme } from '../constants/theme';

interface ReciterCardProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

export const ReciterCard: React.FC<ReciterCardProps> = React.memo(({
  name,
  isSelected,
  onPress,
}) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.cardContainer, isSelected && styles.cardSelected]}
    >
      <BlurView intensity={80} tint="dark" style={styles.blurView}>
        <Text style={styles.cardText}>{name}</Text>
      </BlurView>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: KiswahTheme.Primary,
  },
  blurView: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: KiswahTheme.GlassTint,
  },
  cardText: {
    color: KiswahTheme.TextPrimary,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
});

