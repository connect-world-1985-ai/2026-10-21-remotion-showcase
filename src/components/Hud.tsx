import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {useSpectrum} from './useSpectrum';
import {C, FONT, TOTAL} from '../theme';

/** Global overlay: timecode, progress bar and a thin audio spectrum strip at the bottom. */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const spec = useSpectrum(64);
  const s = Math.floor(frame / 30), f = frame % 30;
  const tc = `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  const op = interpolate(frame, [60, 90, TOTAL - 120, TOTAL - 60], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: op}}>
      <div style={{position: 'absolute', right: 70, top: 50, fontFamily: FONT.mono, fontSize: 20, color: 'rgba(255,255,255,0.55)', letterSpacing: 2}}>
        ● REC {tc} · F{String(frame).padStart(4, '0')}
      </div>
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 4, width: `${(frame / TOTAL) * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.magenta})`}} />
      <div style={{position: 'absolute', right: 70, bottom: 24, display: 'flex', alignItems: 'flex-end', gap: 3, height: 40}}>
        {spec.slice(0, 40).map((v, i) => (
          <div key={i} style={{width: 4, height: 2 + Math.min(1, v * 4) * 38, background: 'rgba(255,255,255,0.6)', borderRadius: 2}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
