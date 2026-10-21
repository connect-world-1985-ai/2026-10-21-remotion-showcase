import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {evolvePath, getLength, getPointAtLength, getTangentAtLength, interpolatePath} from '@remotion/paths';
import {makeCircle, makeHeart, makePolygon, makeStar} from '@remotion/shapes';
import {Chapter} from '../components/Chapter';
import {C, FONT} from '../theme';

const CX = 1240, CY = 560, SZ = 420;
// center a shape path of given size at (CX, CY)
const centered = (path: string, w: number, h: number) => {
  // translate using a group transform instead of rewriting the path
  return {path, dx: CX - w / 2, dy: CY - h / 2};
};

const lissajous = (a: number, b: number, phase: number, rx: number, ry: number, cx: number, cy: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 400; i++) {
    const t = (i / 400) * Math.PI * 2;
    pts.push(`${i === 0 ? 'M' : 'L'}${(cx + rx * Math.sin(a * t + phase)).toFixed(2)} ${(cy + ry * Math.sin(b * t)).toFixed(2)}`);
  }
  return pts.join(' ');
};

export const Paths: React.FC = () => {
  const frame = useCurrentFrame();
  const shapes = useMemo(() => {
    const s = [
      makePolygon({points: 3, radius: SZ / 2}),
      makeStar({points: 5, innerRadius: SZ * 0.2, outerRadius: SZ / 2}),
      makeHeart({height: SZ * 0.9}),
      makePolygon({points: 6, radius: SZ / 2}),
      makeCircle({radius: SZ / 2}),
    ];
    // re-center each path's bounding box at the origin, then translate to (CX, CY)
    return s.map((x) => {
      const p = centered(x.path, x.width, x.height);
      return {...p};
    });
  }, []);
  const curves = useMemo(() => [
    {d: lissajous(3, 2, Math.PI / 2, 300, 300, 420, 640), color: C.cyan, start: 20},
    {d: lissajous(5, 4, Math.PI / 4, 230, 230, 420, 640), color: C.magenta, start: 50},
    {d: lissajous(1, 3, 0, 160, 160, 420, 640), color: C.amber, start: 80},
  ], []);

  // Morph sequence: draw the first shape, then morph through the rest on the beat (every 60 frames)
  const step = Math.max(0, Math.min(shapes.length - 1, (frame - 120) / 60));
  const i0 = Math.floor(step), i1 = Math.min(shapes.length - 1, i0 + 1);
  const local = interpolate(step - i0, [0, 0.5], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const a = shapes[i0], b = shapes[i1];
  const morph = interpolatePath(local, `${a.path}`, `${b.path}`);
  const dx = interpolate(local, [0, 1], [a.dx, b.dx]);
  const dy = interpolate(local, [0, 1], [a.dy, b.dy]);
  const draw = interpolate(frame, [30, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  const ev = evolvePath(draw, morph);
  const rot = interpolate(frame, [0, 420], [0, 90]);
  const fillOp = interpolate(frame, [100, 140], [0, 0.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 65% 50%, #1a0f2e 0%, #05060f 70%)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={C.cyan} /><stop offset="1" stopColor={C.magenta} />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {curves.map((c, k) => {
          const p = interpolate(frame, [c.start, c.start + 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
          const e = evolvePath(p, c.d);
          const len = getLength(c.d);
          const at = ((frame * 6 + k * 400) % len);
          const pt = getPointAtLength(c.d, at);
          const tan = getTangentAtLength(c.d, at);
          const ang = (Math.atan2(tan?.y ?? 0, tan?.x ?? 1) * 180) / Math.PI;
          return (
            <g key={k}>
              <path d={c.d} fill="none" stroke={c.color} strokeOpacity={0.9} strokeWidth={2.5} strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} filter="url(#glow)" />
              {p >= 1 && pt && (
                <g transform={`translate(${pt.x},${pt.y}) rotate(${ang})`}>
                  <polygon points="14,0 -10,-9 -10,9" fill={c.color} filter="url(#glow)" />
                </g>
              )}
            </g>
          );
        })}
        <g transform={`rotate(${rot} ${CX} ${CY}) translate(${dx},${dy})`}>
          <path d={morph} fill="url(#g1)" fillOpacity={fillOp} stroke="url(#g1)" strokeWidth={6}
            strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} filter="url(#glow)" strokeLinejoin="round" />
        </g>
      </svg>
      <Chapter index="02 / 06" en="SVG path drawing & morphing" zh="路径描绘与形状变形" color={C.magenta} out={390} />
      <div style={{position: 'absolute', right: 120, bottom: 110, textAlign: 'right', fontFamily: FONT.mono, fontSize: 22, color: C.dim, lineHeight: 1.7}}>
        <div>evolvePath() · interpolatePath() · getPointAtLength()</div>
        <div>triangle → star → heart → hexagon → circle</div>
        <div style={{fontFamily: FONT.cjk}}>三角形 → 星形 → 心形 → 六边形 → 圆</div>
      </div>
    </AbsoluteFill>
  );
};
