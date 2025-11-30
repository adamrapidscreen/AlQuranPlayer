import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { quranApi } from '../services/quranApi';
import { useQuranStore } from '../store/quranStore';
import { AyahWithTranslation } from '../types/index';
import { getReciterName } from '../utils/constants';

export const PlayerScreen = ({ route, navigation }: any) => {
  const { surahNumber } = route.params;
  const { selectedReciter, setCurrentAyahs, setIsLoading, setError } =
    useQuranStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    loadSurah();
  }, [surahNumber]);

  const loadSurah = async () => {
    try {
      setLoading(true);
      setErrorLocal(null);
      console.log(`Loading Surah ${surahNumber}...`);

      const data = await quranApi.getSurah(surahNumber);
      const formattedAyahs = quranApi.formatAyahs(data);

      setAyahs(formattedAyahs);
      setCurrentAyahs(formattedAyahs);
      console.log(`Loaded ${formattedAyahs.length} ayahs`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error loading surah:', errorMsg);
      setErrorLocal(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const reciterName = getReciterName(selectedReciter);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 50 }}
        />
        <Text style={styles.loadingText}>Loading Surah {surahNumber}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSurah}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.surahTitle}>Surah {surahNumber}</Text>
      <Text style={styles.reciter}>Reciter: {reciterName}</Text>
      <Text style={styles.ayahCount}>{ayahs.length} Ayahs</Text>

      <ScrollView style={styles.textArea} scrollEnabled={true}>
        {ayahs.map((ayah, index) => (
          <View key={index} style={styles.ayahContainer}>
            <Text style={styles.arabicText}>{ayah.text}</Text>
            <Text style={styles.verseNumber}>({ayah.numberInSurah})</Text>
            <Text style={styles.englishText}>{ayah.englishText}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => {
            setIsPlaying(!isPlaying);
            console.log(isPlaying ? 'Paused' : 'Playing');
          }}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  surahTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  reciter: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  ayahCount: {
    fontSize: 12,
    color: '#888',
    marginBottom: 15,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  textArea: {
    flex: 1,
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  ayahContainer: {
    marginBottom: 20,
  },
  arabicText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 32,
    marginBottom: 5,
    textAlign: 'right',
  },
  verseNumber: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  englishText: {
    fontSize: 13,
    color: '#bbb',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 50,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
