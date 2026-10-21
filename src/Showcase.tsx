import React from 'react';
import {AbsoluteFill, Audio, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {flip} from '@remotion/transitions/flip';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {iris} from '@remotion/transitions/iris';
import {GlobalFrameProvider} from './components/GlobalFrame';
import {Hud} from './components/Hud';
import {SOUNDTRACK} from './components/useSpectrum';
import {Intro} from './scenes/Intro';
import {Springs} from './scenes/Springs';
import {Paths} from './scenes/Paths';
import {DataViz} from './scenes/DataViz';
import {Particles} from './scenes/Particles';
import {ThreeScene} from './scenes/ThreeScene';
import {Finale} from './scenes/Finale';
import {SCENES, TRANSITION} from './theme';

export const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const lin = linearTiming({durationInFrames: TRANSITION});
  const spr = springTiming({durationInFrames: TRANSITION, config: {damping: 200}});
  return (
    <GlobalFrameProvider frame={frame}>
      <AbsoluteFill style={{background: '#05060f'}}>
        <Audio src={SOUNDTRACK} />
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={SCENES.intro}><Intro /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={iris({width, height})} timing={lin} />
          <TransitionSeries.Sequence durationInFrames={SCENES.springs}><Springs /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={spr} />
          <TransitionSeries.Sequence durationInFrames={SCENES.paths}><Paths /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={wipe({direction: 'from-bottom-left'})} timing={lin} />
          <TransitionSeries.Sequence durationInFrames={SCENES.data}><DataViz /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={lin} />
          <TransitionSeries.Sequence durationInFrames={SCENES.particles}><Particles /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={flip({direction: 'from-left'})} timing={spr} />
          <TransitionSeries.Sequence durationInFrames={SCENES.three}><ThreeScene /></TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={clockWipe({width, height})} timing={lin} />
          <TransitionSeries.Sequence durationInFrames={SCENES.finale}><Finale /></TransitionSeries.Sequence>
        </TransitionSeries>
        <Hud />
      </AbsoluteFill>
    </GlobalFrameProvider>
  );
};
