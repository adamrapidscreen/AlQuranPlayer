import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { GlassPlayer } from '../components/GlassPlayer';
import { SurahHeaderArt } from '../components/SurahHeaderArt';
import { VerseItem } from '../components/VerseItem';
import { useTheme } from '../context/ThemeContext';
import { audioCache } from '../services/audioCache';
import { audioPlayer } from '../services/audioPlayer';
import { quranApi } from '../services/quranApi';
import { useQuranStore } from '../store/quranStore';
import { AyahWithTranslation } from '../types/index';
import { getReciterName, getSurahName } from '../utils/constants';
import type { ThemeColors } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PlayerScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { surahNumber } = route.params;
  const { selectedReciter, setCurrentAyahs, setError, sleepTimerEndTime, setSleepTimerEndTime, error: storeError } = useQuranStore();
  const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [loadedSurahNumber, setLoadedSurahNumber] = useState<number | null>(null);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepCountdown, setSleepCountdown] = useState<number | null>(null);
  const shouldAutoPlayRef = useRef(false);
  const previousReciterRef = useRef(selectedReciter);

  const DownloadProgressIndicator = ({ progress }: { progress: number }) => {
    const scale = useSharedValue(1.0);

    useEffect(() => {
      scale.value = withRepeat(
        withTiming(1.05, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }, [scale]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={[styles.downloadProgressContainer, animatedStyle]}>
        <Text style={styles.downloadProgressText}>{progress}%</Text>
      </Animated.View>
    );
  };

  useEffect(() => {
    // Check if reciter changed - if so, stop audio to prevent overlap
    if (previousReciterRef.current !== selectedReciter) {
      audioPlayer.stop().catch(() => {}); // Stop audio silently
      setAudioLoaded(false);
      setLoadedSurahNumber(null);
      setIsPlaying(false);
      previousReciterRef.current = selectedReciter;
    }

    // Reset error state when switching surahs
    setErrorLocal(null);
    if (loadedSurahNumber !== surahNumber) {
      setAudioLoaded(false);
      setLoadedSurahNumber(null);
      setIsPlaying(false);
    }
    loadSurah();
  }, [surahNumber, selectedReciter]);

  // Auto-load and play audio when surah changes
  useEffect(() => {
    // If next/prev button was pressed, start audio immediately (don't wait for text)
    if (shouldAutoPlayRef.current && loadedSurahNumber !== surahNumber) {
      shouldAutoPlayRef.current = false; // Reset flag
      // Start audio download immediately, in parallel with text loading
      loadAndPlayAudio();
      return;
    }

    // Otherwise, auto-load if:
    // 1. Audio was loaded for a different surah (or no surah loaded yet)
    // 2. Surah data has finished loading
    // 3. Audio was already playing
    if (loadedSurahNumber !== surahNumber && !loading && ayahs.length > 0 && isPlaying) {
      const timer = setTimeout(() => {
        loadAndPlayAudio();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [surahNumber, loadedSurahNumber, isPlaying, loading, ayahs.length]);

  // Sync isPlaying state with audio player (optimized polling)
  useEffect(() => {
    if (!audioLoaded) return;
    
    const interval = setInterval(async () => {
      const status = await audioPlayer.getStatus();
      if (status) {
        setIsPlaying(status.isPlaying);
      }
    }, 1000); // Reduced frequency from 500ms to 1000ms

    return () => clearInterval(interval);
  }, [audioLoaded]);

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

  const handleNext = async () => {
    if (surahNumber < 114) {
      // Stop current audio before navigating
      if (audioLoaded || isPlaying) {
        try {
          await audioPlayer.stop();
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          // Non-critical, continue
        }
      }
      // Set flag to auto-play after navigation
      shouldAutoPlayRef.current = true;
      navigation.navigate('Player', { surahNumber: surahNumber + 1 });
    }
  };

  const handlePrev = async () => {
    if (surahNumber > 1) {
      // Stop current audio before navigating
      if (audioLoaded || isPlaying) {
        try {
          await audioPlayer.stop();
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          // Non-critical, continue
        }
      }
      // Set flag to auto-play after navigation
      shouldAutoPlayRef.current = true;
      navigation.navigate('Player', { surahNumber: surahNumber - 1 });
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
      // Always stop any currently playing audio before loading new audio
      if (audioLoaded || isPlaying) {
        try {
          await audioPlayer.stop();
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (stopError) {
          // Non-critical error, continue
        }
        setAudioLoaded(false);
        setLoadedSurahNumber(null);
        setIsPlaying(false);
      }
      
      setIsDownloading(true);
      setDownloadProgress(0);

      const audioUrl = await quranApi.getReciterAudioUrl(surahNumber, selectedReciter);
      const cached = await audioCache.audioExists(surahNumber, selectedReciter);
      let audioUri: string;

      if (cached) {
        audioUri = await audioCache.getAudioFilePath(surahNumber, selectedReciter);
      } else {
        audioUri = await audioCache.downloadAudio(
          surahNumber,
          selectedReciter,
          audioUrl,
          (progress) => setDownloadProgress(progress)
        );
      }

      await audioPlayer.loadAudio(audioUri);
      setAudioLoaded(true);
      setLoadedSurahNumber(surahNumber); // Track which surah's audio is loaded

      await audioPlayer.play();
      setIsPlaying(true);
      setIsDownloading(false);
      setDownloadProgress(0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error loading audio:', errorMsg);
      setErrorLocal(`Failed to load audio: ${errorMsg}`);
      setIsDownloading(false);
      setAudioLoaded(false);
      setLoadedSurahNumber(null);
      setIsPlaying(false);
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
      <LinearGradient colors={[colors.Background, colors.Background]} style={styles.gradientContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.Primary} />
          <Text style={styles.loadingText}>Loading Surah {surahNumber}...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (storeError || errorLocal) {
    const displayError = storeError || errorLocal;
    return (
      <LinearGradient colors={[colors.Background, colors.Background]} style={styles.gradientContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {displayError}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={async () => {
              setErrorLocal(null);
              setError(null);
              // Clear cache for this surah/reciter before retrying
              await audioCache.deleteAudio(surahNumber, selectedReciter);
              loadAndPlayAudio();
            }}
          >
            <Text style={styles.retryButtonText}>Clear Cache & Retry Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.retryButton, { marginTop: 10, backgroundColor: colors.Secondary }]} 
            onPress={() => {
              setErrorLocal(null);
              setError(null);
              loadSurah();
            }}
          >
            <Text style={styles.retryButtonText}>Retry Loading Surah</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const topSectionHeight = SCREEN_HEIGHT * 0.15;
  const middleSectionHeight = SCREEN_HEIGHT * 0.65;
  const bottomSectionHeight = SCREEN_HEIGHT * 0.20;

  return (
    <LinearGradient colors={[colors.Background, colors.Background]} style={styles.gradientContainer}>
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
                  initialNumToRender={10}
                  maxToRenderPerBatch={5}
                  windowSize={10}
                  removeClippedSubviews={true}
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
        <DownloadProgressIndicator progress={downloadProgress} />
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    gradientContainer: {
      flex: 1,
      backgroundColor: colors.Background,
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
      color: colors.TextPrimary,
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
      backgroundColor: colors.Primary,
      paddingHorizontal: 30,
      paddingVertical: 10,
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 20,
    },
    retryButtonText: {
      color: colors.Background,
      fontWeight: '600',
      fontFamily: 'Lato-Regular',
    },
    downloadProgressContainer: {
      position: 'absolute',
      top: 44,
      right: 20,
      zIndex: 10,
      shadowColor: colors.Primary,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 10, // Android shadow
    },
    downloadProgressText: {
      color: colors.Primary,
      fontSize: 18,
      fontWeight: '600',
      fontFamily: 'Lato-Regular',
    },
    sleepTimerDisplay: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.15)',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10,
    },
    sleepTimerText: {
      color: colors.Primary,
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
      top: 44,
      left: 10,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      borderWidth: 1,
      borderColor: colors.Primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      zIndex: 10,
    },
    sleepButtonText: {
      color: colors.Primary,
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
      backgroundColor: colors.Surface,
      borderRadius: 16,
      padding: 24,
      width: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.TextPrimary,
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
      backgroundColor: colors.Primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginVertical: 8,
      width: '45%',
    },
    timerOptionText: {
      color: colors.Background,
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
      color: colors.TextPrimary,
      fontWeight: '600',
      fontSize: 16,
      textAlign: 'center',
      fontFamily: 'Lato-Regular',
    },
  });
