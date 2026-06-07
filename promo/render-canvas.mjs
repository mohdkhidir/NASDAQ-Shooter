/**
 * NASDAQ Shooter — TikTok Promo Video
 * Pure Node.js canvas renderer → ffmpeg MP4
 * Format: 1080×1920, 30fps, 30s (900 frames)
 */
import pkg from 'canvas';
const { createCanvas } = pkg;
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920, FPS = 30, TOTAL = 900;

// ── Easing helpers ─────────────────────────────────────────────
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const easeOut = (t) => 1 - (1 - t) ** 3;
const spring = (t, damping = 0.6) => {
  if (t <= 0) return 0; if (t >= 1) return 1;
  const s = 2 * Math.PI * damping;
  return 1 - Math.exp(-s * t) * Math.cos(2 * Math.PI * t);
};
const interp = (f, [f0, f1], [v0, v1]) => {
  const t = clamp((f - f0) / (f1 - f0), 0, 1);
  return lerp(v0, v1, t);
};
const interpEase = (f, [f0, f1], [v0, v1]) => {
  const t = ease(clamp((f - f0) / (f1 - f0), 0, 1));
  return lerp(v0, v1, t);
};
const interpOut = (f, [f0, f1], [v0, v1]) => {
  const t = easeOut(clamp((f - f0) / (f1 - f0), 0, 1));
  return lerp(v0, v1, t);
};

// ── Number formatter ────────────────────────────────────────────
const fmtNum = (v) => {
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
  return '$' + v.toFixed(0);
};

// ── Stock prices for chart ──────────────────────────────────────
const PRICES = [100,98,102,97,105,108,104,112,109,118,115,122,119,130,127,138,135,145,142,155,152,162,158,172,168,180,176,188,185,198,194,208,204,218,215,228,224,238,235,250];
const TICKERS = [
  ['AAPL','+4.7%',true],['NVDA','+12.3%',true],['TSLA','-2.1%',false],
  ['MSFT','+3.8%',true],['AMZN','+5.2%',true],['META','+8.1%',true],
  ['GOOG','-1.4%',false],['SPY','+2.9%',true],
];

// ── Draw helpers ────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGrid(ctx, color, spacing, opacity) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
}

function drawGlow(ctx, x, y, r, color, alpha = 0.3) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function glowText(ctx, text, x, y, color, blur = 20) {
  ctx.save();
  ctx.shadowColor = color; ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ── Ticker chip ─────────────────────────────────────────────────
function drawTickerChip(ctx, sym, chg, up, x, y, alpha) {
  const w = 200, h = 60, r = 12;
  const bg = up ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)';
  const border = up ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)';
  const tc = up ? '#3fb950' : '#f85149';
  ctx.save();
  ctx.globalAlpha = alpha;
  roundRect(ctx, x, y - h / 2, w, h, r);
  ctx.fillStyle = bg; ctx.fill();
  ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#e6edf3'; ctx.textAlign = 'left';
  ctx.fillText(sym, x + 14, y + 8);
  ctx.fillStyle = tc;
  ctx.fillText(chg, x + 100, y + 8);
  ctx.restore();
}

