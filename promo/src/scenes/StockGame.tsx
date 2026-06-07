import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { StockChart } from '../components/StockChart';
import { AnimatedNumber } from '../components/AnimatedNumber';

const TRADES = [
  { sym: 'NVDA', action: 'BUY',  qty: 10,  price: '$487.20', pnl: '+$2,840',  up: true,  frame: 5  },
  { sym: 'AAPL', action: 'BUY',  qty: 25,  price: '$182.50', pnl: '+$1,230',  up: true,  frame: 20 },
  { sym: 'TSLA', action: 'SELL', qty: 15,  price: '$248.90', pnl: '-$430',    up: false, frame: 35 },
  { sym: 'META', action: 'BUY',  qty: 8,   price: '$505.10', pnl: '+$3,610',  up: true,  frame: 50 },
  { sym: 'SPY',  action: 'BUY',  qty: 20,  price: '$512.30', pnl: '+$1,890',  up: true,  frame: 65 },
];

export const StockGame: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerY = interpolate(frame, [0, 15], [-80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0d1117 0%, #0a0e14 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(88,166,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(88,166,255,.04) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Header */}
      <div style={{
        padding: '60px 48px 24px',
        opacity: headerOpacity,
        transform: `translateY(${headerY}px)`,
        zIndex: 10,
      }}>
        <div style={{
          fontSize: 30, fontWeight: 900, letterSpacing: '.22em',
          color: '#58a6ff', textTransform: 'uppercase', marginBottom: 8,
          fontFamily: "'Orbitron', sans-serif",
        }}>
          📈 STOCK TRADING
        </div>
        <div style={{ fontSize: 22, color: '#8b949e', fontWeight: 500 }}>
          300+ NASDAQ stocks & ETFs
        </div>
      </div>

      {/* Portfolio value */}
      <div style={{
        padding: '0 48px 20px',
        opacity: interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        zIndex: 10,
      }}>
        <div style={{ fontSize: 22, color: '#8b949e', marginBottom: 4 }}>PORTFOLIO VALUE</div>
        <div style={{
          fontSize: 84, fontWeight: 900, lineHeight: 1,
          color: '#3fb950',
          filter: 'drop-shadow(0 0 24px rgba(63,185,80,.4))',
          fontFamily: 'monospace',
        }}>
          <AnimatedNumber from={10000} to={87450} startFrame={10} endFrame={75} prefix="$" />
        </div>
        <div style={{
          fontSize: 32, fontWeight: 700, color: '#3fb950',
          opacity: interpolate(frame, [20, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          +$77,450 (+774.5%) ↑
        </div>
      </div>

      {/* Chart */}
      <div style={{
        padding: '0 48px',
        opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        zIndex: 10,
      }}>
        <div style={{
          background: 'rgba(22,27,34,.8)',
          border: '1px solid rgba(63,185,80,.2)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 0 40px rgba(63,185,80,.1)',
        }}>
          <StockChart width={984} height={300} startFrame={15} durationFrames={70} color="#3fb950" />
        </div>
      </div>

      {/* Trade log */}
      <div style={{
        padding: '24px 48px 0', flex: 1,
        display: 'flex', flexDirection: 'column', gap: 16, zIndex: 10,
      }}>
        {TRADES.map((t, i) => {
          const appear = spring({ frame: frame - t.frame, fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 20 });
          const opacity = interpolate(frame, [t.frame, t.frame + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: t.up ? 'rgba(63,185,80,.08)' : 'rgba(248,81,73,.08)',
              border: `1px solid ${t.up ? 'rgba(63,185,80,.25)' : 'rgba(248,81,73,.25)'}`,
              borderRadius: 16, padding: '16px 24px',
              opacity, transform: `scale(${appear})`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  background: t.action === 'BUY' ? 'rgba(63,185,80,.2)' : 'rgba(248,81,73,.2)',
                  color: t.action === 'BUY' ? '#3fb950' : '#f85149',
                  borderRadius: 10, padding: '6px 18px',
                  fontSize: 24, fontWeight: 800,
                }}>
                  {t.action}
                </div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: '#e6edf3' }}>{t.sym}</div>
                  <div style={{ fontSize: 20, color: '#8b949e' }}>{t.qty} shares @ {t.price}</div>
                </div>
              </div>
              <div style={{
                fontSize: 30, fontWeight: 800,
                color: t.up ? '#3fb950' : '#f85149',
                fontFamily: 'monospace',
              }}>
                {t.pnl}
              </div>
            </div>
          );
        })}
      </div>

      {/* Label badge */}
      <div style={{
        position: 'absolute', bottom: 60, right: 48,
        background: 'rgba(88,166,255,.12)',
        border: '1px solid rgba(88,166,255,.3)',
        borderRadius: 50, padding: '12px 32px',
        fontSize: 24, fontWeight: 700, color: '#58a6ff',
        opacity: interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        zIndex: 10,
      }}>
        REAL-TIME SIMULATION
      </div>
    </div>
  );
};
