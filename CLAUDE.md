# CLAUDE.md — NASDAQ Shooter project conventions

## Project overview

NASDAQ Shooter is a browser-based stock trading simulator built entirely with vanilla HTML/CSS/JavaScript (no frameworks, no build step). Players start with $10,000 and trade 300+ simulated NASDAQ stocks, ETFs, and commodities. The app runs as a standalone PWA (Progressive Web App) with offline support via a service worker.

Bonus modules extend gameplay into real estate acquisition, facilities management, and an interactive trading strategy mind map.

---

## Repository structure

```
NASDAQ-Shooter/
├── index.html            # Core game — all JS/CSS/HTML inline (~9500 lines)
├── index_original.html   # Snapshot backup of the original index
├── style.css             # Shared styles: themes, modals, tabs, heatmap cells
├── re_style.css          # Real estate module styles
│
├── realestate.html       # Real estate acquisition spin-off module
├── buildings.html        # Building/facilities management for properties
├── mindmap.html          # Interactive mind map of trading strategies
├── nasdaq_heatmap.html   # Plotly treemap heatmap of 300+ stocks by sector
│
├── manifest.json         # PWA manifest (standalone, finance/games categories)
├── sw.js                 # Service worker — network-first, offline fallback
├── icon.svg              # App icon
│
├── heatmap.py            # Generate sector treemap with pandas/matplotlib
├── patch.py              # Inject stocks into index.html, launch dev server
├── take_screenshot.py    # Playwright automation for real estate screenshots
│
└── Screenshoot/
    └── prices.json       # Sample price data export
```

---

## Tech stack

**Frontend (runtime):**
- Vanilla HTML5, CSS3 (custom properties for theming), ES6+ JavaScript
- No frameworks — React, Vue, Angular are absent
- Canvas API for candlestick charts and crosshair tooltips
- LocalStorage for all persistence (portfolio, leaderboard, settings, achievements)
- Clearbit API for company logos (external fetch at runtime)
- Plotly.js (CDN) for the sector heatmap treemap

**Backend / dev tooling (Python 3, not runtime):**
- `pandas`, `numpy`, `matplotlib`, `seaborn` — heatmap generation in `heatmap.py`
- `playwright` — browser automation in `take_screenshot.py`
- `http.server` — launched by `patch.py` for local development

**Deployment:**
- Pure static files — no server required for normal play
- PWA installable on desktop/mobile via `manifest.json` + `sw.js`

---

## Running the app

**Quickest way (no server):**
```bash
# Open directly in browser — double-click index.html or:
open index.html
```

**Local dev server (required for PWA features and screenshots):**
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

**Full dev bootstrap (inject stocks + launch server):**
```bash
python patch.py
# Reads nasdaq_stocks.txt, patches index.html, starts http.server on port 8000
```

---

## Python utilities

| Script | Purpose |
|--------|---------|
| `patch.py` | Batch-injects 300+ stocks into `index.html`, embeds the heatmap iframe, launches `http.server 8000` |
| `heatmap.py` | Generates a matplotlib/seaborn sector treemap from `Screenshoot/prices.json` (or built-in random data) |
| `take_screenshot.py` | Uses Playwright to open `realestate.html`, pre-populate localStorage with test data, and save PNG screenshots |

Run them from the repo root with Python 3. No virtual environment is tracked; install deps manually:
```bash
pip install pandas numpy matplotlib seaborn playwright
playwright install chromium
```

---

## Key code areas in index.html

Because all game logic lives in one file, here are the main sections:

| Concept | Where to look |
|---------|--------------|
| Stock definitions (ticker, name, sector, price, fundamentals) | `const stocks = [...]` near top of `<script>` |
| Price simulation (Brownian motion tick) | `function updatePrices()` |
| Buy/sell logic | `function buyStock()` / `function sellStock()` |
| Portfolio & net worth calculation | `function updatePortfolio()` |
| Candlestick chart (Canvas API) | `function drawChart()` / `function drawCandlestick()` |
| LocalStorage read/write | `function saveState()` / `function loadState()` |
| Leaderboard (500-entry cap) | `function updateLeaderboard()` |
| Dividend DRIP | `function processDividends()` |
| Achievement system (15 achievements) | `const achievements = [...]` + `function checkAchievements()` |
| Theme toggle (dark/light) | CSS variables + `function toggleTheme()` |
| AI players | `function updateAIPlayers()` |
| News feed generation | `function generateNews()` |

---

## LocalStorage keys

| Key | Content |
|-----|---------|
| `portfolio` | JSON: holdings object `{ ticker: { shares, avgCost } }` |
| `cash` | Number: current cash balance |
| `netWorthHistory` | JSON array of `{ date, value }` |
| `leaderboard` | JSON array of score entries (max 500) |
| `achievements` | JSON: unlocked achievement IDs |
| `theme` | `"dark"` or `"light"` |
| `transactions` | JSON array of trade history |

---

## Testing

There are no automated tests. Manual QA steps:

1. Open `index.html` in a browser
2. Search for a stock, buy shares, verify portfolio updates
3. Advance time ticks and confirm price movement and dividend events
4. Confirm chart renders, tooltips show on hover
5. Check leaderboard entry is saved after selling
6. For the real estate module: open `realestate.html` and verify property acquisition and income simulation
7. Run `take_screenshot.py` for a visual regression snapshot of the real estate UI

---

## Code conventions

- **Self-contained files.** Each HTML page includes its own `<style>` and `<script>` blocks. Shared styles go in `style.css` (main game) or `re_style.css` (real estate).
- **No build pipeline.** No transpilation, bundling, or minification. Ship the source directly.
- **No frameworks.** Keep all logic in vanilla JS. Do not introduce npm, React, or any bundler.
- **Inline comments only when non-obvious.** The codebase uses minimal comments; add one only when the "why" is not evident from the code.
- **Theme via CSS variables.** All colors are defined as `--var-name` in `:root` and `[data-theme="light"]` blocks in `style.css`. Never hardcode colors in JS.
- **LocalStorage is the database.** All state persists through `saveState()`/`loadState()`. Keep the schema consistent across saves.

---

## Git workflow

Always use feature branches. Never commit directly to `main`.

```
git checkout -b feature/<short-name>   # start work
# ... make changes, commit ...
git push -u origin feature/<short-name>
gh pr create --base main --head feature/<short-name>
```

After the PR is merged on GitHub, delete the feature branch:

```
git checkout main
git pull origin main
git branch -d feature/<short-name>
```

---

## PR format

Use `gh pr create` with:
- A concise title (imperative verb, ≤ 70 chars)
- Body covering: what changed, why, and a short test plan checklist

Always append to the body:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
