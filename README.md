# NASDAQ Shooter 📈

A browser-based stock market simulation game. Start with **$10,000**, trade 300+ real stocks and ETFs, grow your portfolio, and compete on the leaderboard — all in a single HTML file with no install required.

## Play

Open `stock-game.html` in any modern browser. No server, no dependencies, no build step.

## Features

### Trading
- **300+ instruments** — NASDAQ tech stocks, S&P 500 blue chips, sector ETFs, bond ETFs, index ETFs
- Buy and sell shares with real-time simulated price movement
- Live P&L tracking: cash, portfolio value, net worth, and daily return

### Charts & Market Data
- Candlestick price chart with crosshair tooltip
- Adjustable simulation speed: 1× · 2× · 5× · 10× · 25×
- Per-stock company overview, institutional ownership, and top shareholders

### Research Panel
- **Fundamentals tab** — EPS, P/E ratio, book value, dividend yield, shares outstanding
- **ETF data** — AUM, expense ratio, distribution yield, duration (bonds)
- Company logos fetched live from Clearbit

### Search & Filter
- Instant search by ticker or company name
- Filter by sector: Tech, Finance, Health, Energy, Consumer, Industrials, Comms, Utility, Realty, Materials
- Filter by asset class: Stocks, Index ETFs, Sector ETFs, Bond ETFs
- Filter by market cap size and valuation

### Portfolio Dashboard
- Net worth history chart
- Asset allocation bar chart
- Performance stats: win rate, average gain/loss, best/worst trade
- **15 achievements** to unlock (First Trade, Diamond Hands, Bear Slayer, and more)

### Leaderboard
- Local leaderboard stores up to 500 scores
- Sort by net worth or return %
- Gold / silver / bronze rank badges

### UI
- Dark and light theme toggle
- Fully responsive — works on desktop, tablet, and mobile
- Watchlist quick-select bar
- Trade log with timestamped buy/sell history

## How to Play

1. Open `stock-game.html`
2. Enter your trader name
3. Search for a stock or pick one from the watchlist
4. Set share quantity and click **Buy** or **Sell**
5. Watch prices move in real time and manage your portfolio
6. Save your score to the leaderboard when done

## Instruments Included

| Category | Examples |
|---|---|
| NASDAQ Tech | AAPL, MSFT, NVDA, AMD, TSLA, META, AMZN |
| S&P 500 | JPM, JNJ, XOM, WMT, LMT, LLY, V, MA |
| Index ETFs | SPY, QQQ, VTI, VOO, ARKK, TQQQ, SQQQ |
| Sector ETFs | XLK, XLF, XLE, SMH, IBB, HACK, BOTZ |
| Bond ETFs | TLT, AGG, BND, HYG, LQD, TIP, EMB |

## Tech Stack

Plain HTML · CSS · vanilla JavaScript — zero frameworks, zero dependencies.

## License

MIT
