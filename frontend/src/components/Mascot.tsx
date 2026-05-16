// Original YeaAmigo penguin mascot — vector SVG, multiple moods.
// Plump round body, button eyes, tiny scarf — friendly, family-friendly, original.
import React from 'react';
import Svg, { Circle, Ellipse, Path, G, Rect } from 'react-native-svg';
import { View } from 'react-native';
import { colors } from '../theme';

export type Mood = 'happy' | 'hungry' | 'searching' | 'celebrate' | 'waiting' | 'sorry' | 'sleeping';

export function Penguin({ size = 120, mood = 'happy', scarf = colors.accent }: { size?: number; mood?: Mood; scarf?: string }) {
  const body = '#1B2438';
  const belly = '#F4ECDC';
  const beak = '#F4C95D';
  const cheek = '#F4A6B8';
  const eyeWhite = '#FFFFFF';

  // Eyes per mood
  const eye = (cx: number) => {
    if (mood === 'sleeping') return <Path d={`M${cx - 4} 50 q4 -4 8 0`} stroke={body} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
    if (mood === 'celebrate') return <Path d={`M${cx - 3} 52 q3 -5 6 0`} stroke={body} strokeWidth={1.8} fill="none" strokeLinecap="round" />;
    return (
      <G>
        <Circle cx={cx} cy={50} r={4} fill={eyeWhite} />
        <Circle cx={cx + (mood === 'searching' ? 1 : 0)} cy={50 + (mood === 'hungry' ? 1 : 0)} r={2.2} fill={body} />
      </G>
    );
  };

  // Mouth per mood
  let mouth: React.ReactNode = null;
  if (mood === 'happy' || mood === 'celebrate') {
    mouth = <Path d="M44 64 q6 5 12 0" stroke={body} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
  } else if (mood === 'hungry') {
    mouth = <Path d="M46 65 q4 4 8 0" stroke={body} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
  } else if (mood === 'sorry' || mood === 'waiting') {
    mouth = <Path d="M44 66 q6 -3 12 0" stroke={body} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
  } else if (mood === 'searching') {
    mouth = <Circle cx={50} cy={64} r={1.8} fill={body} />;
  }

  // Sparkles for celebrate
  const sparkles = mood === 'celebrate' ? (
    <G>
      <Circle cx={18} cy={20} r={2} fill={colors.accent} />
      <Circle cx={82} cy={22} r={2.5} fill={colors.berry} />
      <Circle cx={86} cy={56} r={2} fill={colors.brand} />
      <Circle cx={14} cy={60} r={1.8} fill={colors.accent} />
    </G>
  ) : null;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {sparkles}
        {/* Body */}
        <Ellipse cx={50} cy={62} rx={28} ry={32} fill={body} />
        {/* Belly */}
        <Ellipse cx={50} cy={68} rx={18} ry={24} fill={belly} />
        {/* Head highlight */}
        <Ellipse cx={50} cy={46} rx={22} ry={20} fill={body} />
        <Ellipse cx={50} cy={50} rx={14} ry={12} fill={belly} />
        {/* Cheeks */}
        <Circle cx={34} cy={58} r={3.2} fill={cheek} opacity={0.7} />
        <Circle cx={66} cy={58} r={3.2} fill={cheek} opacity={0.7} />
        {/* Eyes */}
        {eye(42)}
        {eye(58)}
        {/* Beak */}
        <Path d="M47 56 L53 56 L50 62 Z" fill={beak} />
        {/* Mouth */}
        {mouth}
        {/* Wings */}
        <Ellipse cx={22} cy={64} rx={6} ry={14} fill={body} />
        <Ellipse cx={78} cy={64} rx={6} ry={14} fill={body} />
        {/* Feet */}
        <Ellipse cx={40} cy={94} rx={6} ry={3} fill={beak} />
        <Ellipse cx={60} cy={94} rx={6} ry={3} fill={beak} />
        {/* Scarf */}
        <Rect x={28} y={70} width={44} height={6} fill={scarf} rx={3} />
        <Path d="M68 76 L74 86 L66 80 Z" fill={scarf} />
      </Svg>
    </View>
  );
}

// Two penguins side-by-side (parent + child)
export function PenguinFamily({ size = 160, mood = 'happy' as Mood }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Penguin size={size} mood={mood} scarf={colors.accent} />
      <View style={{ marginLeft: -size * 0.18, marginBottom: size * 0.08 }}>
        <Penguin size={size * 0.62} mood={mood === 'sleeping' ? 'sleeping' : 'happy'} scarf={colors.berry} />
      </View>
    </View>
  );
}
