import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Chapter} from '../components/Chapter';
import {useSpectrum} from '../components/useSpectrum';
import {C, FONT} from '../theme';

const BARS = 48;

export const ThreeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const spec = useSpectrum(64);
  const intro = spring({frame: frame - 10, fps, config: {damping: 14, mass: 1.2}});
  const t = frame / fps;
  const camAng = t * 0.35;
  const camR = interpolate(frame, [0, 510], [11, 7.5], {easing: Easing.inOut(Easing.cubic)});
  const knots = useMemo(() => Array.from({length: 6}, (_, i) => i), []);
  const fadeIn = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #10183a 0%, #03040a 75%)'}}>
      <AbsoluteFill style={{opacity: fadeIn}}>
        <ThreeCanvas width={width} height={height} linear={false}
          camera={{fov: 45, position: [0, 2.2, 11], near: 0.1, far: 100}}>
          <CameraLook x={Math.sin(camAng) * camR} y={2.2 + Math.sin(t * 0.5) * 0.8} z={Math.cos(camAng) * camR} />
          <ambientLight intensity={0.6} />
          <hemisphereLight args={['#7fdcff', '#2a0b3a', 0.8]} />
          <pointLight position={[5, 5, 5]} intensity={120} color={C.cyan} />
          <pointLight position={[-6, -3, 2]} intensity={120} color={C.magenta} />
          <directionalLight position={[0, 8, -4]} intensity={1.2} color={C.amber} />
          {/* central crystal */}
          <group scale={intro * (1 + spec[0] * 0.35)} rotation={[t * 0.4, t * 0.6, 0]}>
            <mesh>
              <icosahedronGeometry args={[1.5, 1]} />
              <meshStandardMaterial color="#3a4fb0" metalness={0.35} roughness={0.3} emissive="#1a2a80" emissiveIntensity={0.5 + spec[1] * 1.5} flatShading />
            </mesh>
            <mesh scale={1.02}>
              <icosahedronGeometry args={[1.5, 1]} />
              <meshBasicMaterial color={C.cyan} wireframe transparent opacity={0.6} />
            </mesh>
          </group>
          {/* orbiting torus knots */}
          {knots.map((i) => {
            const a = (i / knots.length) * Math.PI * 2 + t * 0.6;
            const r = 3.4;
            return (
              <mesh key={i} position={[Math.cos(a) * r, Math.sin(a * 2 + i) * 0.6, Math.sin(a) * r]}
                rotation={[t * (1 + i * 0.1), t * 0.7, 0]} scale={intro * 0.42}>
                <torusKnotGeometry args={[0.6, 0.2, 128, 16, 2 + (i % 3), 3]} />
                <meshStandardMaterial color={[C.cyan, C.magenta, C.amber, C.violet, C.lime, '#ff7a45'][i]} metalness={0.6} roughness={0.25} emissive={[C.cyan, C.magenta, C.amber, C.violet, C.lime, '#ff7a45'][i]} emissiveIntensity={0.15} />
              </mesh>
            );
          })}
          {/* audio-reactive ring of bars: each bar's height = one FFT bin of the soundtrack */}
          {Array.from({length: BARS}, (_, i) => {
            const a = (i / BARS) * Math.PI * 2;
            const v = spec[Math.floor(i / 2) + 1] ?? 0; // mirror-ish distribution
            const hgt = 0.15 + Math.min(1, v * 3) * 2.6;
            const appear = spring({frame: frame - 40 - i, fps, config: {damping: 18}});
            return (
              <mesh key={i} position={[Math.cos(a) * 5.4, -1.6 + (hgt * appear) / 2, Math.sin(a) * 5.4]} rotation={[0, -a, 0]} scale={[1, Math.max(0.001, appear), 1]}>
                <boxGeometry args={[0.22, hgt, 0.22]} />
                <meshStandardMaterial color={new THREE.Color().setHSL(0.5 + (i / BARS) * 0.4, 0.9, 0.55)} emissive={new THREE.Color().setHSL(0.5 + (i / BARS) * 0.4, 0.9, 0.4)} emissiveIntensity={0.6 + v * 2} />
              </mesh>
            );
          })}
          <gridHelper args={[30, 30, '#1e2a5a', '#121a3a']} position={[0, -1.62, 0]} />
        </ThreeCanvas>
      </AbsoluteFill>
      <Chapter index="05 / 06" en="Three.js inside React" zh="三维场景 · 随音乐律动" color={C.violet} out={470} />
      <div style={{position: 'absolute', right: 120, bottom: 100, textAlign: 'right', fontFamily: FONT.mono, fontSize: 22, color: C.dim, lineHeight: 1.7}}>
        <div>@remotion/three · react-three-fiber · WebGL (SwiftShader)</div>
        <div>ring bars = live FFT of the soundtrack (visualizeAudio)</div>
        <div style={{fontFamily: FONT.cjk}}>光柱高度 = 音轨实时频谱</div>
      </div>
    </AbsoluteFill>
  );
};

const CameraLook: React.FC<{x: number; y: number; z: number}> = ({x, y, z}) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return null;
};
