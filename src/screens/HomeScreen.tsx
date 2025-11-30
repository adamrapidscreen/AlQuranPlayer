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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Al-Quran Player</Text>
      <Text style={styles.subtitle}>Select a Reciter</Text>

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#666',
  },
  debugButtonText: {
    color: '#aaa',
    fontSize: 12,
  },
});
