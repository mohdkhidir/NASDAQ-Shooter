import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

const PRICES = [100,98,102,97,105,108,104,112,109,118,115,122,119,130,127,138,135,145,142,155,152,162,158,172,168,180,176,188,185,198,194,208,204,218,215,228,224,238,235,250];

export const StockChart: React.FC<{
  width: number;
  height: number;
  startFrame: number;
  durationFrames: number;
  color?: string;
}> = ({ width, height, startFrame, durationFrames, color = '#3fb950' }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const visibleCount = Math.max(2, Math.floor(progress * PRICES.length));
  const pts = PRICES.slice(0, visibleCount);

  const minP = Math.min(...PRICES);
  const maxP = Math.max(...PRICES);
  const pad = 10;

  const toX = (i: number) => pad + (i / (PRICES.length - 1)) * (width - pad * 2);
  const toY = (v: number) => height - pad - ((v - minP) / (maxP - minP)) * (height - pad * 2);

  const linePts = pts.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPath = pts.length > 1
    ? `M ${toX(0)},${height - pad} ` +
      pts.map((v, i) => `L ${toX(i)},${toY(v)}`).join(' ') +
      ` L ${toX(pts.length - 1)},${height - pad} Z`
    : '';

  const gradId = `cg-${color.replace('#','')}`;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {areaPath && (
        <path d={areaPath} fill={`url(#${gradId})`} />
      )}
      {pts.length > 1 && (
        <polyline
          points={linePts}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {pts.length > 0 && (
        <circle
          cx={toX(pts.length - 1)}
          cy={toY(pts[pts.length - 1])}
          r={6}
          fill={color}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      )}
    </svg>
  );
};