// ── Scene 1: Hook ───────────────────────────────────────────────
function drawHook(ctx, f) {
  // Background
  const bg = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, H);
  bg.addColorStop(0, '#0a1628');
  bg.addColorStop(1, '#04000c');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const gridAlpha = interp(f, [0, 20], [0, 1]);
  drawGrid(ctx, 'rgba(63,185,80,1)', 90, gridAlpha * 0.055);

  // Glow orb
  drawGlow(ctx, W / 2, H * 0.42, 500, 'rgb(63,185,80)', 0.12);

  // Top ticker row
  const tx = interp(f, [0, 90], [0, -1200]);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  const chips = [...TICKERS, ...TICKERS, ...TICKERS];
  chips.forEach((t, i) => {
    drawTickerChip(ctx, t[0], t[1], t[2], tx + i * 220 + 40, 100, 0.55);
  });
  ctx.restore();

  // Title
  const titleAlpha = interp(f, [0, 10], [0, 1]);
  const titleScale = Math.max(0.001, spring(clamp((f) / 18, 0, 1)));
  ctx.save();
  ctx.globalAlpha = titleAlpha;
  ctx.translate(W / 2, H * 0.35);
  ctx.scale(titleScale, titleScale);

  ctx.font = 'bold 56px sans-serif';
  ctx.fillStyle = '#8b949e'; ctx.textAlign = 'center';
  ctx.fillText('Can you turn', 0, -200);

  ctx.font = 'bold 148px sans-serif';
  const gFrom = ctx.createLinearGradient(-200, 0, 200, 0);
  gFrom.addColorStop(0, '#3fb950'); gFrom.addColorStop(1, '#58a6ff');
  ctx.shadowColor = '#3fb950'; ctx.shadowBlur = 50;
  ctx.fillStyle = gFrom;
  ctx.fillText('$10K', 0, -50);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 62px sans-serif';
  ctx.fillStyle = '#e6edf3';
  ctx.fillText('into', 0, 70);

  // Animated $1M counter
  const counterVal = interp(f, [10, 80], [10000, 1000000]);
  ctx.font = 'bold 156px monospace';
  const gTo = ctx.createLinearGradient(-300, 0, 300, 0);
  gTo.addColorStop(0, '#ffd700'); gTo.addColorStop(1, '#fbbf24');
  ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 60;
  ctx.fillStyle = gTo;
  ctx.fillText(fmtNum(counterVal), 0, 230);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Subtitle
  const subAlpha = interp(f, [18, 28], [0, 1]);
  const subY = interpOut(f, [18, 28], [30, 0]);
  ctx.save();
  ctx.globalAlpha = subAlpha;
  ctx.font = 'bold 42px sans-serif';
  ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'center';
  ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 20;
  ctx.fillText('NASDAQ SHOOTER', W / 2, H * 0.75 + subY);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Bottom tickers
  const tx2 = interp(f, [0, 90], [0, 1200]);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  chips.forEach((t, i) => {
    drawTickerChip(ctx, t[0], t[1], t[2], -600 + tx2 + i * 220, H - 220, 0.35);
  });
  ctx.restore();
}

