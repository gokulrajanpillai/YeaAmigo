import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/auth';
import { useI18n } from '../src/i18n';
import { colors } from '../src/theme';
import { Penguin } from '../src/components/Mascot';

export default function Splash() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  // --- entrance animations ---
  const mascotScale = useRef(new Animated.Value(0.6)).current;
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(mascotScale, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 100 }),
        Animated.timing(mascotOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textTranslateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]),
      Animated.timing(tagOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    // Loading dots pulse loop
    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    dotLoop.start();
    return () => dotLoop.stop();
  }, []);

  useEffect(() => {
    if (loading) return;
    // Small grace period so the animation finishes before the route transition
    const timer = setTimeout(() => {
      if (!user) router.replace('/(auth)/login');
      else if (user.role === 'customer') router.replace('/(customer)/home');
      else if (user.role === 'restaurant_owner') router.replace('/(restaurant)/dashboard');
      else if (user.role === 'rider') router.replace('/(rider)/home');
      else if (user.role === 'admin') router.replace('/(admin)/dashboard');
    }, 300);
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  const dot1Opacity = dotAnim.interpolate({ inputRange: [0, 0.33, 1], outputRange: [0.3, 1, 0.3] });
  const dot2Opacity = dotAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] });
  const dot3Opacity = dotAnim.interpolate({ inputRange: [0, 0.67, 1], outputRange: [0.3, 1, 0.3] });

  return (
    <View style={styles.container} testID="splash-screen">
      <StatusBar style="light" backgroundColor={colors.brand} />
      {/* Brand wordmark */}
      <View style={styles.wordmark}>
        <Text style={styles.wordmarkYea}>Yea</Text>
        <Text style={styles.wordmarkAmigo}>Amigo</Text>
      </View>

      {/* Mascot */}
      <Animated.View style={[styles.mascotWrap, { transform: [{ scale: mascotScale }], opacity: mascotOpacity }]}>
        <Penguin size={160} mood="happy" role="delivery" animated />
      </Animated.View>

      {/* Brand text */}
      <Animated.Text style={[styles.brand, { transform: [{ translateY: textTranslateY }], opacity: textOpacity }]}>
        YeaAmigo
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        {t('tagline')}
      </Animated.Text>

      {/* Loading dots */}
      {loading && (
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    paddingHorizontal: 32,
  },
  wordmark: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  wordmarkYea: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  wordmarkAmigo: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  mascotWrap: {
    marginVertical: 12,
  },
  brand: {
    fontSize: 46,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    marginTop: 4,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 40,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.accent,
  },
});
