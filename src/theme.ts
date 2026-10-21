import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

// Latin fonts come from @remotion/google-fonts (Latin subset only, few weights).
const inter = loadInter('normal', {weights: ['400', '700', '900'], subsets: ['latin']});
const grotesk = loadGrotesk('normal', {weights: ['500', '700'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['400', '700'], subsets: ['latin']});

// CJK: Noto Sans SC on Google Fonts is split into ~100 unicode-range chunks per weight,
// which would make every render tab download dozens of files. We instead fall back to the
// locally installed "Noto Sans CJK SC" (same typeface family, via fontconfig).
const CJK = '"Noto Sans CJK SC", "Noto Sans SC", "Source Han Sans SC", sans-serif';

export const FONT = {
  sans: `${inter.fontFamily}, ${CJK}`,
  display: `${grotesk.fontFamily}, ${CJK}`,
  mono: `${mono.fontFamily}, ${CJK}`,
  cjk: CJK,
};

export const C = {
  bg: '#05060f',
  ink: '#f4f1ea',
  dim: 'rgba(244,241,234,0.55)',
  cyan: '#38e8ff',
  magenta: '#ff3d9a',
  amber: '#ffb547',
  violet: '#8b5cff',
  lime: '#b6ff5c',
};

export const FPS = 30;
export const BEAT = 15; // 120 BPM at 30 fps
export const TRANSITION = 30;
// Scene lengths (frames). Sum minus 6 transitions of 30 frames = 3000 frames = 100 s.
export const SCENES = {
  intro: 390,
  springs: 450,
  paths: 420,
  data: 540,
  particles: 420,
  three: 510,
  finale: 450,
};
export const TOTAL =
  Object.values(SCENES).reduce((a, b) => a + b, 0) - 6 * TRANSITION;