// ── Scene 2: Stock Game ─────────────────────────────────────────
function drawStockGame(ctx, f) {
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);
  drawGrid(ctx, 'rgba(88,166,255,1)', 80, 0.04);

  // Header
  const hAlpha = interp(f, [0, 15], [0, 1]);
  const hY = interp(f, [0, 15], [-60, 0]);
  ctx.save(); ctx.globalAlpha = hAlpha; ctx.translate(0, hY);
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = '#58a6ff'; ctx.textAlign = 'left';
  ctx.shadowColor = '#58a6ff'; ctx.shadowBlur = 20;
  ctx.fillText('📈 STOCK TRADING', 60, 140);
  ctx.shadowBlur = 0;
  ctx.font = '34px sans-serif';
  ctx.fillStyle = '#8b949e';
  ctx.fillText('300+ NASDAQ stocks & ETFs', 60, 190);
  ctx.restore();

  // Portfolio value
  const pvAlpha = interp(f, [10, 22], [0, 1]);
  ctx.save(); ctx.globalAlpha = pvAlpha;
  ctx.font = '32px sans-serif';
  ctx.fillStyle = '#8b949e'; ctx.textAlign = 'left';
  ctx.fillText('PORTFOLIO VALUE', 60, 270);
  const portVal = interp(f, [10, 75], [10000, 87450]);
  ctx.font = 'bold 100px monospace';
  ctx.fillStyle = '#3fb950'; ctx.shadowColor = '#3fb950'; ctx.shadowBlur = 30;
  ctx.fillText(fmtNum(portVal), 60, 385);
  ctx.shadowBlur = 0;
  const retAlpha = interp(f, [20, 30], [0, 1]);
  ctx.globalAlpha = pvAlpha * retAlpha;
  ctx.font = 'bold 38px sans-serif';
  ctx.fillStyle = '#3fb950';
  ctx.fillText('+$77,450 (+774.5%) ↑', 60, 440);
  ctx.restore();

  // Chart
  const chartAlpha = interp(f, [15, 25], [0, 1]);
  const progress = clamp((f - 15) / 70, 0, 1);
  const visCount = Math.max(2, Math.floor(progress * PRICES.length));
  const pts = PRICES.slice(0, visCount);
  const minP = Math.min(...PRICES), maxP = Math.max(...PRICES);
  const cx0 = 60, cy0 = 480, cw = W - 120, ch = 340;
  const toX = (i) => cx0 + (i / (PRICES.length - 1)) * cw;
  const toY = (v) => cy0 + ch - ((v - minP) / (maxP - minP)) * ch;

  ctx.save(); ctx.globalAlpha = chartAlpha;
  // Chart bg
  roundRect(ctx, cx0 - 10, cy0 - 10, cw + 20, ch + 20, 20);
  ctx.fillStyle = 'rgba(22,27,34,0.9)'; ctx.fill();
  ctx.strokeStyle = 'rgba(63,185,80,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();

  if (pts.length > 1) {
    // Area fill
    ctx.beginPath();
    ctx.moveTo(toX(0), cy0 + ch);
    pts.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(toX(pts.length - 1), cy0 + ch);
    ctx.closePath();
    const ag = ctx.createLinearGradient(0, cy0, 0, cy0 + ch);
    ag.addColorStop(0, 'rgba(63,185,80,0.25)');
    ag.addColorStop(1, 'rgba(63,185,80,0.02)');
    ctx.fillStyle = ag; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0]));
    pts.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = '#3fb950'; ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.shadowColor = '#3fb950'; ctx.shadowBlur = 8; ctx.stroke();
    ctx.shadowBlur = 0;

    // Dot
    const lx = toX(pts.length - 1), ly = toY(pts[pts.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#3fb950'; ctx.shadowColor = '#3fb950'; ctx.shadowBlur = 16;
    ctx.fill(); ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Trade log
  const TRADES = [
    { sym:'NVDA', act:'BUY',  qty:10,  px:'$487.20', pnl:'+$2,840', up:true,  sf:5  },
    { sym:'AAPL', act:'BUY',  qty:25,  px:'$182.50', pnl:'+$1,230', up:true,  sf:20 },
    { sym:'TSLA', act:'SELL', qty:15,  px:'$248.90', pnl:'-$430',   up:false, sf:35 },
    { sym:'META', act:'BUY',  qty:8,   px:'$505.10', pnl:'+$3,610', up:true,  sf:50 },
    { sym:'SPY',  act:'BUY',  qty:20,  px:'$512.30', pnl:'+$1,890', up:true,  sf:65 },
  ];
  const startY = 870;
  TRADES.forEach((t, i) => {
    const alpha = interp(f, [t.sf, t.sf + 10], [0, 1]);
    const sc = Math.max(0.001, spring(clamp((f - t.sf) / 18, 0, 1)));
    if (alpha <= 0) return;
    const ry = startY + i * 190;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(W / 2, ry + 70);
    ctx.scale(sc, sc);
    ctx.translate(-W / 2, -(ry + 70));

    const rowBg = t.up ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)';
    const rowBorder = t.up ? 'rgba(63,185,80,0.25)' : 'rgba(248,81,73,0.25)';
    roundRect(ctx, 60, ry, W - 120, 140, 20);
    ctx.fillStyle = rowBg; ctx.fill();
    ctx.strokeStyle = rowBorder; ctx.lineWidth = 1.5; ctx.stroke();

    // Action badge
    const badgeBg = t.act === 'BUY' ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)';
    const badgeColor = t.act === 'BUY' ? '#3fb950' : '#f85149';
    roundRect(ctx, 80, ry + 35, 110, 68, 12);
    ctx.fillStyle = badgeBg; ctx.fill();
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = badgeColor; ctx.textAlign = 'center';
    ctx.fillText(t.act, 135, ry + 77);

    // Symbol + info
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#e6edf3'; ctx.textAlign = 'left';
    ctx.fillText(t.sym, 212, ry + 67);
    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#8b949e';
    ctx.fillText(`${t.qty} shares @ ${t.px}`, 212, ry + 108);

    // P&L
    ctx.font = 'bold 38px monospace';
    ctx.fillStyle = t.up ? '#3fb950' : '#f85149';
    ctx.textAlign = 'right';
    ctx.fillText(t.pnl, W - 80, ry + 82);
    ctx.restore();
  });

  // Badge
  const badgeAlpha = interp(f, [60, 75], [0, 1]);
  ctx.save(); ctx.globalAlpha = badgeAlpha;
  const bw = 440, bh = 64, bx = W - 60 - bw, by = H - 160;
  roundRect(ctx, bx, by, bw, bh, 32);
  ctx.fillStyle = 'rgba(88,166,255,0.12)'; ctx.fill();
  ctx.strokeStyle = 'rgba(88,166,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#58a6ff'; ctx.textAlign = 'center';
  ctx.fillText('REAL-TIME SIMULATION', bx + bw / 2, by + 42);
  ctx.restore();
}

