# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""
NASDAQ Shooter - Python Heatmap
Uses pandas + matplotlib + seaborn to draw a sector treemap heatmap.

Usage:
    python heatmap.py              # uses built-in base prices (random sim)
    python heatmap.py prices.json  # uses live prices exported from the game
"""

import sys, os, json, math, random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.patheffects as pe
from matplotlib.colors import LinearSegmentedColormap

# ── Color scale: dark-red → red → neutral-dark → green → dark-green ──────────
CMAP = LinearSegmentedColormap.from_list('rg', [
    '#6b0000', '#c0392b', '#922b21',
    '#1b2631',
    '#1e8449', '#145a32', '#0b3d1a',
], N=512)

def pct_to_color(pct, vmin=-5.0, vmax=5.0):
    t = float(np.clip((pct - vmin) / (vmax - vmin), 0.0, 1.0))
    return CMAP(t)

# ── Theme groups  (ticker, short-name, base-price, cap-weight) ────────────────
THEMES = [
    ('AI / LLM', [
        ('NVDA', 'NVIDIA',   875,  10),
        ('AMD',  'AMD',      165,   7),
        ('ARM',  'Arm',      140,   6),
        ('MSFT', 'Microsoft',415,  10),
        ('GOOGL','Alphabet', 175,  10),
        ('META', 'Meta',     505,  10),
        ('PLTR', 'Palantir',  27,   4),
        ('SMCI', 'SuperMicro',700,  5),
        ('MRVL', 'Marvell',   80,   5),
        ('INTC', 'Intel',     30,   4),
        ('SOUN', 'SoundHound',10,   2),
        ('AI',   'C3.ai',     28,   2),
        ('IONQ', 'IonQ',      14,   2),
    ]),
    ('DRAM / Memory', [
        ('MU',   'Micron',   115,   8),
        ('WDC',  'W.Digital', 55,   5),
        ('STX',  'Seagate',   90,   5),
        ('NTAP', 'NetApp',   115,   4),
        ('PSTG', 'PureStr',   62,   4),
    ]),
    ('Wafer / Semi Equip', [
        ('ASML', 'ASML',     950,   9),
        ('AVGO', 'Broadcom', 1350,  9),
        ('AMAT', 'ApplMat',  195,   8),
        ('LRCX', 'LamRes',   900,   8),
        ('KLAC', 'KLA',      690,   7),
        ('QCOM', 'Qualcomm', 175,   7),
        ('SNPS', 'Synopsys', 540,   6),
        ('CDNS', 'Cadence',  310,   6),
        ('TXN',  'TxInstr',  185,   6),
        ('ADI',  'AnaDev',   225,   6),
        ('NXPI', 'NXP',      245,   5),
        ('MCHP', 'Microchip', 82,   4),
    ]),
    ('Hardware', [
        ('AAPL', 'Apple',    182,  12),
        ('IBM',  'IBM',      185,   6),
        ('DELL', 'Dell',     115,   6),
        ('HPQ',  'HP Inc',    33,   4),
        ('HPE',  'HP Ent',    19,   3),
        ('GLW',  'Corning',   40,   3),
    ]),
    ('Obesity / GLP-1', [
        ('LLY',  'EliLilly', 780,  10),
        ('REGN', 'Regeneron',1040,  7),
        ('VRTX', 'Vertex',   460,   7),
        ('AMGN', 'Amgen',    305,   7),
        ('ISRG', 'IntSurg',  440,   6),
        ('BIIB', 'Biogen',   215,   5),
        ('DXCM', 'Dexcom',    75,   4),
    ]),
    ('Gold Mining', [
        ('NEM',  'Newmont',   38,   7),
        ('FCX',  'Freeport',  45,   7),
        ('GDX',  'GoldETF',   30,   5),
        ('GDXJ', 'JrGold',    35,   4),
        ('GLD',  'GoldTrust', 185,  5),
    ]),
    ('Rare Earth / Metals', [
        ('LIN',  'Linde',    460,   8),
        ('APD',  'AirProd',  275,   6),
        ('FCX',  'Freeport',  45,   6),
        ('NUE',  'Nucor',    180,   5),
        ('ECL',  'Ecolab',   230,   5),
        ('SHW',  'Sherwin',  320,   5),
        ('DOW',  'Dow Inc',   55,   4),
    ]),
    ('Oil / Energy', [
        ('XOM',  'Exxon',    105,  10),
        ('CVX',  'Chevron',  155,   9),
        ('COP',  'Conoco',   118,   7),
        ('EOG',  'EOG',      120,   6),
        ('PSX',  'Phillips', 155,   6),
        ('VLO',  'Valero',   165,   6),
        ('SLB',  'SLB',       46,   5),
        ('OXY',  'Occident',  62,   5),
        ('HES',  'Hess',     155,   4),
    ]),
    ('Cybersecurity', [
        ('PANW', 'PaloAlto', 325,   8),
        ('CRWD', 'CrowdStr', 360,   8),
        ('FTNT', 'Fortinet',  70,   6),
        ('ZS',   'Zscaler',  190,   6),
        ('NET',  'Cloudflr',  95,   6),
        ('OKTA', 'Okta',      90,   5),
        ('S',    'Sentinel1', 23,   5),
    ]),
    ('Cloud / SaaS', [
        ('NOW',  'ServiceNow',750,  9),
        ('CRM',  'Salesfrc', 300,   8),
        ('ORCL', 'Oracle',   140,   8),
        ('SNOW', 'Snowflake',155,   7),
        ('DDOG', 'Datadog',  130,   7),
        ('WDAY', 'Workday',  260,   7),
        ('MDB',  'MongoDB',  310,   6),
    ]),
]

# ─────────────────────────────────────────────────────────────────────────────

def load_prices(path: str) -> dict:
    if os.path.exists(path):
        try:
            with open(path) as f:
                data = json.load(f)
            print(f"  Loaded live prices from {path}  ({len(data)} tickers)")
            return data
        except Exception as e:
            print(f"  Warning: could not read {path}: {e}")
    return {}

def simulate_prices(base_prices: dict) -> dict:
    """Generate random % moves so the heatmap looks lively without live data."""
    rng = random.Random()
    return {t: p * (1 + rng.gauss(0, 0.025)) for t, p in base_prices.items()}

def build_dataframe(live_prices: dict) -> pd.DataFrame:
    rows = []
    for theme, stocks in THEMES:
        for ticker, name, base, weight in stocks:
            cur = live_prices.get(ticker, base)
            pct = ((cur - base) / base) * 100.0
            rows.append(dict(
                theme=theme, ticker=ticker, name=name,
                base=base, price=round(cur, 2), pct=round(pct, 3), weight=weight
            ))
    df = pd.DataFrame(rows)
    return df

def draw_heatmap(df: pd.DataFrame, title_suffix: str = ''):
    themes = list(df['theme'].unique())
    n_themes = len(themes)
    ncols = 2
    nrows = math.ceil(n_themes / ncols)

    fig = plt.figure(figsize=(22, 13), facecolor='#0d1117')
    title = f'NASDAQ Shooter - Sector Heatmap{title_suffix}'
    fig.suptitle(title, color='#e6edf3', fontsize=15, fontweight='bold', y=0.993)

    # One big axes covering the figure (we draw everything manually)
    ax = fig.add_axes([0.01, 0.03, 0.98, 0.955])
    ax.set_xlim(0, ncols)
    ax.set_ylim(0, nrows)
    ax.set_axis_off()
    ax.set_facecolor('#0d1117')

    PAD   = 0.035   # gap between theme boxes
    HDR_H = 0.19    # header height (in data units)

    for idx, theme in enumerate(themes):
        col_i = idx % ncols
        row_i = nrows - 1 - (idx // ncols)

        bx = col_i + PAD * 0.6
        by = row_i + PAD * 0.4
        bw = 1.0 - PAD * 1.2
        bh = 1.0 - PAD * 0.8

        # ── Theme header ─────────────────────────────────────────
        ax.add_patch(mpatches.FancyBboxPatch(
            (bx, by + bh - HDR_H), bw, HDR_H,
            boxstyle='round,pad=0.01',
            facecolor='#161b22', edgecolor='#30363d', lw=0.8, zorder=2,
        ))
        ax.text(bx + bw / 2, by + bh - HDR_H / 2, theme,
                ha='center', va='center', color='#c9d1d9',
                fontsize=9.5, fontweight='bold', zorder=3)

        # ── Stock cells ───────────────────────────────────────────
        grp    = df[df['theme'] == theme].copy()
        total_w = grp['weight'].sum()

        cell_area_y = by + 0.01
        cell_area_h = bh - HDR_H - 0.025
        cell_area_x = bx + 0.01
        cell_area_w = bw - 0.02

        x_cur = cell_area_x
        for _, r in grp.iterrows():
            cw   = (r['weight'] / total_w) * cell_area_w
            ch   = cell_area_h
            cx   = x_cur
            cy   = cell_area_y
            mid_x = cx + cw / 2
            mid_y = cy + ch / 2

            color = pct_to_color(r['pct'])

            ax.add_patch(mpatches.FancyBboxPatch(
                (cx + 0.005, cy + 0.005), cw - 0.010, ch - 0.010,
                boxstyle='round,pad=0.005',
                facecolor=color, edgecolor='#0d1117', lw=0.6, zorder=2,
            ))

            sign   = '+' if r['pct'] >= 0 else ''
            # Font size proportional to market cap weight (2-12 → ~6-17pt)
            # but capped so text never overflows the cell width
            weight_fs  = 5.5 + (r['weight'] / 12.0) * 11.5   # 6.4 → 17
            max_by_w   = cw * 38                               # cell-width guard
            fs_t       = float(np.clip(weight_fs, 5.5, max_by_w))
            fs_p       = max(4.5, fs_t - 2.0)
            shadow     = [pe.withStroke(linewidth=1.5, foreground='#0d1117')]

            # Ticker
            ax.text(mid_x, mid_y + ch * 0.09, r['ticker'],
                    ha='center', va='center', color='white',
                    fontsize=fs_t, fontweight='bold',
                    path_effects=shadow, zorder=3)

            # Pct change — only if cell is wide enough
            if cw > 0.055:
                ax.text(mid_x, mid_y - ch * 0.12,
                        f"{sign}{r['pct']:.1f}%",
                        ha='center', va='center',
                        color=(1, 1, 1, 0.88),
                        fontsize=fs_p, path_effects=shadow, zorder=3)

            x_cur += cw

    # ── Colour-scale legend ───────────────────────────────────────
    legend_ax = fig.add_axes([0.25, 0.003, 0.50, 0.018])
    grad = np.linspace(0, 1, 512).reshape(1, -1)
    legend_ax.imshow(grad, aspect='auto', cmap=CMAP, extent=[0, 512, 0, 1])
    legend_ax.set_yticks([])
    ticks = [0, 128, 256, 384, 511]
    labels = ['−5%', '−2.5%', '0%', '+2.5%', '+5%']
    legend_ax.set_xticks(ticks)
    legend_ax.set_xticklabels(labels, color='#8b949e', fontsize=8)
    legend_ax.tick_params(length=0)
    for s in legend_ax.spines.values():
        s.set_visible(False)
    legend_ax.set_facecolor('#0d1117')

    fig.subplots_adjust(left=0, right=1, top=0.97, bottom=0.03)
    out_path = os.path.join(os.path.dirname(__file__), 'heatmap_output.png')
    plt.savefig(out_path, dpi=150, bbox_inches='tight',
                facecolor='#0d1117', edgecolor='none')
    print(f"  Saved → {out_path}")
    plt.show()

# ─────────────────────────────────────────────────────────────────────────────

def main():
    json_path = sys.argv[1] if len(sys.argv) > 1 else 'prices.json'
    live      = load_prices(json_path)

    # Build base-price dict for simulation fallback
    base_prices = {t: base for _, stocks in THEMES for (t, _, base, _) in stocks}

    if not live:
        print("  No prices.json found - using simulated price moves.")
        print("  Tip: click 'Python HM' in the game to export live prices,")
        print(f"       then re-run:  python heatmap.py prices.json\n")
        live = simulate_prices(base_prices)

    df = build_dataframe(live)

    # ── Summary table via pandas ──────────────────────────────────
    summary = (df.groupby('theme')['pct']
                 .agg(Stocks='count', Mean='mean', Min='min', Max='max')
                 .round(2))
    print("\n── Sector Summary ──────────────────────────────────")
    print(summary.to_string())
    print()

    suffix = ' (live)' if os.path.exists(json_path) else ' (simulated)'
    draw_heatmap(df, title_suffix=suffix)

if __name__ == '__main__':
    main()
