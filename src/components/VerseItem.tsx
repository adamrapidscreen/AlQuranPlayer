import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../constants/theme';

interface VerseItemProps {
  arabicText: string;
  translation: string;
  verseNumber: number;
}

export const VerseItem: React.FC<VerseItemProps> = React.memo(
  ({ arabicText, translation, verseNumber }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
      <View style={styles.container}>
        <View style={styles.verseNumberContainer}>
          <Text style={styles.verseNumber}>{verseNumber}</Text>
        </View>

        <Text style={styles.arabicText}>{arabicText}</Text>
        <Text style={styles.translation}>{translation}</Text>
      </View>
    );
  }
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: 40,
      alignItems: 'center',
    },
    verseNumberContainer: {
      borderWidth: 1.5,
      borderColor: colors.Primary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginBottom: 12,
      alignSelf: 'center',
    },
    verseNumber: {
      color: colors.Primary,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'Lato-Regular',
    },
    arabicText: {
      fontFamily: 'Amiri-Bold',
      fontSize: 28,
      textAlign: 'center',
      color: colors.TextPrimary,
      lineHeight: 60,
    },
    translation: {
      fontFamily: 'Lato-Regular',
      fontSize: 16,
      textAlign: 'center',
      color: colors.TextSecondary,
      marginTop: 10,
    },
  });