// ── Scene 3: Real Estate ────────────────────────────────────────
function drawRealEstate(ctx, f) {
  ctx.fillStyle = '#060d18'; ctx.fillRect(0, 0, W, H);
  // Gold glow top
  drawGlow(ctx, W / 2, 0, 700, 'rgb(245,158,11)', 0.07);

  const PROPS = [
    { name:'Downtown Office', icon:'🏢', income:'$12,400/day', val:'$2.4M',  lv:5, color:'#a78bfa' },
    { name:'Luxury Hotel',    icon:'🏨', income:'$8,600/day',  val:'$1.8M',  lv:4, color:'#f59e0b' },
    { name:'Shopping Mall',   icon:'🏬', income:'$6,200/day',  val:'$1.1M',  lv:3, color:'#38bdf8' },
    { name:'Apartments',      icon:'🏠', income:'$3,100/day',  val:'$640K',  lv:2, color:'#3fb950' },
  ];

  // Header
  const hAlpha = interp(f, [0, 15], [0, 1]);
  const hY = interp(f, [0, 15], [-60, 0]);
  ctx.save(); ctx.globalAlpha = hAlpha; ctx.translate(0, hY);
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'left';
  ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 24;
  ctx.fillText('🏙️ REAL ESTATE EMPIRE', 60, 140);
  ctx.shadowBlur = 0;
  ctx.font = '34px sans-serif';
  ctx.fillStyle = '#7a9bc0';
  ctx.fillText('Build your property empire', 60, 192);
  ctx.restore();

  // Empire value
  const pvAlpha = interp(f, [10, 22], [0, 1]);
  ctx.save(); ctx.globalAlpha = pvAlpha;
  ctx.font = '32px sans-serif';
  ctx.fillStyle = '#7a9bc0'; ctx.textAlign = 'left';
  ctx.fillText('EMPIRE VALUE', 60, 270);
  const ev = interp(f, [10, 75], [0, 5940000]);
  ctx.font = 'bold 96px monospace';
  ctx.fillStyle = '#f59e0b'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 36;
  ctx.fillText(fmtNum(ev), 60, 385);
  ctx.shadowBlur = 0;
  const incAlpha = interp(f, [20, 30], [0, 1]);
  ctx.globalAlpha = pvAlpha * incAlpha;
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText('+$30,300 daily income 💰', 60, 440);
  ctx.restore();

  // Property cards
  PROPS.forEach((p, i) => {
    const delay = 15 + i * 12;
    const alpha = interp(f, [delay, delay + 10], [0, 1]);
    const sc = Math.max(0.001, spring(clamp((f - delay) / 22, 0, 1)));
    if (alpha <= 0) return;
    const ry = 490 + i * 345;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(W / 2, ry + 150);
    ctx.scale(sc, sc);
    ctx.translate(-W / 2, -(ry + 150));

    const tx = interpOut(f, [delay, delay + 14], [80, 0]);
    ctx.translate(tx, 0);

    // Row bg
    roundRect(ctx, 60, ry, W - 120, 280, 24);
    const rowAlpha = 0.06;
    const [r, g, b] = p.color === '#a78bfa' ? [167,139,250] : p.color === '#f59e0b' ? [245,158,11] : p.color === '#38bdf8' ? [56,189,248] : [63,185,80];
    ctx.fillStyle = `rgba(${r},${g},${b},${rowAlpha})`; ctx.fill();
    ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`; ctx.lineWidth = 1.5; ctx.stroke();

    // Icon
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(p.icon, 90, ry + 90);

    // Name + level dots
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = '#eef4ff'; ctx.textAlign = 'left';
    ctx.fillText(p.name, 200, ry + 76);
    for (let j = 0; j < 5; j++) {
      roundRect(ctx, 200 + j * 36, ry + 110, 26, 26, 6);
      ctx.fillStyle = j < p.lv ? p.color : '#1b2e47'; ctx.fill();
    }
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#7a9bc0';
    ctx.fillText(`Lv.${p.lv}`, 200 + 5 * 36 + 12, ry + 130);

    // Value + income (right side)
    ctx.font = 'bold 44px monospace';
    ctx.fillStyle = '#eef4ff'; ctx.textAlign = 'right';
    ctx.fillText(p.val, W - 80, ry + 92);
    ctx.font = 'bold 34px sans-serif';
    ctx.fillStyle = '#10b981'; ctx.textAlign = 'right';
    ctx.fillText(p.income, W - 80, ry + 140);

    ctx.restore();
  });

  // Floating income particles
  const FLOATS = ['+$12,400','+$8,600','+$6,200','+$3,100','+$4,500','+$9,800'];
  FLOATS.forEach((amt, i) => {
    const offset = i * 12;
    const progress = clamp((f - offset) / 40, 0, 1);
    const py = lerp(0, -300, progress);
    const a = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
    if (a <= 0.01) return;
    const px = (15 + (i * 14) % 70) / 100 * W;
    const py0 = (20 + (i * 7) % 40) / 100 * H;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(px, py0 + py);
    roundRect(ctx, -80, -30, 200, 58, 14);
    ctx.fillStyle = 'rgba(16,185,129,0.12)'; ctx.fill();
    ctx.strokeStyle = 'rgba(16,185,129,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#10b981'; ctx.textAlign = 'center';
    ctx.shadowColor = '#10b981'; ctx.shadowBlur = 14;
    ctx.fillText(amt, 20, 12);
    ctx.shadowBlur = 0;
    ctx.restore();
  });
}

// ── Scene 4: Leaderboard ────────────────────────────────────────
function drawLeaderboard(ctx, f) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0d1117'); bg.addColorStop(1, '#04000c');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Confetti dots
  for (let i = 0; i < 18; i++) {
    const colors = ['#ffd700','#3fb950','#58a6ff','#f85149','#a78bfa'];
    ctx.save();
    ctx.globalAlpha = 0.3 + (Math.sin(f / 20 + i) + 1) * 0.15;
    ctx.fillStyle = colors[i % 5];
    const cx = ((i * 17 + 5) % 95) / 100 * W;
    const cy = ((i * 13 + 10) % 80) / 100 * H;
    const cr = 5 + (Math.sin(f / 15 + i) + 1) * 2;
    ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Header
  const hAlpha = interp(f, [0, 12], [0, 1]);
  ctx.save(); ctx.globalAlpha = hAlpha; ctx.textAlign = 'center';
  ctx.font = '100px sans-serif';
  ctx.shadowColor = 'rgba(255,215,0,0.7)'; ctx.shadowBlur = 30;
  ctx.fillText('🏆', W / 2, 200);
  ctx.shadowBlur = 0;
  ctx.font = 'bold 72px sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 24;
  ctx.fillText('LEADERBOARD', W / 2, 305);
  ctx.shadowBlur = 0;
  ctx.font = '36px sans-serif';
  ctx.fillStyle = '#8b949e';
  ctx.fillText('Compete with players worldwide', W / 2, 360);
  ctx.restore();

  const PLAYERS = [
    { rank:1, name:'StockKing99',  worth:'$4.2M',  ret:'+4,200%', avi:'👑', color:'#ffd700' },
    { rank:2, name:'WallStWolf',   worth:'$3.1M',  ret:'+3,100%', avi:'🐺', color:'#c0c0c0' },
    { rank:3, name:'BullMarket',   worth:'$2.8M',  ret:'+2,800%', avi:'🐂', color:'#cd7f32' },
    { rank:4, name:'TechTrader',   worth:'$1.9M',  ret:'+1,900%', avi:'🤖', color:'#58a6ff' },
    { rank:5, name:'YOU?',         worth:'???',    ret:'???',     avi:'❓', color:'#8338ec', you:true },
  ];

  PLAYERS.forEach((p, i) => {
    const delay = 12 + i * 10;
    const alpha = interp(f, [delay, delay + 10], [0, 1]);
    const sc = Math.max(0.001, spring(clamp((f - delay) / 20, 0, 1)));
    if (alpha <= 0.01) return;
    const ry = 400 + i * 286;

    ctx.save(); ctx.globalAlpha = alpha;
    ctx.translate(W / 2, ry + 120);
    ctx.scale(sc, sc);
    ctx.translate(-W / 2, -(ry + 120));

    const tx = interpOut(f, [delay, delay + 14], [-100, 0]);
    ctx.translate(tx, 0);

    // Row bg
    roundRect(ctx, 50, ry, W - 100, 238, 22);
    if (p.you) {
      const grad = ctx.createLinearGradient(50, ry, W - 50, ry + 238);
      grad.addColorStop(0, 'rgba(131,56,236,0.18)');
      grad.addColorStop(1, 'rgba(58,134,255,0.1)');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = 'rgba(22,27,34,0.85)';
    }
    ctx.fill();
    ctx.strokeStyle = p.you ? 'rgba(131,56,236,0.6)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = p.you ? 2 : 1; ctx.stroke();

    // Rank medal
    const medals = ['🥇','🥈','🥉'];
    ctx.font = (p.rank <= 3 ? '50px' : '38px') + ' sans-serif';
    ctx.textAlign = 'center';
    if (p.rank <= 3) {
      ctx.shadowColor = p.color; ctx.shadowBlur = 14;
      ctx.fillText(medals[p.rank - 1], 130, ry + 138);
      ctx.shadowBlur = 0;
    } else {
      ctx.font = 'bold 36px monospace'; ctx.fillStyle = p.color;
      ctx.fillText(`#${p.rank}`, 130, ry + 138);
    }

    // Avatar circle
    const [ar, ag, ab] = p.color === '#ffd700' ? [255,215,0] : p.color === '#c0c0c0' ? [192,192,192] : p.color === '#cd7f32' ? [205,127,50] : p.color === '#58a6ff' ? [88,166,255] : [131,56,236];
    ctx.beginPath(); ctx.arc(222, ry + 119, 48, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ar},${ag},${ab},0.15)`; ctx.fill();
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.4)`; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '44px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p.avi, 222, ry + 137);

    // Name
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = p.you ? '#c084fc' : '#e6edf3'; ctx.textAlign = 'left';
    ctx.fillText(p.name, 292, ry + 100);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#3fb950';
    ctx.fillText(p.ret, 292, ry + 148);

    // Worth
    ctx.font = 'bold 44px monospace';
    ctx.fillStyle = p.you ? '#c084fc' : '#e6edf3'; ctx.textAlign = 'right';
    ctx.fillText(p.worth, W - 72, ry + 128);
    ctx.restore();
  });

  // "Can you reach the top?"
  const ctaAlpha = interp(f, [55, 68], [0, 1]);
  const ctaY = interpOut(f, [55, 68], [30, 0]);
  ctx.save(); ctx.globalAlpha = ctaAlpha; ctx.textAlign = 'center';
  ctx.font = 'bold 52px sans-serif';
  const ctaGrad = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
  ctaGrad.addColorStop(0, '#8338ec'); ctaGrad.addColorStop(1, '#3a86ff');
  ctx.fillStyle = ctaGrad;
  ctx.fillText('Can you reach the top?', W / 2, H - 100 + ctaY);
  ctx.restore();
}

