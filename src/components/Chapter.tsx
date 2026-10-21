import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, FONT} from '../theme';

/** Chapter heading: index number, English title, Chinese subtitle, animated underline. */
export const Chapter: React.FC<{index: string; en: string; zh: string; color: string; out: number}> = ({index, en, zh, color, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 6, fps, config: {damping: 200}});
  const line = interpolate(frame, [10, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp)});
  const exit = interpolate(frame, [out, out + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  return (
    <div style={{position: 'absolute', left: 110, top: 90, opacity: 1 - exit, transform: `translateY(${exit * -30}px)`}}>
      <div style={{fontFamily: FONT.mono, fontSize: 26, color, letterSpacing: 6, opacity: s}}>{index}</div>
      <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 64, color: C.ink, marginTop: 6,
        transform: `translateX(${(1 - s) * -60}px)`, opacity: s}}>{en}</div>
      <div style={{fontFamily: FONT.cjk, fontWeight: 700, fontSize: 40, color: C.dim, marginTop: 2, letterSpacing: 8,
        transform: `translateX(${(1 - s) * -90}px)`, opacity: s}}>{zh}</div>
      <div style={{height: 4, width: 420 * line, background: `linear-gradient(90deg, ${color}, transparent)`, marginTop: 18, borderRadius: 2}} />
    </div>
  );
};
