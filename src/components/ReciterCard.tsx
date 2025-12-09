import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../constants/theme';

interface ReciterCardProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

export const ReciterCard: React.FC<ReciterCardProps> = React.memo(
  ({ name, isSelected, onPress }) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

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
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurView}>
          <Text style={styles.cardText}>{name}</Text>
        </BlurView>
      </TouchableOpacity>
    );
  }
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardContainer: {
      marginVertical: 8,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    cardSelected: {
      borderColor: colors.Primary,
    },
    blurView: {
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.GlassTint,
    },
    cardText: {
      color: colors.TextPrimary,
      fontSize: 18,
      textAlign: 'center',
      fontFamily: 'Lato-Regular',
    },
  });

