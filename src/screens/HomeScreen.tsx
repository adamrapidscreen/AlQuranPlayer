import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuranStore } from '../store/quranStore';
import { Reciter } from '../types/index';
import { RECITERS } from '../utils/constants';

export const HomeScreen = ({ navigation }: any) => {
  const { selectedReciter, setSelectedReciter } = useQuranStore();

  const handleSelectReciter = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    console.log(`Selected reciter: ${reciter}`);
    navigation.navigate('SurahList');
  };

  const currentReciterName = RECITERS.find(
    (r) => r.id === selectedReciter
  )?.name;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Al-Quran Player</Text>
      <Text style={styles.subtitle}>Select a Reciter</Text>

      {currentReciterName && (
        <Text style={styles.currentReciter}>
          Current: {currentReciterName}
        </Text>
      )}

      <ScrollView style={styles.buttonContainer}>
        {RECITERS.map((reciter) => (
          <TouchableOpacity
            key={reciter.id}
            style={[
              styles.button,
              selectedReciter === reciter.id && styles.buttonSelected,
            ]}
            onPress={() => handleSelectReciter(reciter.id as Reciter)}
          >
            <Text style={styles.buttonText}>{reciter.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => navigation.navigate('Debug')}
      >
        <Text style={styles.debugButtonText}>🐛 Debug Console</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  currentReciter: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flex: 1,
  },
  button: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  buttonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#2d4a2d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
