import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {random} from 'remotion';

/** Per-character kinetic text: each glyph springs in from a random 3D offset, staggered. */
export const KineticText: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size: number;
  font: string;
  color?: string;
  weight?: number;
  seed?: string;
  exitAt?: number;
  letterSpacing?: number;
  glow?: string;
}> = ({text, delay = 0, stagger = 2, size, font, color = '#fff', weight = 800, seed = 'k', exitAt, letterSpacing = 0, glow}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chars = Array.from(text);
  return (
    <div style={{display: 'flex', justifyContent: 'center', perspective: 900, fontFamily: font,
      fontSize: size, fontWeight: weight, color, letterSpacing, whiteSpace: 'pre'}}>
      {chars.map((ch, i) => {
        const s = spring({frame: frame - delay - i * stagger, fps, config: {damping: 12, mass: 0.6, stiffness: 120}});
        const rx = (random(`${seed}x${i}`) - 0.5) * 160;
        const ry = (random(`${seed}y${i}`) - 0.5) * 220;
        const rz = (random(`${seed}z${i}`) - 0.5) * 90;
        let out = 0;
        if (exitAt !== undefined) {
          out = interpolate(frame, [exitAt + i * 1, exitAt + i * 1 + 14], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
        }
        return (
          <span key={i} style={{
            display: 'inline-block',
            transform: `translate3d(0, ${(1 - s) * ry + out * -120}px, ${(1 - s) * -600}px) rotateX(${(1 - s) * rx}deg) rotateZ(${(1 - s) * rz}deg)`,
            opacity: Math.min(1, s * 1.4) * (1 - out),
            filter: `blur(${(1 - Math.min(1, s)) * 12 + out * 10}px)`,
            textShadow: glow ? `0 0 ${24}px ${glow}, 0 0 ${60}px ${glow}` : undefined,
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

/** A label that types itself out like a terminal. */
export const TypeOn: React.FC<{text: string; delay?: number; cps?: number; style?: React.CSSProperties}> = ({text, delay = 0, cps = 30, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - delay) / fps) * cps));
  const shown = Array.from(text).slice(0, n).join('');
  const caret = n < text.length || Math.floor(frame / 15) % 2 === 0;
  return <span style={style}>{shown}<span style={{opacity: caret ? 1 : 0}}>▍</span></span>;
};
