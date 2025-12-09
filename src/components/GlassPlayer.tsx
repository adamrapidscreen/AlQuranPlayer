import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
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
}

export const GlassPlayer: React.FC<GlassPlayerProps> = React.memo(
  ({ surahName, reciterName, isPlaying, onPlay, onPause, onNext, onPrev }) => {
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
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.surahName} numberOfLines={1}>
              {surahName}
            </Text>
            <Text style={styles.reciterName} numberOfLines={1}>
              {reciterName}
            </Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.smallButton} onPress={handlePrev} activeOpacity={0.7}>
              <Text style={styles.smallButtonText}>⏮</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} activeOpacity={0.8}>
              <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallButton} onPress={handleNext} activeOpacity={0.7}>
              <Text style={styles.smallButtonText}>⏭</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    );
  }
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: '5%',
    },
    blurContainer: {
      width: '100%',
      borderRadius: 20,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.GlassTint,
    },
    textContainer: {
      flex: 1,
      marginRight: 12,
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
      gap: 8,
    },
    playButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.Primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
    },
    playButtonText: {
      fontSize: 24,
      color: colors.Background,
    },
    smallButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.GlassTint,
      justifyContent: 'center',
      alignItems: 'center',
    },
    smallButtonText: {
      fontSize: 18,
      color: colors.TextPrimary,
    },
  });

