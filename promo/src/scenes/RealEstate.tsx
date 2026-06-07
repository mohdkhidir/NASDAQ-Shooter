import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { AnimatedNumber } from '../components/AnimatedNumber';

const PROPERTIES = [
  { name: 'Downtown Office', type: '🏢', income: '$12,400/day', value: '$2.4M',  level: 5, color: '#a78bfa' },
  { name: 'Luxury Hotel',    type: '🏨', income: '$8,600/day',  value: '$1.8M',  level: 4, color: '#f59e0b' },
  { name: 'Shopping Mall',   type: '🏬', income: '$6,200/day',  value: '$1.1M',  level: 3, color: '#38bdf8' },
  { name: 'Apartments',      type: '🏠', income: '$3,100/day',  value: '$640K',  level: 2, color: '#3fb950' },
];

const FLOATS = ['+$12,400', '+$8,600', '+$6,200', '+$3,100', '+$4,500', '+$9,800'];

export const RealEstate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = (offset: number) =>
    interpolate(frame, [offset, offset + 40], [0, -200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const floatOpacity = (offset: number) => {
    const progress = (frame - offset) / 40;
    if (progress < 0) return 0;
    if (progress > 1) return 0;
    return progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #060d18 0%, #0c1524 60%, #060d18 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Gold ambient glow */}
      <div style={{
        position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 600,
        background: 'radial-gradient(ellipse, rgba(245,158,11,.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        padding: '60px 48px 20px',
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(frame, [0, 15], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
        zIndex: 10,
      }}>
        <div style={{
          fontSize: 30, fontWeight: 900, letterSpacing: '.18em',
          color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8,
          fontFamily: "'Orbitron', sans-serif",
        }}>
          🏙️ REAL ESTATE EMPIRE
        </div>
        <div style={{ fontSize: 22, color: '#7a9bc0', fontWeight: 500 }}>
          Build your property empire
        </div>
      </div>

      {/* Total portfolio value */}
      <div style={{
        padding: '0 48px 24px',
        opacity: interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        zIndex: 10,
      }}>
        <div style={{ fontSize: 22, color: '#7a9bc0', marginBottom: 4 }}>EMPIRE VALUE</div>
        <div style={{
          fontSize: 80, fontWeight: 900, lineHeight: 1,
          color: '#f59e0b',
          filter: 'drop-shadow(0 0 28px rgba(245,158,11,.5))',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <AnimatedNumber from={0} to={5940000} startFrame={10} endFrame={75} prefix="$" />
        </div>
        <div style={{
          fontSize: 26, color: '#10b981', fontWeight: 700, marginTop: 4,
          opacity: interpolate(frame, [20, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          +$30,300 daily income 💰
        </div>
      </div>

      {/* Property cards */}
      <div style={{
        padding: '0 48px', flex: 1,
        display: 'flex', flexDirection: 'column', gap: 18, zIndex: 10,
      }}>
        {PROPERTIES.map((p, i) => {
          const delay = 15 + i * 12;
          const appear = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 90 }, durationInFrames: 22 });
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: `rgba(${i === 0 ? '167,139,250' : i === 1 ? '245,158,11' : i === 2 ? '56,189,248' : '63,185,80'},.06)`,
              border: `1px solid ${p.color}33`,
              borderRadius: 20, padding: '18px 24px',
              opacity, transform: `scale(${appear}) translateX(${interpolate(appear, [0, 1], [60, 0])}px)`,
              boxShadow: `0 4px 24px ${p.color}11`,
            }}>
              <div style={{ fontSize: 52 }}>{p.type}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#eef4ff' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                  {Array.from({ length: 5 }, (_, j) => (
                    <div key={j} style={{
                      width: 14, height: 14, borderRadius: 4,
                      background: j < p.level ? p.color : '#1b2e47',
                    }} />
                  ))}
                  <span style={{ fontSize: 18, color: '#7a9bc0', marginLeft: 4 }}>Lv.{p.level}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#eef4ff', fontFamily: 'monospace' }}>
                  {p.value}
                </div>
                <div style={{ fontSize: 20, color: '#10b981', fontWeight: 700 }}>{p.income}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating income particles */}
      {FLOATS.map((amount, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${15 + (i * 14) % 70}%`,
          bottom: `${20 + (i * 7) % 40}%`,
          transform: `translateY(${floatY(i * 12)}px)`,
          opacity: floatOpacity(i * 12),
          fontSize: 26, fontWeight: 800, color: '#10b981',
          background: 'rgba(16,185,129,.12)',
          border: '1px solid rgba(16,185,129,.3)',
          borderRadius: 12, padding: '6px 16px',
          zIndex: 20,
          filter: 'drop-shadow(0 0 12px rgba(16,185,129,.5))',
          pointerEvents: 'none',
        }}>
          {amount}
        </div>
      ))}
    </div>
  );
};
