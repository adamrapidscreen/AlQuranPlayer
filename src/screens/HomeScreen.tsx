import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuranStore } from '../store/quranStore';
import { Reciter } from '../types/index';
import { RECITERS } from '../utils/constants';
import { ReciterCard } from '../components/ReciterCard';
import { KiswahTheme } from '../constants/theme';

export const HomeScreen = ({ navigation }: any) => {
  const { selectedReciter, setSelectedReciter } = useQuranStore();

  const handleSelectReciter = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    navigation.navigate('SurahList');
  };

  const currentReciterName = RECITERS.find(
    (r) => r.id === selectedReciter
  )?.name;

  return (
    <LinearGradient
      colors={['#1e3c72', KiswahTheme.Background]}
      style={styles.container}
    >
      <Text style={styles.title}>Al-Quran Player</Text>
      <Text style={styles.subtitle}>Select a Reciter</Text>

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

      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => navigation.navigate('Debug')}
      >
        <Text style={styles.debugButtonText}>🐛 Debug Console</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Amiri-Bold',
    color: KiswahTheme.Primary,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: KiswahTheme.TextSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Lato-Regular',
  },
  currentReciter: {
    fontSize: 14,
    color: KiswahTheme.Secondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Lato-Regular',
  },
  buttonContainer: {
    flex: 1,
  },
  debugButton: {
    backgroundColor: KiswahTheme.Surface,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  debugButtonText: {
    color: KiswahTheme.TextPrimary,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
});
