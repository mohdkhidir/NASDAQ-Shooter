import React from 'react';
import {
  useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing,
} from 'remotion';
import { AnimatedNumber } from '../components/AnimatedNumber';

const TICKERS = [
  { sym: 'AAPL', chg: '+4.7%', up: true },
  { sym: 'NVDA', chg: '+12.3%', up: true },
  { sym: 'TSLA', chg: '-2.1%', up: false },
  { sym: 'MSFT', chg: '+3.8%', up: true },
  { sym: 'AMZN', chg: '+5.2%', up: true },
  { sym: 'META', chg: '+8.1%', up: true },
  { sym: 'GOOG', chg: '-1.4%', up: false },
  { sym: 'SPY',  chg: '+2.9%', up: true },
];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 20 });
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  const subOpacity = interpolate(frame, [18, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subY = interpolate(frame, [18, 28], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const arrowOpacity = interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Scrolling tickers
  const tickerX = interpolate(frame, [0, 90], [0, -900], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse 120% 80% at 50% 30%, #0a1628 0%, #04000c 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative', fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
    }}>

      {/* Animated grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(63,185,80,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(63,185,80,.06) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute',
        width: 700, height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,185,80,.12) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      {/* Scrolling ticker row top */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0,
        display: 'flex', gap: 24, overflow: 'hidden',
        opacity: 0.6,
      }}>
        <div style={{ display: 'flex', gap: 24, transform: `translateX(${tickerX}px)`, whiteSpace: 'nowrap' }}>
          {[...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i} style={{
              background: t.up ? 'rgba(63,185,80,.12)' : 'rgba(248,81,73,.12)',
              border: `1px solid ${t.up ? 'rgba(63,185,80,.3)' : 'rgba(248,81,73,.3)'}`,
              borderRadius: 8, padding: '6px 14px',
              fontFamily: 'monospace', fontSize: 22,
              color: t.up ? '#3fb950' : '#f85149',
              display: 'flex', gap: 12,
            }}>
              <span style={{ color: '#e6edf3', fontWeight: 700 }}>{t.sym}</span>
              <span>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main title */}
      <div style={{
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
        textAlign: 'center', zIndex: 10, padding: '0 60px',
      }}>
        <div style={{
          fontSize: 44, fontWeight: 900, letterSpacing: '.08em',
          color: '#8b949e', marginBottom: 12, textTransform: 'uppercase',
        }}>
          Can you turn
        </div>
        <div style={{
          fontSize: 110, fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg, #3fb950 0%, #56d364 50%, #58a6ff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 40px rgba(63,185,80,.5))',
          marginBottom: 8,
        }}>
          $10K
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#e6edf3', marginBottom: 16 }}>into</div>
        <div style={{
          fontSize: 120, fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg, #ffd700, #fbbf24, #ffd700)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 50px rgba(255,215,0,.6))',
        }}>
          <AnimatedNumber from={10000} to={1000000} startFrame={10} endFrame={80} prefix="$" />
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        marginTop: 40, textAlign: 'center', zIndex: 10,
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 34, fontWeight: 700, letterSpacing: '.3em',
        color: '#fbbf24', textTransform: 'uppercase',
      }}>
        NASDAQ SHOOTER
      </div>

      {/* Arrow */}
      <div style={{
        position: 'absolute', bottom: 80,
        opacity: arrowOpacity, fontSize: 48,
        animation: 'bounce 1s ease-in-out infinite',
      }}>
        ⬇
      </div>

      {/* Scrolling ticker row bottom */}
      <div style={{
        position: 'absolute', bottom: 160, left: 0, right: 0,
        display: 'flex', gap: 24, overflow: 'hidden',
        opacity: 0.4,
      }}>
        <div style={{ display: 'flex', gap: 24, transform: `translateX(${-tickerX}px)`, whiteSpace: 'nowrap' }}>
          {[...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i} style={{
              background: t.up ? 'rgba(63,185,80,.08)' : 'rgba(248,81,73,.08)',
              border: `1px solid ${t.up ? 'rgba(63,185,80,.2)' : 'rgba(248,81,73,.2)'}`,
              borderRadius: 8, padding: '6px 14px',
              fontFamily: 'monospace', fontSize: 20,
              color: t.up ? '#3fb950' : '#f85149',
              display: 'flex', gap: 12,
            }}>
              <span style={{ color: '#8b949e' }}>{t.sym}</span>
              <span>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
