import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const PLAYERS = [
  { rank: 1,  name: 'StockKing99',  worth: '$4.2M',   ret: '+4,200%', avi: '👑', color: '#ffd700' },
  { rank: 2,  name: 'WallStWolf',   worth: '$3.1M',   ret: '+3,100%', avi: '🐺', color: '#c0c0c0' },
  { rank: 3,  name: 'BullMarket',   worth: '$2.8M',   ret: '+2,800%', avi: '🐂', color: '#cd7f32' },
  { rank: 4,  name: 'TechTrader',   worth: '$1.9M',   ret: '+1,900%', avi: '🤖', color: '#58a6ff' },
  { rank: 5,  name: 'YOU?',         worth: '???',     ret: '???',     avi: '❓', color: '#8338ec', you: true },
];

export const Leaderboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0d1117 0%, #04000c 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Animated confetti dots */}
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 8, height: 8, borderRadius: '50%',
          left: `${(i * 17 + 5) % 95}%`,
          top: `${(i * 13 + 10) % 80}%`,
          background: ['#ffd700', '#3fb950', '#58a6ff', '#f85149', '#a78bfa'][i % 5],
          opacity: 0.3 + (Math.sin(frame / 20 + i) + 1) * 0.15,
          transform: `scale(${1 + Math.sin(frame / 15 + i) * 0.3})`,
        }} />
      ))}

      {/* Header */}
      <div style={{
        padding: '60px 48px 28px',
        opacity: titleOpacity, zIndex: 10, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 80, marginBottom: 12,
          filter: `drop-shadow(0 0 24px rgba(255,215,0,.6))`,
        }}>🏆</div>
        <div style={{
          fontSize: 52, fontWeight: 900, color: '#ffd700',
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '.06em', textTransform: 'uppercase',
          filter: 'drop-shadow(0 0 20px rgba(255,215,0,.4))',
        }}>
          LEADERBOARD
        </div>
        <div style={{ fontSize: 24, color: '#8b949e', marginTop: 8 }}>
          Compete with players worldwide
        </div>
      </div>

      {/* Player rows */}
      <div style={{
        padding: '0 48px', display: 'flex', flexDirection: 'column', gap: 18, zIndex: 10,
      }}>
        {PLAYERS.map((p, i) => {
          const delay = 12 + i * 10;
          const appear = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 90 }, durationInFrames: 20 });
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const isYou = (p as any).you;

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: isYou
                ? 'linear-gradient(135deg, rgba(131,56,236,.18), rgba(58,134,255,.1))'
                : 'rgba(22,27,34,.8)',
              border: isYou
                ? '2px solid rgba(131,56,236,.6)'
                : `1px solid rgba(255,255,255,.06)`,
              borderRadius: 20, padding: '18px 24px',
              opacity,
              transform: `scale(${appear}) translateX(${interpolate(appear, [0, 1], [-80, 0])}px)`,
              boxShadow: isYou ? '0 0 30px rgba(131,56,236,.2)' : 'none',
            }}>
              {/* Rank */}
              <div style={{
                width: 56, textAlign: 'center',
                fontSize: p.rank <= 3 ? 36 : 28,
                fontWeight: 900,
                color: p.color,
                fontFamily: 'monospace',
                filter: p.rank <= 3 ? `drop-shadow(0 0 10px ${p.color})` : 'none',
              }}>
                {p.rank <= 3 ? ['🥇','🥈','🥉'][p.rank - 1] : `#${p.rank}`}
              </div>

              {/* Avatar */}
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: `${p.color}22`,
                border: `2px solid ${p.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30,
              }}>
                {p.avi}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 28, fontWeight: 800,
                  color: isYou ? '#c084fc' : '#e6edf3',
                }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 20, color: '#3fb950', fontWeight: 600, marginTop: 4 }}>
                  {p.ret}
                </div>
              </div>

              {/* Worth */}
              <div style={{
                fontSize: 30, fontWeight: 900, fontFamily: 'monospace',
                color: isYou ? '#c084fc' : '#e6edf3',
              }}>
                {p.worth}
              </div>
            </div>
          );
        })}
      </div>

      {/* Challenge text */}
      <div style={{
        position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center',
        opacity: interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(frame, [55, 68], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
        zIndex: 10,
      }}>
        <div style={{
          fontSize: 36, fontWeight: 800, color: '#fff',
          background: 'linear-gradient(135deg, #8338ec, #3a86ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Can you reach the top?
        </div>
      </div>
    </div>
  );
};
