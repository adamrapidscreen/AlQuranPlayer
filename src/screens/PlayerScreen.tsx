import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { audioCache } from '../services/audioCache';
import { audioPlayer } from '../services/audioPlayer';
import { quranApi } from '../services/quranApi';
import { useQuranStore } from '../store/quranStore';
import { AyahWithTranslation } from '../types/index';
import { getReciterName } from '../utils/constants';

export const PlayerScreen = ({ route }: any) => {
  const { surahNumber } = route.params;
  const { selectedReciter, setCurrentAyahs, setError } = useQuranStore();
  const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorLocal] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    loadSurah();
    return () => {
      // Clean up audio when component unmounts or surah changes
      // Handle cleanup gracefully - don't throw errors
      const cleanup = async () => {
        try {
          // Stop and unload audio if it exists
          if (audioPlayer.getIsPlaying()) {
            await audioPlayer.stop().catch(() => {
              // Ignore errors during cleanup
            });
            await audioPlayer.unload().catch(() => {
              // Ignore errors during cleanup
            });
          }
        } catch (error) {
          // Silently handle any cleanup errors
        } finally {
          setAudioLoaded(false);
          setIsPlaying(false);
        }
      };
      cleanup();
    };
  }, [surahNumber]);

  const loadSurah = async () => {
    try {
      setLoading(true);
      setErrorLocal(null);

      const data = await quranApi.getSurah(surahNumber);
      const formattedAyahs = quranApi.formatAyahs(data);

      setAyahs(formattedAyahs);
      setCurrentAyahs(formattedAyahs);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error loading surah:', errorMsg);
      setErrorLocal(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!audioLoaded) {
        // First time - need to download/load audio
        await loadAndPlayAudio();
      } else {
        // Already loaded - just toggle play/pause
        if (isPlaying) {
          await audioPlayer.pause();
          setIsPlaying(false);
        } else {
          await audioPlayer.play();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error playing audio:', errorMsg);
      setErrorLocal(errorMsg);
    }
  };

  const loadAndPlayAudio = async () => {
    try {
      // Stop any currently playing audio FIRST to prevent overlapping
      if (audioLoaded || isPlaying) {
        try {
          await audioPlayer.stop();
          await audioPlayer.unload();
        } catch (error) {
          console.warn('Error stopping previous audio:', error);
        }
        setAudioLoaded(false);
        setIsPlaying(false);
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      // Check if already cached
      const cached = await audioCache.audioExists(surahNumber, selectedReciter);
      let audioUri: string;

      if (cached) {
        audioUri = await audioCache.getAudioFilePath(surahNumber, selectedReciter);
      } else {
        // Get audio URL (now async, fetches from API to get actual URL)
        const audioUrl = await quranApi.getReciterAudioUrl(
          surahNumber,
          selectedReciter
        );
        
        // Validate URL format
        if (!audioUrl || (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://'))) {
          throw new Error(`Invalid audio URL format: ${audioUrl}`);
        }
        
        try {
          // Download and cache
          audioUri = await audioCache.downloadAudio(
            surahNumber,
            selectedReciter,
            audioUrl,
            (progress) => {
              setDownloadProgress(progress);
            }
          );
        } catch (downloadError: unknown) {
          console.error('Download failed:', downloadError);
          const errorMessage = downloadError instanceof Error ? downloadError.message : 'Unknown error';
          throw new Error(`Failed to download audio: ${errorMessage}`);
        }
      }

      // Validate audio URI before loading
      if (!audioUri) {
        throw new Error('Audio URI is empty');
      }
      
      try {
        await audioPlayer.loadAudio(audioUri);
        setAudioLoaded(true);

        // Small delay to ensure player is ready
        await new Promise(resolve => setTimeout(resolve, 200));

        // Play
        await audioPlayer.play();
        setIsPlaying(true);
        setIsDownloading(false);
        setDownloadProgress(0);
      } catch (loadError: unknown) {
        console.error('Error in load/play:', loadError);
        const errorMessage = loadError instanceof Error ? loadError.message : 'Unknown error';
        throw new Error(`Failed to load/play audio: ${errorMessage}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error loading/playing audio:', errorMsg);
      console.error('Full error:', err);
      setErrorLocal(errorMsg);
      setIsDownloading(false);
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

      {isDownloading && (
        <View style={styles.downloadContainer}>
          <Text style={styles.downloadText}>
            Downloading audio... {downloadProgress}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${downloadProgress}%` },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playButton, isDownloading && styles.playButtonDisabled]}
          onPress={handlePlayPause}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </Text>
          )}
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
    marginBottom: 15,
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
  downloadContainer: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  downloadText: {
    color: '#007AFF',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 50,
  },
  playButtonDisabled: {
    backgroundColor: '#0056cc',
    opacity: 0.6,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
