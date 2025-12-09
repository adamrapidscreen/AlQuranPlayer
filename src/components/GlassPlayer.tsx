import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../constants/theme';

interface GlassPlayerProps {
  surahName: string;
  reciterName: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  /** 0 - 1 progress value */
  progress?: number;
}

export const GlassPlayer: React.FC<GlassPlayerProps> = React.memo(
  ({
    surahName,
    reciterName,
    isPlaying,
    onPlay,
    onPause,
    onNext,
    onPrev,
    // progress is currently unused but kept for API compatibility
    progress = 0,
  }) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const handlePlayPause = () => {
      Haptics.selectionAsync();
      if (isPlaying) {
        onPause();
      } else {
        onPlay();
      }
    };

    const handleNext = () => {
      Haptics.selectionAsync();
      onNext();
    };

    const handlePrev = () => {
      Haptics.selectionAsync();
      onPrev();
    };

    return (
      <View style={styles.container}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.textContainer}>
            <Text style={styles.surahName} numberOfLines={1}>
              {surahName}
            </Text>
            <Text style={styles.reciterName} numberOfLines={1}>
              {reciterName}
            </Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.smallButton} onPress={handlePrev} activeOpacity={0.8}>
              <Ionicons name="play-skip-back" size={22} color={colors.Secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} activeOpacity={0.85}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={30}
                color="#FFFFFF"
                style={styles.playIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallButton} onPress={handleNext} activeOpacity={0.8}>
              <Ionicons name="play-skip-forward" size={22} color={colors.Secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    card: {
      width: '100%',
      borderRadius: 24,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 18,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 24,
      elevation: 14,
    },
    cardDark: {
      backgroundColor: '#1F2733',
    },
    textContainer: {
      flex: 1,
      marginBottom: 8,
    },
    surahName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.TextPrimary,
      fontFamily: 'Amiri-Bold',
      marginBottom: 4,
    },
    reciterName: {
      fontSize: 12,
      color: colors.TextSecondary,
      fontFamily: 'Lato-Regular',
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      gap: 12,
    },
    playButton: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: '#D4AF37',
      borderWidth: 2,
      borderColor: colors.Secondary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.22,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
      marginTop: 0,
    },
    playButtonText: {
      fontSize: 30,
      color: '#FFFFFF',
      backgroundColor: 'transparent',
      includeFontPadding: false,
      transform: [],
    },
    playIcon: {
      transform: [],
    },
    smallButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: 'rgba(0, 96, 100, 0.12)',
      borderWidth: 2,
      borderColor: colors.Secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

