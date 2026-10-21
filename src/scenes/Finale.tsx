import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {ShaderBackground} from '../components/ShaderBackground';
import {KineticText} from '../components/Kinetic';
import {useSpectrum} from '../components/useSpectrum';
import {C, FONT} from '../theme';

const BINS = 96;

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const spec = useSpectrum(128);
  const bass = Math.min(1, (spec[0] + spec[1] + spec[2]) * 1.4);
  const ringIn = spring({frame: frame - 5, fps, config: {damping: 20}});
  const credits = interpolate(frame, [230, 260], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blackout = interpolate(frame, [400, 445], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const R = 300 + bass * 30;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <ShaderBackground pulse={bass * 1.2} tint={[1.3, 0.7, 1.1]} zoom={1.2} speed={1.6} opacity={0.75} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <filter id="fglow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <g transform={`translate(960 470) rotate(${frame * 0.3}) scale(${ringIn})`} filter="url(#fglow)">
          {Array.from({length: BINS}, (_, i) => {
            const a = (i / BINS) * Math.PI * 2;
            const bin = i < BINS / 2 ? i : BINS - i; // mirror so the ring is symmetric
            const v = Math.min(1, (spec[bin + 1] ?? 0) * 4);
            const len = 14 + v * 190;
            const hue = 180 + (bin / (BINS / 2)) * 150;
            return (
              <line key={i} x1={Math.cos(a) * R} y1={Math.sin(a) * R} x2={Math.cos(a) * (R + len)} y2={Math.sin(a) * (R + len)}
                stroke={`hsl(${hue}, 95%, 62%)`} strokeWidth={9} strokeLinecap="round" />
            );
          })}
          <circle r={R - 18} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
        </g>
      </svg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', top: -110}}>
        <KineticText text="Code is the camera." size={86} font={FONT.display} weight={700} delay={20} stagger={2} seed="f1" glow="rgba(255,255,255,0.35)" />
        <div style={{height: 10}} />
        <KineticText text="代码即镜头" size={72} font={FONT.cjk} weight={900} delay={60} stagger={6} seed="f2" letterSpacing={24} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', opacity: credits, fontFamily: FONT.mono, fontSize: 22, color: C.dim, lineHeight: 1.8}}>
        <div style={{color: C.ink, fontSize: 26}}>Remotion 4.0.537 · React 19 · three.js · WebGL/GLSL · @remotion/noise · @remotion/paths · @remotion/transitions</div>
        <div>Soundtrack synthesized from scratch in Python/numpy · CO₂ data: NOAA GML</div>
        <div style={{fontFamily: FONT.cjk}}>由 AI 智能体编写与渲染 · 2026-10-21</div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: blackout}} />
    </AbsoluteFill>
  );
};
