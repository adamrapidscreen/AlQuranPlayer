import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KiswahTheme } from '../constants/theme';

interface VerseItemProps {
  arabicText: string;
  translation: string;
  verseNumber: number;
}

export const VerseItem: React.FC<VerseItemProps> = ({
  arabicText,
  translation,
  verseNumber,
}) => {
  return (
    <View style={styles.container}>
      {/* Verse Number Pill */}
      <View style={styles.verseNumberContainer}>
        <Text style={styles.verseNumber}>{verseNumber}</Text>
      </View>

      {/* Arabic Text */}
      <Text style={styles.arabicText}>{arabicText}</Text>

      {/* Translation */}
      <Text style={styles.translation}>{translation}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    alignItems: 'center',
  },
  verseNumberContainer: {
    borderWidth: 1.5,
    borderColor: KiswahTheme.Primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    alignSelf: 'center',
  },
  verseNumber: {
    color: KiswahTheme.Primary,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Lato-Regular',
  },
  arabicText: {
    fontFamily: 'Amiri-Bold',
    fontSize: 28,
    textAlign: 'center',
    color: KiswahTheme.TextPrimary,
    lineHeight: 60,
  },
  translation: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: KiswahTheme.TextSecondary,
    marginTop: 10,
  },
});

