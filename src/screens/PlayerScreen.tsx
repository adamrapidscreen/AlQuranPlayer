import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
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

export const PlayerScreen = ({ route, navigation }: any) => {
  const { surahNumber } = route.params;
  const { selectedReciter, setCurrentAyahs, setError, sleepTimerEndTime, setSleepTimerEndTime } = useQuranStore();
  const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorLocal] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [duration, setDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState('0:00');
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepCountdown, setSleepCountdown] = useState<number | null>(null);

  useEffect(() => {
    loadSurah();
    return () => {
      // Don't stop audio here - let it keep playing
      // Only unload when truly leaving the player permanently
    };
  }, [surahNumber]);

  // Update time display
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPlaying) {
        const status = await audioPlayer.getStatus();
        if (status?.isLoaded) {
          const curr = Math.floor(status.currentTime);
          const dur = Math.floor(status.duration);
          setCurrentTime(formatTime(curr));
          setDuration(formatTime(dur));
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sleep timer countdown - persists across surah/reciter changes
  useEffect(() => {
    if (!sleepTimerEndTime) {
      setSleepCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((sleepTimerEndTime - now) / 1000));
      
      if (remaining <= 0) {
        // Timer expired
        audioPlayer.stop();
        setIsPlaying(false);
        setSleepTimerEndTime(null);
        setSleepCountdown(null);
      } else {
        setSleepCountdown(remaining);
      }
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEndTime, setSleepTimerEndTime]);

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

  const handlePlayPause = async () => {
    try {
      if (!audioLoaded) {
        await loadAndPlayAudio();
      } else {
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

  const handleSleepTimer = (minutes: number) => {
    const endTime = Date.now() + (minutes * 60 * 1000);
    setSleepTimerEndTime(endTime);
    setShowSleepModal(false);
    audioPlayer.setSleepTimer(minutes);
  };

  const cancelSleepTimer = () => {
    setSleepTimerEndTime(null);
    setSleepCountdown(null);
    audioPlayer.cancelSleepTimer();
  };

  const loadAndPlayAudio = async () => {
    try {
      // Only stop if switching to DIFFERENT surah
      if (audioLoaded) {
        console.log('Stopping previous audio...');
        await audioPlayer.stop();
        setAudioLoaded(false);
      }
      
      setIsDownloading(true);
      setDownloadProgress(0);

      console.log(`=== LOADING AUDIO FOR SURAH ${surahNumber} ===`);
      console.log(`Reciter: ${selectedReciter}`);

      const audioUrl = await quranApi.getReciterAudioUrl(surahNumber, selectedReciter);
      console.log(`Generated URL: ${audioUrl}`);

      const cached = await audioCache.audioExists(surahNumber, selectedReciter);
      let audioUri: string;

      if (cached) {
        console.log('✅ Audio found in cache');
        audioUri = await audioCache.getAudioFilePath(surahNumber, selectedReciter);
      } else {
        console.log('📥 Downloading audio...');
        audioUri = await audioCache.downloadAudio(
          surahNumber,
          selectedReciter,
          audioUrl,
          (progress) => {
            setDownloadProgress(progress);
            console.log(`Download progress: ${progress}%`);
          }
        );
      }

      await audioPlayer.loadAudio(audioUri);
      setAudioLoaded(true);

      const status = await audioPlayer.getStatus();
      if (status?.duration) {
        setDuration(formatTime(Math.floor(status.duration)));
      }

      await audioPlayer.play();
      setIsPlaying(true);
      setIsDownloading(false);
      setDownloadProgress(0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error:', errorMsg);
      setErrorLocal(errorMsg);
      setIsDownloading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatSleepCountdown = (totalSeconds: number | null): string => {
    if (!totalSeconds) return '';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const reciterName = getReciterName(selectedReciter);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.surahNumber}>Surah {surahNumber}</Text>
        <Text style={styles.reciterName}>{reciterName}</Text>
      </View>

      {/* Logo/Branding Area */}
      <View style={styles.centerContent}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>🕌</Text>
        </View>
        <Text style={styles.ayahCountText}>{ayahs.length} [translate:Ayahs]</Text>
      </View>

      {/* Download Progress */}
      {isDownloading && (
        <View style={styles.downloadContainer}>
          <Text style={styles.downloadText}>Downloading... {downloadProgress}%</Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${downloadProgress}%` }]}
            />
          </View>
        </View>
      )}

      {/* Sleep Timer Display */}
      {sleepTimerEndTime && (
        <View style={styles.sleepTimerDisplay}>
          <Text style={styles.sleepTimerText}>
            Sleep Timer: {formatSleepCountdown(sleepCountdown)}
          </Text>
          <TouchableOpacity onPress={cancelSleepTimer}>
            <Text style={styles.cancelSleepText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{currentTime}</Text>
        <Text style={styles.timeText}>{duration}</Text>
      </View>

      {/* Play Button */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.playButton,
            isDownloading && styles.playButtonDisabled,
          ]}
          onPress={handlePlayPause}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={styles.playButtonIcon}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sleep Timer Button */}
      <TouchableOpacity
        style={styles.sleepButton}
        onPress={() => setShowSleepModal(true)}
      >
        <Text style={styles.sleepButtonText}>⏱ Sleep Timer</Text>
      </TouchableOpacity>

      {/* Text View Button */}
      <TouchableOpacity
        style={styles.textViewButton}
        onPress={() =>
          navigation.navigate('TextViewer', {
            surahNumber,
            ayahs,
          })
        }
      >
        <Text style={styles.textViewButtonText}>View Text</Text>
      </TouchableOpacity>

      {/* Sleep Timer Modal */}
      <Modal
        visible={showSleepModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSleepModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Sleep Timer</Text>

            <View style={styles.timerOptionsContainer}>
              {[5, 10, 15, 30].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={styles.timerOption}
                  onPress={() => handleSleepTimer(minutes)}
                >
                  <Text style={styles.timerOptionText}>{minutes} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSleepModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  surahNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  reciterName: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 80,
  },
  ayahCountText: {
    fontSize: 14,
    color: '#888',
    marginTop: 20,
  },
  downloadContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  downloadText: {
    color: '#007AFF',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
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
  sleepTimerDisplay: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sleepTimerText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelSleepText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
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
  controls: {
    alignItems: 'center',
    marginBottom: 30,
  },
  playButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonDisabled: {
    backgroundColor: '#0056cc',
    opacity: 0.6,
  },
  playButtonIcon: {
    fontSize: 50,
    color: '#fff',
  },
  sleepButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  textViewButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  textViewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  timerOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  timerOption: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    width: '45%',
  },
  timerOptionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
