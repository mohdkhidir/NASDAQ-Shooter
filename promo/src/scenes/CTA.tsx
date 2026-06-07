import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 }, durationInFrames: 25 });
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const textOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textY = interpolate(frame, [18, 30], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const btnScale = spring({ frame: frame - 30, fps, config: { damping: 10, stiffness: 80 }, durationInFrames: 20 });
  const btnOpacity = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const urlOpacity = interpolate(frame, [44, 56], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const pulseSz = 1 + Math.sin(frame / 14) * 0.025;

  const FEATURES = ['📈 300+ NASDAQ Stocks', '🏢 Real Estate Empire', '🏆 Global Leaderboard', '💰 Start with $10K'];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse 140% 100% at 50% 0%, #1a0050 0%, #08002a 40%, #04000c 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
      overflow: 'hidden', position: 'relative',
      gap: 0,
    }}>
      {/* Star particles */}
      {Array.from({ length: 28 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 3 + (i % 3), height: 3 + (i % 3),
          borderRadius: '50%',
          left: `${(i * 23 + 3) % 98}%`,
          top: `${(i * 17 + 5) % 95}%`,
          background: ['#ffd700', '#8338ec', '#58a6ff', '#3fb950', '#f85149'][i % 5],
          opacity: 0.2 + Math.abs(Math.sin(frame / 25 + i)) * 0.5,
        }} />
      ))}

      {/* Logo */}
      <div style={{
        opacity: logoOpacity,
        transform: `scale(${logoScale})`,
        textAlign: 'center', marginBottom: 32,
      }}>
        <div style={{ fontSize: 110, filter: 'drop-shadow(0 0 40px rgba(63,185,80,.6))' }}>📊</div>
      </div>

      {/* Title */}
      <div style={{
        opacity: textOpacity, transform: `translateY(${textY}px)`,
        textAlign: 'center', marginBottom: 24, padding: '0 60px',
      }}>
        <div style={{
          fontSize: 76, fontWeight: 900, lineHeight: .92,
          background: 'linear-gradient(135deg, #fff 0%, #d8b4fe 25%, #93c5fd 50%, #6ee7b7 75%, #fde68a 100%)',
          backgroundSize: '400%',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundPosition: `${frame * 2}% 50%`,
          letterSpacing: '-.02em',
        }}>
          NASDAQ<br />SHOOTER
        </div>
        <div style={{
          fontSize: 24, fontWeight: 700, color: '#fbbf24',
          letterSpacing: '.28em', textTransform: 'uppercase',
          marginTop: 16,
        }}>
          THE STOCK MARKET GAME
        </div>
      </div>

      {/* Feature pills */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        marginBottom: 36, width: '85%',
        opacity: interpolate(frame, [32, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        {FEATURES.map((f, i) => {
          const d = 32 + i * 6;
          const op = interpolate(frame, [d, d + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const tx = interpolate(frame, [d, d + 12], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{
              opacity: op, transform: `translateX(${tx}px)`,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 50, padding: '12px 28px',
              fontSize: 24, fontWeight: 600, color: '#e6edf3',
              textAlign: 'center',
            }}>
              {f}
            </div>
          );
        })}
      </div>

      {/* CTA button */}
      <div style={{
        opacity: btnOpacity,
        transform: `scale(${btnScale * pulseSz})`,
        background: 'linear-gradient(90deg, #ff006e, #8338ec, #3a86ff, #06d6a0)',
        backgroundSize: '300%',
        backgroundPosition: `${frame * 1.5}% 50%`,
        borderRadius: 50, padding: '22px 70px',
        fontSize: 34, fontWeight: 900, color: '#fff',
        letterSpacing: '.14em', textTransform: 'uppercase',
        boxShadow: '0 8px 48px rgba(131,56,236,.7), 0 0 80px rgba(58,134,255,.3)',
        marginBottom: 30,
      }}>
        PLAY FREE NOW 🚀
      </div>

      {/* URL */}
      <div style={{
        opacity: urlOpacity,
        fontSize: 26, fontWeight: 700, color: '#8b949e',
        fontFamily: 'monospace', letterSpacing: '.04em',
      }}>
        nasdaq-shooter.vercel.app
      </div>

      {/* Hashtags */}
      <div style={{
        opacity: interpolate(frame, [52, 64], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        fontSize: 22, color: '#58a6ff', fontFamily: "'Inter', sans-serif",
        marginTop: 16, letterSpacing: '.04em',
      }}>
        #stockmarket #investing #trading #game
      </div>
    </div>
  );
};
