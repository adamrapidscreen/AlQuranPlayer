import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { KiswahTheme } from '../constants/theme';

interface GlassPlayerProps {
  surahName: string;
  reciterName: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const GlassPlayer: React.FC<GlassPlayerProps> = ({
  surahName,
  reciterName,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
}) => {
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
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        {/* Left side: Surah and Reciter names */}
        <View style={styles.textContainer}>
          <Text style={styles.surahName} numberOfLines={1}>
            {surahName}
          </Text>
          <Text style={styles.reciterName} numberOfLines={1}>
            {reciterName}
          </Text>
        </View>

        {/* Right side: Control buttons */}
        <View style={styles.controlsContainer}>
          {/* Previous button */}
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handlePrev}
            activeOpacity={0.7}
          >
            <Text style={styles.smallButtonText}>⏮</Text>
          </TouchableOpacity>

          {/* Play/Pause button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Next button */}
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={styles.smallButtonText}>⏭</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: '5%', // This makes the width 90%
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
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    color: KiswahTheme.TextPrimary,
    fontFamily: 'Amiri-Bold',
    marginBottom: 4,
  },
  reciterName: {
    fontSize: 12,
    color: KiswahTheme.TextSecondary,
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
    backgroundColor: KiswahTheme.Primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  playButtonText: {
    fontSize: 24,
    color: KiswahTheme.Background,
  },
  smallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButtonText: {
    fontSize: 18,
    color: KiswahTheme.TextPrimary,
  },
});

