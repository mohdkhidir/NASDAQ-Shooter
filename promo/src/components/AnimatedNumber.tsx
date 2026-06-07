import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Props {
  from: number;
  to: number;
  startFrame: number;
  endFrame: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: React.CSSProperties;
}

export const AnimatedNumber: React.FC<Props> = ({
  from, to, startFrame, endFrame, prefix = '', suffix = '', decimals = 0, style,
}) => {
  const frame = useCurrentFrame();
  const val = interpolate(frame, [startFrame, endFrame], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const formatted = val >= 1e6
    ? prefix + (val / 1e6).toFixed(2) + 'M' + suffix
    : val >= 1e3
    ? prefix + (val / 1e3).toFixed(1) + 'K' + suffix
    : prefix + val.toFixed(decimals) + suffix;
  return <span style={style}>{formatted}</span>;
};