// ── Scene 5: CTA ────────────────────────────────────────────────
function drawCTA(ctx, f) {
  const bg = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H);
  bg.addColorStop(0, '#1a0050'); bg.addColorStop(0.45, '#08002a'); bg.addColorStop(1, '#04000c');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 28; i++) {
    const colors = ['#ffd700','#8338ec','#58a6ff','#3fb950','#f85149'];
    ctx.save();
    ctx.globalAlpha = 0.2 + Math.abs(Math.sin(f / 25 + i)) * 0.5;
    ctx.fillStyle = colors[i % 5];
    ctx.beginPath();
    ctx.arc(((i * 23 + 3) % 98) / 100 * W, ((i * 17 + 5) % 95) / 100 * H, 3 + (i % 3), 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  }

  // Logo
  const logoAlpha = interp(f, [0, 12], [0, 1]);
  const logoSc = Math.max(0.001, spring(clamp(f / 25, 0, 1)));
  ctx.save(); ctx.globalAlpha = logoAlpha;
  ctx.translate(W / 2, 250);
  ctx.scale(logoSc, logoSc);
  ctx.font = '160px sans-serif'; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(63,185,80,0.7)'; ctx.shadowBlur = 50;
  ctx.fillText('📊', 0, 0);
  ctx.shadowBlur = 0; ctx.restore();

  // Title
  const titleAlpha = interp(f, [18, 30], [0, 1]);
  const titleY = interpOut(f, [18, 30], [40, 0]);
  ctx.save(); ctx.globalAlpha = titleAlpha;
  ctx.translate(0, titleY); ctx.textAlign = 'center';
  const rainbowPos = f * 2;
  ctx.font = 'bold 120px sans-serif';
  const rg = ctx.createLinearGradient(W / 2 - 400, 0, W / 2 + 400, 0);
  rg.addColorStop(0, '#fff'); rg.addColorStop(0.25, '#d8b4fe');
  rg.addColorStop(0.5, '#93c5fd'); rg.addColorStop(0.75, '#6ee7b7'); rg.addColorStop(1, '#fde68a');
  ctx.fillStyle = rg;
  ctx.fillText('NASDAQ', W / 2, 510);
  ctx.fillText('SHOOTER', W / 2, 648);
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('THE STOCK MARKET GAME', W / 2, 720);
  ctx.restore();

  // Feature pills
  const FEATURES = ['📈 300+ NASDAQ Stocks','🏢 Real Estate Empire','🏆 Global Leaderboard','💰 Start with $10K'];
  FEATURES.forEach((feat, i) => {
    const d = 32 + i * 6;
    const fa = interp(f, [d, d + 10], [0, 1]);
    const ftx = interpOut(f, [d, d + 12], [80, 0]);
    if (fa <= 0.01) return;
    const fy = 780 + i * 100;
    ctx.save(); ctx.globalAlpha = fa;
    ctx.translate(ftx, 0);
    roundRect(ctx, 100, fy, W - 200, 82, 42);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = 'bold 34px sans-serif';
    ctx.fillStyle = '#e6edf3'; ctx.textAlign = 'center';
    ctx.fillText(feat, W / 2, fy + 52);
    ctx.restore();
  });

  // CTA button
  const btnAlpha = interp(f, [30, 42], [0, 1]);
  const btnSc = Math.max(0.001, spring(clamp((f - 30) / 20, 0, 1)) * (1 + Math.sin(f / 14) * 0.025));
  ctx.save(); ctx.globalAlpha = btnAlpha;
  ctx.translate(W / 2, 1240); ctx.scale(btnSc, btnSc); ctx.translate(-W / 2, -1240);
  const bw = W - 160, bh = 120;
  const bx = 80, by = 1180;
  roundRect(ctx, bx, by, bw, bh, 60);
  const btnGrad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  btnGrad.addColorStop(0, '#ff006e'); btnGrad.addColorStop(0.33, '#8338ec');
  btnGrad.addColorStop(0.66, '#3a86ff'); btnGrad.addColorStop(1, '#06d6a0');
  ctx.fillStyle = btnGrad; ctx.fill();
  ctx.shadowColor = 'rgba(131,56,236,0.8)'; ctx.shadowBlur = 50;
  ctx.font = 'bold 52px sans-serif';
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.fillText('PLAY FREE NOW 🚀', W / 2, by + 80);
  ctx.shadowBlur = 0; ctx.restore();

  // URL
  const urlAlpha = interp(f, [44, 56], [0, 1]);
  ctx.save(); ctx.globalAlpha = urlAlpha;
  ctx.font = 'bold 36px monospace'; ctx.fillStyle = '#8b949e'; ctx.textAlign = 'center';
  ctx.fillText('nasdaq-shooter.vercel.app', W / 2, 1360);
  ctx.restore();

  // Hashtags
  const hashAlpha = interp(f, [52, 64], [0, 1]);
  ctx.save(); ctx.globalAlpha = hashAlpha;
  ctx.font = '32px sans-serif'; ctx.fillStyle = '#58a6ff'; ctx.textAlign = 'center';
  ctx.fillText('#stockmarket #investing #trading #game', W / 2, 1430);
  ctx.restore();
}

