import {staticFile, useVideoConfig} from 'remotion';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {useGlobalFrame} from './GlobalFrame';

export const SOUNDTRACK = staticFile('soundtrack.mp3');

/** Returns `n` frequency magnitudes (0..1) for the current absolute frame, or zeros while loading. */
export const useSpectrum = (n = 64): number[] => {
  const audioData = useAudioData(SOUNDTRACK);
  const frame = useGlobalFrame();
  const {fps} = useVideoConfig();
  if (!audioData) return new Array(n).fill(0);
  return visualizeAudio({fps, frame, audioData, numberOfSamples: n, optimizeFor: 'speed'});
};

/** Low-end energy, handy for beat pulses. */
export const useBass = () => {
  const s = useSpectrum(32);
  return Math.min(1, (s[0] + s[1] + s[2]) * 1.4);
};
