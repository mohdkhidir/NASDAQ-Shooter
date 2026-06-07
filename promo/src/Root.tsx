import React from 'react';
import { Composition, Series, AbsoluteFill } from 'remotion';
import { Hook } from './scenes/Hook';
import { StockGame } from './scenes/StockGame';
import { RealEstate } from './scenes/RealEstate';
import { Leaderboard } from './scenes/Leaderboard';
import { CTA } from './scenes/CTA';

// TikTok vertical format: 1080x1920, 30fps
// Total: 30s = 900 frames
// Hook: 3s (90f) | Stock: 7s (210f) | RE: 7s (210f) | LB: 6s (180f) | CTA: 7s (210f)

const TRANSITION_FRAMES = 8;

const Fade: React.FC<{ children: React.ReactNode; durationIn?: number; durationOut?: number }> = ({
  children, durationIn = TRANSITION_FRAMES,
}) => {
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const NasdaqPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#04000c' }}>
      <Series>
        <Series.Sequence durationInFrames={90}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <StockGame />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <RealEstate />
        </Series.Sequence>
        <Series.Sequence durationInFrames={180}>
          <Leaderboard />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <CTA />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NasdaqPromo"
      component={NasdaqPromo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
};