// ── Main render loop ────────────────────────────────────────────
async function main() {
  const outPath = path.join(__dirname, 'nasdaq-promo.mp4');

  // Scene boundaries (cumulative frames)
  const SCENES = [
    { end: 90,  draw: drawHook },          // 0–89
    { end: 300, draw: drawStockGame },     // 90–299
    { end: 510, draw: drawRealEstate },    // 300–509
    { end: 690, draw: drawLeaderboard },   // 510–689
    { end: 900, draw: drawCTA },           // 690–899
  ];

  // Spawn ffmpeg to accept raw video frames on stdin
  const ff = spawn('ffmpeg', [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'bgra',
    '-video_size', `${W}x${H}`,
    '-framerate', String(FPS),
    '-i', 'pipe:0',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '18',
    outPath,
  ]);

  ff.stderr.on('data', () => {});
  ff.on('error', (e) => { console.error('ffmpeg error:', e); process.exit(1); });

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  console.log(`Rendering ${TOTAL} frames at ${W}×${H} @${FPS}fps...`);

  for (let frame = 0; frame < TOTAL; frame++) {
    if (frame % 30 === 0) process.stdout.write(`\r⏳ Frame ${frame}/${TOTAL} (${Math.round(frame/TOTAL*100)}%)`);

    // Fully reset canvas state each frame
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.beginPath();
    ctx.clearRect(0, 0, W, H);

    // Find active scene and local frame number
    let localFrame = frame;
    let prevEnd = 0;
    for (const scene of SCENES) {
      if (frame < scene.end) {
        localFrame = frame - prevEnd;
        scene.draw(ctx, localFrame);
        break;
      }
      prevEnd = scene.end;
    }

    // Write raw RGBA buffer to ffmpeg
    const buf = canvas.toBuffer('raw');
    const ok = ff.stdin.write(buf);
    if (!ok) await new Promise(r => ff.stdin.once('drain', r));
  }

  ff.stdin.end();

  await new Promise((resolve, reject) => {
    ff.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)));
  });

  console.log(`\n✅ Rendered: ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
