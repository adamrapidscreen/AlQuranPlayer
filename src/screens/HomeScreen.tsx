import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { useQuranStore } from '../store/quranStore';
import { Reciter } from '../types/index';
import { RECITERS } from '../utils/constants';
import { ReciterCard } from '../components/ReciterCard';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../constants/theme';

export const HomeScreen = ({ navigation }: any) => {
  const { colors, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selectedReciter, setSelectedReciter } = useQuranStore();

  const handleSelectReciter = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    navigation.navigate('SurahList');
  };

  const currentReciterName = RECITERS.find(
    (r) => r.id === selectedReciter
  )?.name;

  return (
    <LinearGradient colors={[colors.Background, colors.Background]} style={styles.container}>
      <Text style={styles.title}>Al-Quran Player</Text>
      <Text style={styles.subtitle}>Select a Reciter</Text>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
        <Switch
          value={mode === 'dark'}
          onValueChange={toggleTheme}
          thumbColor={colors.Primary}
          trackColor={{ false: colors.Border, true: colors.Secondary }}
        />
      </View>

      {currentReciterName && (
        <Text style={styles.currentReciter}>
          Current: {currentReciterName}
        </Text>
      )}

      <ScrollView style={styles.buttonContainer}>
        {RECITERS.map((reciter) => (
          <ReciterCard
            key={reciter.id}
            name={reciter.name}
            isSelected={selectedReciter === reciter.id}
            onPress={() => handleSelectReciter(reciter.id as Reciter)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.debugButton} onPress={() => navigation.navigate('Debug')}>
        <Text style={styles.debugButtonText}>🐛 Debug Console</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.Background,
    },
    title: {
      fontSize: 32,
      fontFamily: 'Amiri-Bold',
      color: colors.Primary,
      textAlign: 'center',
      marginTop: 40,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      color: colors.TextSecondary,
      textAlign: 'center',
      marginBottom: 12,
      fontFamily: 'Lato-Regular',
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 16,
    },
    toggleLabel: {
      fontSize: 14,
      color: colors.TextPrimary,
      fontFamily: 'Lato-Regular',
    },
    currentReciter: {
      fontSize: 14,
      color: colors.Secondary,
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: 'Lato-Regular',
    },
    buttonContainer: {
      flex: 1,
    },
    debugButton: {
      backgroundColor: colors.Surface,
      padding: 15,
      borderRadius: 10,
      marginTop: 10,
      marginBottom: 20,
    },
    debugButtonText: {
      color: colors.TextPrimary,
      fontSize: 14,
      textAlign: 'center',
      fontFamily: 'Lato-Regular',
    },
  });
