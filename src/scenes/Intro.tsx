import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {ShaderBackground} from '../components/ShaderBackground';
import {KineticText, TypeOn} from '../components/Kinetic';
import {useBass} from '../components/useSpectrum';
import {C, FONT} from '../theme';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const bass = useBass();
  const zoom = interpolate(frame, [0, 390], [1.6, 1.0], {easing: Easing.out(Easing.cubic)});
  const fadeIn = interpolate(frame, [0, 45], [0, 1], {extrapolateRight: 'clamp'});
  const rule = interpolate(frame, [70, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const exit = interpolate(frame, [340, 380], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <ShaderBackground zoom={zoom} pulse={bass} opacity={fadeIn} tint={[0.7, 0.85, 1.3]} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: 14, color: C.cyan, opacity: interpolate(frame, [20, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * (1 - exit), marginBottom: 30}}>
          REMOTION · CEILING TEST · 2026
        </div>
        <KineticText text="THE MAKING" size={150} font={FONT.display} weight={700} delay={30} stagger={3} seed="a" exitAt={330} glow="rgba(56,232,255,0.35)" letterSpacing={6} />
        <KineticText text="OF MOTION" size={150} font={FONT.display} weight={700} delay={48} stagger={3} seed="b" exitAt={334} glow="rgba(255,61,154,0.35)" letterSpacing={6} />
        <div style={{width: 760 * rule, height: 2, background: `linear-gradient(90deg, transparent, ${C.ink}, transparent)`, margin: '34px 0 26px', opacity: 1 - exit}} />
        <KineticText text="运动的诞生" size={84} font={FONT.cjk} weight={900} delay={95} stagger={6} seed="c" exitAt={338} letterSpacing={30} color={C.ink} />
        <div style={{marginTop: 46, fontFamily: FONT.mono, fontSize: 28, color: C.dim, opacity: 1 - exit, height: 40}}>
          <TypeOn delay={150} cps={34} text="7 scenes · 100 seconds · every pixel is a React component" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
