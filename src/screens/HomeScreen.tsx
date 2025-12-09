import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import Logo from '../../assets/Quran player logo final.svg';
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoWrapper} accessible accessibilityLabel="Al-Quran Player logo">
            <Logo width="100%" height="100%" />
          </View>
          <Text style={styles.subtitle}>Select a Reciter</Text>
        </View>

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
          <View style={styles.currentReciterBadge}>
            <Text style={styles.currentReciterLabel}>Current</Text>
            <Text style={styles.currentReciterName}>{currentReciterName}</Text>
          </View>
        )}

        <View style={styles.cardsSection}>
          {RECITERS.map((reciter) => (
            <ReciterCard
              key={reciter.id}
              name={reciter.name}
              isSelected={selectedReciter === reciter.id}
              onPress={() => handleSelectReciter(reciter.id as Reciter)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.debugButton} onPress={() => navigation.navigate('Debug')}>
          <Text style={styles.debugButtonText}>🐛 Debug Console</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
      position: 'relative',
      overflow: 'hidden',
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 6,
      gap: 3,
    },
    header: {
      alignItems: 'center',
      gap: 3,
      paddingTop: 2,
    },
    logoWrapper: {
      width: '100%',
      maxWidth: 500,
      height: 250,
      marginBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
    },
    subtitle: {
      fontSize: 18,
      color: colors.TextSecondary,
      textAlign: 'center',
      fontFamily: 'Lato-Regular',
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginTop: 1,
      marginBottom: 4,
    },
    toggleLabel: {
      fontSize: 14,
      color: colors.TextPrimary,
      fontFamily: 'Lato-Regular',
    },
    currentReciterBadge: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: colors.Surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.Border,
      shadowColor: colors.TextPrimary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    currentReciterLabel: {
      fontSize: 13,
      color: colors.TextSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      fontFamily: 'Lato-Regular',
    },
    currentReciterName: {
      fontSize: 14,
      color: colors.Secondary,
      fontFamily: 'Lato-Regular',
      fontWeight: '700',
    },
    cardsSection: {
      marginTop: 0,
    },
    debugButton: {
      backgroundColor: colors.Surface,
      padding: 15,
      borderRadius: 10,
      marginTop: 18,
      borderWidth: 1,
      borderColor: colors.Border,
      shadowColor: colors.TextPrimary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    debugButtonText: {
      color: colors.TextPrimary,
      fontSize: 14,
      textAlign: 'center',
      fontFamily: 'Lato-Regular',
    },
  });
