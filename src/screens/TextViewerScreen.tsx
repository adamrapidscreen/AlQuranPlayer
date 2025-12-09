import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AyahWithTranslation } from '../types/index';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../constants/theme';

export const TextViewerScreen = ({ route, navigation }: any) => {
  const { surahNumber, ayahs } = route.params as {
    surahNumber: number;
    ayahs: AyahWithTranslation[];
  };
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Surah {surahNumber}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {ayahs.map((ayah, index) => (
          <View key={index} style={styles.ayahContainer}>
            <Text style={styles.arabicText}>{ayah.text}</Text>
            <Text style={styles.verseNumber}>({ayah.numberInSurah})</Text>
            <Text style={styles.englishText}>{ayah.englishText}</Text>
            <View style={styles.divider} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.Border,
    },
    backButton: {
      color: colors.Secondary,
      fontSize: 16,
      fontWeight: '600',
      width: 60,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.TextPrimary,
    },
    scrollView: {
      flex: 1,
      padding: 20,
    },
    ayahContainer: {
      marginBottom: 24,
    },
    arabicText: {
      fontSize: 20,
      color: colors.TextPrimary,
      lineHeight: 36,
      marginBottom: 8,
      textAlign: 'right',
      fontWeight: '600',
      fontFamily: 'Amiri-Regular',
    },
    verseNumber: {
      fontSize: 12,
      color: colors.Secondary,
      marginBottom: 12,
      fontWeight: '500',
    },
    englishText: {
      fontSize: 14,
      color: colors.TextSecondary,
      lineHeight: 22,
      marginBottom: 12,
      fontFamily: 'Lato-Regular',
    },
    divider: {
      height: 1,
      backgroundColor: colors.Border,
      marginTop: 16,
    },
  });
