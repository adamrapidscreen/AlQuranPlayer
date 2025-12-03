import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { surahNameSvgs } from '../../assets/surah-names';
import { KiswahTheme } from '../constants/theme';

interface SurahHeaderArtProps {
  surahNumber: number;
}

export const SurahHeaderArt: React.FC<SurahHeaderArtProps> = ({ surahNumber }) => {
  // Get the SVG component for this surah
  const SurahSvg = surahNameSvgs[surahNumber];

  // If SVG not found, return null
  if (!SurahSvg) {
    return null;
  }

  // Create breathing animation
  const scale = useSharedValue(1.0);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.05, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // infinite
      true // reverse
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.svgContainer, animatedStyle]}>
        <SurahSvg
          width={300}
          height={150}
          fill={KiswahTheme.Primary}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  svgContainer: {
    shadowColor: KiswahTheme.Primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10, // Android shadow
  },
});

