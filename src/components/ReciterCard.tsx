import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../constants/theme';

interface ReciterCardProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

export const ReciterCard: React.FC<ReciterCardProps> = React.memo(
  ({ name, isSelected, onPress }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const scale = useRef(new Animated.Value(1)).current;
    const shimmer = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;

    const gold = '#D4AF37';
    const textColor = '#0B1623';

    const animateScale = (value: number) => {
      Animated.spring(scale, {
        toValue: value,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }).start();
    };

    const handlePress = () => {
      Haptics.selectionAsync();
      onPress();
    };

    const handlePressIn = () => animateScale(0.97);
    const handlePressOut = () => animateScale(1);

    const rippleColor = 'rgba(0, 0, 0, 0.12)';

    React.useEffect(() => {
      if (isSelected) {
        const shimmerLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ])
        );
        const pulseLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
          ])
        );
        shimmerLoop.start();
        pulseLoop.start();
        return () => {
          shimmerLoop.stop();
          pulseLoop.stop();
        };
      } else {
        shimmer.stopAnimation();
        shimmer.setValue(0);
        pulse.stopAnimation();
        pulse.setValue(1);
      }
    }, [isSelected, shimmer, pulse]);

    return (
      <Animated.View
        style={[
          styles.shadowContainer,
          { transform: [{ scale: Animated.multiply(scale, pulse) }] },
          isSelected && styles.shadowSelected,
        ]}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: rippleColor }}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
        >
          <Text style={[styles.cardText, { color: textColor }]}>{name}</Text>
          {isSelected && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmerOverlay,
                {
                  opacity: shimmer.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.25],
                  }),
                },
              ]}
            />
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    shadowContainer: {
      marginVertical: 8,
      borderRadius: 16,
      shadowColor: '#B88A1E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 10,
    },
    card: {
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderWidth: 1,
      backgroundColor: '#D4AF37',
      borderColor: colors.Secondary,
      overflow: 'hidden',
    },
    cardPressed: {
      opacity: 0.92,
    },
    cardText: {
      fontSize: 18,
      textAlign: 'center',
      fontFamily: 'Lato-Regular',
      backgroundColor: 'transparent',
    },
    shadowSelected: {
      shadowColor: '#D4AF37',
    },
    shimmerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
    },
  });

