import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {Chapter} from '../components/Chapter';
import {CO2} from '../data/co2';
import {C, FONT} from '../theme';

const X0 = 200, X1 = 1500, Y0 = 930, Y1 = 330;
const MIN = 300, MAX = 440;
const sx = (year: number) => X0 + ((year - 1959) / (2025 - 1959)) * (X1 - X0);
const sy = (ppm: number) => Y0 - ((ppm - MIN) / (MAX - MIN)) * (Y0 - Y1);

export const DataViz: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = useMemo(() => CO2.map((p, i) => `${i ? 'L' : 'M'}${sx(p.year).toFixed(1)} ${sy(p.ppm).toFixed(1)}`).join(' '), []);
  // milestones computed from the data itself (first year at or above threshold)
  const milestones = useMemo(() => [350, 400].map((th) => CO2.find((p) => p.ppm >= th)!), []);
  const first = CO2[0], last = CO2[CO2.length - 1];
  const decades = useMemo(() => {
    const out: {label: string; delta: number}[] = [];
    for (let y = 1960; y < 2020; y += 10) {
      const a = CO2.find((p) => p.year === y)!, b = CO2.find((p) => p.year === y + 10)!;
      out.push({label: `${y}s`, delta: b.ppm - a.ppm});
    }
    return out;
  }, []);

  const prog = interpolate(frame, [40, 330], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  const idx = Math.min(CO2.length - 1, Math.floor(prog * (CO2.length - 1)));
  const cur = CO2[idx];
  const ev = evolvePath(prog, d);
  const axes = spring({frame: frame - 10, fps, config: {damping: 200}});
  const areaClip = X0 + prog * (X1 - X0);
  const bars = spring({frame: frame - 330, fps, config: {damping: 16}});
  const exitO = interpolate(frame, [500, 530], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const maxDelta = Math.max(...decades.map((x) => x.delta));

  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #071a1f 0%, #05060f 60%)'}}>
      <Chapter index="03 / 06" en="Real data, animated" zh="真实数据 · 动态图表" color={C.amber} out={500} />
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: exitO}}>
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={C.amber} stopOpacity={0.45} /><stop offset="1" stopColor={C.amber} stopOpacity={0} />
          </linearGradient>
          <clipPath id="reveal"><rect x={0} y={0} width={areaClip} height={1080} /></clipPath>
        </defs>
        {[300, 320, 340, 360, 380, 400, 420, 440].map((v) => (
          <g key={v} opacity={axes}>
            <line x1={X0} x2={X0 + (X1 - X0) * axes} y1={sy(v)} y2={sy(v)} stroke="rgba(255,255,255,0.08)" />
            <text x={X0 - 18} y={sy(v) + 7} fill={C.dim} fontSize={20} textAnchor="end" fontFamily={FONT.mono}>{v}</text>
          </g>
        ))}
        {[1960, 1970, 1980, 1990, 2000, 2010, 2020].map((y) => (
          <text key={y} x={sx(y)} y={Y0 + 40} fill={C.dim} fontSize={20} textAnchor="middle" fontFamily={FONT.mono} opacity={axes}>{y}</text>
        ))}
        <text x={X0 - 18} y={Y1 - 30} fill={C.dim} fontSize={20} textAnchor="end" fontFamily={FONT.mono} opacity={axes}>ppm</text>
        <path d={`${d} L${sx(2025)} ${Y0} L${X0} ${Y0} Z`} fill="url(#area)" clipPath="url(#reveal)" />
        <path d={d} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} strokeLinejoin="round" />
        {milestones.map((m) => {
          const show = interpolate(frame, [40 + ((m.year - 1959) / 66) * 290, 55 + ((m.year - 1959) / 66) * 290], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <g key={m.year} opacity={show}>
              <line x1={sx(m.year)} x2={sx(m.year)} y1={sy(m.ppm)} y2={sy(m.ppm) - 90 * show} stroke={C.ink} strokeDasharray="4 4" />
              <text x={sx(m.year)} y={sy(m.ppm) - 100} fill={C.ink} fontSize={22} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700}>
                {m.year}: {m.ppm.toFixed(2)} ppm
              </text>
            </g>
          );
        })}
        <circle cx={sx(cur.year)} cy={sy(cur.ppm)} r={10} fill={C.amber} style={{filter: `drop-shadow(0 0 12px ${C.amber})`}} />
      </svg>
      {/* big counters */}
      <div style={{position: 'absolute', left: 260, top: 360, opacity: exitO}}>
        <div style={{fontFamily: FONT.display, fontSize: 120, fontWeight: 700, color: C.ink, lineHeight: 1}}>
          {cur.ppm.toFixed(2)}<span style={{fontSize: 40, color: C.dim}}> ppm</span>
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 36, color: C.amber}}>{cur.year}</div>
      </div>
      {/* decade increase mini-bars, derived from the same data */}
      <div style={{position: 'absolute', left: 1580, top: 380, width: 280, opacity: exitO}}>
        <div style={{fontFamily: FONT.sans, fontSize: 20, color: C.dim, marginBottom: 14, opacity: bars}}>Rise per decade (ppm)<br /><span style={{fontFamily: FONT.cjk}}>每十年上升量</span></div>
        {decades.map((x, i) => {
          const s = spring({frame: frame - 330 - i * 5, fps, config: {damping: 14}});
          return (
            <div key={x.label} style={{display: 'flex', alignItems: 'center', marginBottom: 12, opacity: Math.min(1, s)}}>
              <div style={{width: 70, fontFamily: FONT.mono, fontSize: 18, color: C.dim}}>{x.label}</div>
              <div style={{height: 22, width: (x.delta / maxDelta) * 150 * s, background: `linear-gradient(90deg, ${C.amber}, ${C.magenta})`, borderRadius: 3}} />
              <div style={{marginLeft: 8, fontFamily: FONT.mono, fontSize: 18, color: C.ink}}>{x.delta.toFixed(1)}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 200, bottom: 50, fontFamily: FONT.sans, fontSize: 19, color: C.dim, opacity: exitO}}>
        Data: NOAA Global Monitoring Laboratory · Mauna Loa annual mean CO₂ {first.year}–{last.year} (gml.noaa.gov). Values plotted as published, no smoothing.
        <span style={{fontFamily: FONT.cjk}}>　数据来源：美国国家海洋和大气管理局 冒纳罗亚观测站</span>
      </div>
    </AbsoluteFill>
  );
};
