// YeaAmigo penguin mascot — vector SVG, original design.
// Roles: main / child / chef / delivery / customer
// Moods: happy / hungry / searching / celebrate / waiting / sorry / sleeping
import React, { useEffect, useRef } from 'react';
import Svg, { Circle, Ellipse, Path, G, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { View, Animated, Easing } from 'react-native';
import { colors } from '../theme';

export type Mood = 'happy' | 'hungry' | 'searching' | 'celebrate' | 'waiting' | 'sorry' | 'sleeping';
export type Role = 'main' | 'child' | 'chef' | 'delivery' | 'customer';

export function Penguin({
  size = 120, mood = 'happy', role = 'main', animated = false, scarf,
}: { size?: number; mood?: Mood; role?: Role; animated?: boolean; scarf?: string }) {
  // Palette
  const body = '#1A2742';
  const bodyLight = '#2C3A5C';
  const belly = '#FBF6E8';
  const beak = '#F3C44C';
  const beakDark = '#D9A523';
  const cheek = '#F4A6B8';

  const scarfColor = scarf ||
    (role === 'chef' ? '#FFFFFF'
    : role === 'delivery' ? colors.brand
    : role === 'child' ? colors.berry
    : role === 'customer' ? colors.accent
    : colors.accent);

  // Eyes
  const eye = (cx: number) => {
    if (mood === 'sleeping') return <Path key={`e${cx}`} d={`M${cx - 4} 50 q4 -4 8 0`} stroke={body} strokeWidth={1.8} fill="none" strokeLinecap="round" />;
    if (mood === 'celebrate') return <Path key={`e${cx}`} d={`M${cx - 3} 52 q3 -5 6 0`} stroke={body} strokeWidth={2} fill="none" strokeLinecap="round" />;
    const dy = mood === 'hungry' ? 1 : 0;
    const dx = mood === 'searching' ? 1.2 : 0;
    return (
      <G key={`e${cx}`}>
        <Ellipse cx={cx} cy={49} rx={4.5} ry={5} fill="#FFFFFF" />
        <Circle cx={cx + dx} cy={50 + dy} r={2.4} fill={body} />
        <Circle cx={cx + dx - 1} cy={48.5 + dy} r={0.9} fill="#FFFFFF" />
      </G>
    );
  };

  // Mouth
  let mouth: React.ReactNode = null;
  if (mood === 'happy' || mood === 'celebrate') {
    mouth = <Path d="M44 64 q6 5 12 0" stroke={body} strokeWidth={1.8} fill="none" strokeLinecap="round" />;
  } else if (mood === 'hungry') {
    mouth = <Path d="M45 64 q5 4 10 0 q-5 3 -10 0" stroke={body} strokeWidth={1.4} fill={cheek} strokeLinecap="round" />;
  } else if (mood === 'sorry' || mood === 'waiting') {
    mouth = <Path d="M44 66 q6 -3 12 0" stroke={body} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
  } else if (mood === 'searching') {
    mouth = <Circle cx={50} cy={64} r={1.8} fill={body} />;
  }

  const sparkles = mood === 'celebrate' ? (
    <G>
      <Path d="M16 18 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill={colors.accent} />
      <Path d="M84 24 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 l3 -1 z" fill={colors.berry} />
      <Circle cx={88} cy={56} r={2.5} fill={colors.brand} />
      <Circle cx={12} cy={58} r={2} fill={colors.accent} />
    </G>
  ) : null;

  // Role accessories
  const accessory = (() => {
    if (role === 'chef') {
      return (
        <G>
          {/* Chef hat */}
          <Ellipse cx={50} cy={22} rx={18} ry={8} fill="#FFFFFF" />
          <Rect x={32} y={22} width={36} height={10} fill="#FFFFFF" />
          <Rect x={32} y={32} width={36} height={3} fill="#F4ECDC" />
          <Circle cx={42} cy={18} r={6} fill="#FFFFFF" />
          <Circle cx={50} cy={14} r={7} fill="#FFFFFF" />
          <Circle cx={58} cy={18} r={6} fill="#FFFFFF" />
        </G>
      );
    }
    if (role === 'delivery') {
      return (
        <G>
          {/* Cap */}
          <Path d="M30 36 Q50 14 70 36 Z" fill={colors.brand} />
          <Rect x={28} y={34} width={44} height={4} fill={colors.brandDark} rx={2} />
          <Circle cx={50} cy={24} r={2.5} fill={colors.accent} />
          {/* Food bag in wing */}
          <Rect x={68} y={62} width={14} height={16} fill={colors.accent} rx={2} />
          <Rect x={70} y={60} width={10} height={4} fill={colors.accentDark} rx={1} />
          <Path d="M71 67 h8 M71 71 h8" stroke={colors.brandDark} strokeWidth={0.8} />
        </G>
      );
    }
    if (role === 'customer') {
      return (
        <G>
          {/* Fork held in wing */}
          <Rect x={76} y={50} width={1.5} height={18} fill={beakDark} />
          <Rect x={74} y={48} width={1.5} height={4} fill={beakDark} />
          <Rect x={77} y={48} width={1.5} height={4} fill={beakDark} />
          <Rect x={80} y={48} width={1.5} height={4} fill={beakDark} />
        </G>
      );
    }
    return null;
  })();

  const inner = (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="bodyShade" cx="0.5" cy="0.4" r="0.6">
          <Stop offset="0%" stopColor={bodyLight} />
          <Stop offset="100%" stopColor={body} />
        </RadialGradient>
        <RadialGradient id="bellyShade" cx="0.5" cy="0.4" r="0.7">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor={belly} />
        </RadialGradient>
      </Defs>
      {sparkles}
      {/* Body */}
      <Ellipse cx={50} cy={64} rx={30} ry={32} fill="url(#bodyShade)" />
      {/* Wings */}
      <Ellipse cx={20} cy={66} rx={7} ry={15} fill={body} transform="rotate(-10 20 66)" />
      <Ellipse cx={80} cy={66} rx={7} ry={15} fill={body} transform="rotate(10 80 66)" />
      {/* Belly */}
      <Path d="M30 58 Q50 44 70 58 Q70 88 50 92 Q30 88 30 58 Z" fill="url(#bellyShade)" />
      {/* Head */}
      <Ellipse cx={50} cy={44} rx={24} ry={22} fill="url(#bodyShade)" />
      {/* Face mask (lighter) */}
      <Ellipse cx={50} cy={50} rx={15} ry={13} fill="url(#bellyShade)" />
      {/* Cheeks */}
      <Circle cx={33} cy={58} r={3.5} fill={cheek} opacity={0.65} />
      <Circle cx={67} cy={58} r={3.5} fill={cheek} opacity={0.65} />
      {/* Eyes */}
      {eye(42)}
      {eye(58)}
      {/* Beak */}
      <Path d="M46.5 55 L53.5 55 L50 62 Z" fill={beak} />
      <Path d="M46.5 55 L53.5 55 L50 58 Z" fill={beakDark} />
      {mouth}
      {/* Feet */}
      <Ellipse cx={40} cy={95} rx={7} ry={3.5} fill={beak} />
      <Ellipse cx={60} cy={95} rx={7} ry={3.5} fill={beak} />
      {/* Scarf */}
      <Rect x={26} y={70} width={48} height={6.5} fill={scarfColor} rx={3} />
      <Path d="M68 76 L76 88 L66 80 Z" fill={scarfColor} />
      {accessory}
    </Svg>
  );

  if (!animated) {
    return <View style={{ width: size, height: size }}>{inner}</View>;
  }

  return <AnimatedWrap size={size} mood={mood}>{inner}</AnimatedWrap>;
}

function AnimatedWrap({ size, mood, children }: { size: number; mood: Mood; children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const rotate = mood === 'celebrate'
    ? anim.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] })
    : anim.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }, { rotate }] }}>
      {children}
    </Animated.View>
  );
}

export function PenguinFamily({ size = 160, mood = 'happy' as Mood, animated = false }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Penguin size={size} mood={mood} role="main" animated={animated} />
      <View style={{ marginLeft: -size * 0.20, marginBottom: size * 0.10 }}>
        <Penguin size={size * 0.60} mood={mood === 'sleeping' ? 'sleeping' : 'happy'} role="child" animated={animated} />
      </View>
    </View>
  );
}
