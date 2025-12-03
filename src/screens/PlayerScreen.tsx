import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GlassPlayer } from '../components/GlassPlayer';
import { SurahHeaderArt } from '../components/SurahHeaderArt';
import { VerseItem } from '../components/VerseItem';
import { KiswahTheme } from '../constants/theme';
import { audioCache } from '../services/audioCache';
import { audioPlayer } from '../services/audioPlayer';
import { quranApi } from '../services/quranApi';
import { useQuranStore } from '../store/quranStore';
import { AyahWithTranslation } from '../types/index';
import { getReciterName, getSurahName } from '../utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepCountdown, setSleepCountdown] = useState<number | null>(null);

  useEffect(() => {
    loadSurah();
    return () => {
      // Don't stop audio here - let it keep playing
      // Only unload when truly leaving the player permanently
    };
  }, [surahNumber]);

  // Sync isPlaying state with audio player
  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await audioPlayer.getStatus();
      if (status) {
        setIsPlaying(status.isPlaying);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

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

  const handlePlay = async () => {
    try {
      if (!audioLoaded) {
        await loadAndPlayAudio();
      } else {
        await audioPlayer.play();
        setIsPlaying(true);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error playing audio:', errorMsg);
      setErrorLocal(errorMsg);
    }
  };

  const handlePause = async () => {
    try {
      await audioPlayer.pause();
      setIsPlaying(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error pausing audio:', errorMsg);
      setErrorLocal(errorMsg);
    }
  };

  const handleNext = () => {
    if (surahNumber < 114) {
      const nextSurah = surahNumber + 1;
      navigation.replace('Player', { surahNumber: nextSurah });
    } else {
      console.log('Already at last surah');
    }
  };

  const handlePrev = () => {
    if (surahNumber > 1) {
      const prevSurah = surahNumber - 1;
      navigation.replace('Player', { surahNumber: prevSurah });
    } else {
      console.log('Already at first surah');
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

  const formatSleepCountdown = (totalSeconds: number | null): string => {
    if (!totalSeconds) return '';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const reciterName = getReciterName(selectedReciter);
  const surahName = getSurahName(surahNumber);

  const renderVerse = ({ item }: { item: AyahWithTranslation }) => (
    <VerseItem
      arabicText={item.text}
      translation={item.englishText}
      verseNumber={item.numberInSurah}
    />
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#1e3c72', KiswahTheme.Background]}
        style={styles.gradientContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={KiswahTheme.Primary} />
          <Text style={styles.loadingText}>Loading Surah {surahNumber}...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#1e3c72', KiswahTheme.Background]}
        style={styles.gradientContainer}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSurah}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const topSectionHeight = SCREEN_HEIGHT * 0.15;
  const middleSectionHeight = SCREEN_HEIGHT * 0.65;
  const bottomSectionHeight = SCREEN_HEIGHT * 0.20;

  return (
    <LinearGradient
      colors={['#1e3c72', KiswahTheme.Background]}
      style={styles.gradientContainer}
    >
      {/* Top Section (15%): SurahHeaderArt */}
      <View style={[styles.topSection, { height: topSectionHeight }]}>
        <SurahHeaderArt surahNumber={surahNumber} />
      </View>

      {/* Middle Section (50%): Scrollable Verse List */}
      <View style={[styles.middleSection, { height: middleSectionHeight, top: topSectionHeight }]}>
        <FlatList
          data={ayahs}
          renderItem={renderVerse}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Bottom Section (20%): GlassPlayer */}
      <View style={[styles.bottomSection, { height: bottomSectionHeight }]}>
        <GlassPlayer
          surahName={surahName}
          reciterName={reciterName}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onPrev={handlePrev}
        />
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

      {/* Sleep Timer Button */}
      <TouchableOpacity
        style={styles.sleepButton}
        onPress={() => setShowSleepModal(true)}
      >
        <Text style={styles.sleepButtonText}>⏱ Sleep Timer</Text>
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 10,
  },
  middleSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
    zIndex: 100, // Ensure it's on top layer
  },
  listContent: {
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: KiswahTheme.TextPrimary,
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
  retryButton: {
    backgroundColor: KiswahTheme.Primary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: KiswahTheme.Background,
    fontWeight: '600',
    fontFamily: 'Lato-Regular',
  },
  downloadContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  downloadText: {
    color: KiswahTheme.Primary,
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: KiswahTheme.Primary,
  },
  sleepTimerDisplay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  sleepTimerText: {
    color: KiswahTheme.Primary,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Lato-Regular',
  },
  cancelSleepText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'Lato-Regular',
  },
  sleepButton: {
    position: 'absolute',
    top: 44, // 20 (original) + 24 (button height: 8*2 padding + ~8 text height)
    left: 10,
    backgroundColor: 'rgba(197, 160, 89, 0.2)',
    borderWidth: 1,
    borderColor: KiswahTheme.Primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 10,
  },
  sleepButtonText: {
    color: KiswahTheme.Primary,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Lato-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: KiswahTheme.Surface,
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: KiswahTheme.TextPrimary,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Amiri-Bold',
  },
  timerOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  timerOption: {
    backgroundColor: KiswahTheme.Primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    width: '45%',
  },
  timerOptionText: {
    color: KiswahTheme.Background,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
  modalCloseButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: KiswahTheme.TextPrimary,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
});
