# CLAUDE.md — NASDAQ Shooter project conventions

## Git workflow

Always use feature branches. Never commit directly to `main`.

```
git checkout -b feature/<short-name>   # start work
# ... make changes, commit ...
git push origin feature/<short-name>
gh pr create --base main --head feature/<short-name>
```

After the PR is merged on GitHub, delete the feature branch:

```
git checkout main
git pull origin main
git branch -d feature/<short-name>
```

## PR format

Use `gh pr create` with:
- A concise title (imperative verb, ≤ 70 chars)
- Body covering: what changed, why, and a short test plan checklist

Always append to the body:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Links

Always show URLs as short markdown links, never as bare long URLs. Format:

```
[Preview](https://...)
```

## Mobile HUD Design System

New mobile elements are **hidden on desktop** and activated via `@media(max-width:600px)` in `index.html`. All styles live at the top of `style.css`.

### Components

- **`.mob-hud`** — 4-card stat strip (NET WORTH / CASH / P&L / DAY) positioned between the chart and the sidebar. Uses `display:flex` on mobile, `display:none` on desktop.
- **`.mob-nav`** — Bottom action bar (Portfolio / Ranks / R.Estate / Save / Logout) with icon + label buttons. Uses `display:flex` on mobile, `display:none` on desktop.

### Color modifier classes (mob-hud-val)

| Class | Color | Use |
|---|---|---|
| `mob-up` | `var(--up, #3fb950)` | Positive P&L / net worth gain |
| `mob-dn` | `var(--dn, #f85149)` | Negative P&L / net worth loss |
| `mob-blue` | `var(--bl, #58a6ff)` | Cash balance |
| `mob-gold` | `var(--gd, #ffd700)` | Day counter |

### Compact number formatter

Use `fmtK(v)` for tight mobile cards instead of `fmt(v)`:

```javascript
function fmtK(v){
  const a=Math.abs(v), s=v<0?'-':'';
  if(a>=1e6) return s+'$'+(a/1e6).toFixed(1)+'M';
  if(a>=1e4) return s+'$'+(a/1000).toFixed(1)+'K';
  return s+'$'+a.toFixed(0);
}
```

Output examples: `$18.2K`, `$1.5M`, `+$950`

### renderHUD() sync rule

All desktop HUD IDs (`hud-net`, `hud-cash`, `hud-portfolio`, `hud-pnl`) remain unchanged. The mobile strip uses separate `mob-*` IDs (`mob-net`, `mob-cash`, `mob-pnl`, `mob-day`) synced at the end of `renderHUD()`.

### Layout rules

- Chart height: `220px` on `≤600px`, `180px` on `≤360px`
- `.net-worth-bar` (desktop status bar) → `display:none !important` on mobile
- `.sp-ctrl-bar` (Show: checkboxes row) → `display:none !important` on mobile
- `#bar-ach` (achievements bar) → `display:none` on mobile
- Always add `padding-bottom: env(safe-area-inset-bottom, 0px)` to `.mob-nav` for iPhone notch/home-indicator support
- Use `-webkit-tap-highlight-color: transparent` on all mobile tap targets
