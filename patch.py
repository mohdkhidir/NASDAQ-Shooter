"""
patch.py — injects all NASDAQ stocks into the game and replaces the heatmap
with the Plotly treemap iframe, then launches a local server.
"""

import re
import random
import shutil
import subprocess
import sys
import webbrowser
from pathlib import Path

GAME_DIR   = Path(__file__).parent
INDEX      = GAME_DIR / "index.html"
ORIGINAL   = GAME_DIR / "index_original.html"   # always patch from clean source
SYS32      = Path("C:/WINDOWS/system32")
STOCKS_TXT = SYS32 / "nasdaq_stocks.txt"
HM_SRC     = SYS32 / "nasdaq_heatmap.html"
HM_DEST    = GAME_DIR / "nasdaq_heatmap.html"

random.seed(42)

# ── Step 1: generate fresh Plotly heatmap into game dir ──────────────────────
# style.css lives alongside patch.py — already in game dir, no copy needed
print("[1/10] Generating heatmap...")
result = subprocess.run(
    [sys.executable, str(SYS32 / "heatmap.py"), "--out", str(HM_DEST)],
    capture_output=True, text=True
)
if result.returncode != 0:
    print("  heatmap.py error:", result.stderr[-500:])
    sys.exit(1)
print(f"  ok saved -> {HM_DEST}")

# ── Step 2: parse nasdaq_stocks.txt ──────────────────────────────────────────
print("[2/10] Parsing NASDAQ stock list...")
new_stocks: dict[str, str] = {}
with open(STOCKS_TXT, encoding="utf-8") as f:
    for line in f:
        line = line.rstrip()
        if not line or line.startswith("SYMBOL") or line.startswith("-"):
            continue
        parts = line.split()
        if len(parts) < 4:
            continue
        sym, etf, status = parts[0], parts[1], parts[2]
        name = " ".join(parts[3:])
        if status != "N":         continue   # only normal listings
        if etf == "Y":            continue   # no ETFs
        if len(sym) > 5:          continue   # skip long symbols
        if re.search(r"[^A-Z]", sym): continue  # letters only
        if sym[-1] in ("W", "R", "U", "Z", "P", "L") and len(sym) > 3:
            continue  # warrants / rights / units
        # strip boilerplate from name
        name = re.sub(
            r"\s*[-]\s*(Common Stock|Class [A-Z].*|Ordinary Shares.*"
            r"|American Dep.*|Each Representing.*|Voting.*)",
            "", name, flags=re.IGNORECASE,
        ).strip()[:40]
        new_stocks[sym] = name

print(f"  ok {len(new_stocks):,} stocks parsed")

# ── Step 3: read existing index.html ────────────────────────────────────────
print("[3/10] Reading index_original.html...")
html = ORIGINAL.read_text(encoding="utf-8")

# collect symbols already defined
existing = set(re.findall(r'^\s{2}([A-Z]{1,5}):\[', html, re.MULTILINE))
print(f"  existing symbols: {len(existing)}")

# ── Step 4: build new STOCK_DATA entries ────────────────────────────────────
print("[4/10] Building new stock entries...")

def infer_sector(sym: str, name: str) -> str:
    n = name.lower()
    if any(k in n for k in ("therapeut", "pharma", "biotech", "bio ", "bioscien",
                             "health", "medical", "oncol", "genomic", "clinical")):
        return "Biotech"
    if any(k in n for k in ("bank", "financial", "capital", "credit", "insurance",
                             "invest", "asset", "fund", "trust", "mortgage")):
        return "Finance"
    if any(k in n for k in ("technolog", "software", "system", "cyber", "cloud",
                             "data", "network", "digital", "comput", "semiconductor",
                             "robot", "ai ", "intel")):
        return "Tech"
    if any(k in n for k in ("energy", "solar", "oil", "gas", "power", "electric",
                             "clean", "wind", "mining", "resource")):
        return "Energy"
    if any(k in n for k in ("retail", "consumer", "food", "beverage", "restaurant",
                             "brand", "apparel", "fashion", "beauty", "grocer")):
        return "Consumer"
    if any(k in n for k in ("real estate", "reit", "property", "realty",
                             "housing", "apartment", "commercial")):
        return "Real Estate"
    if any(k in n for k in ("transport", "logistics", "freight", "shipping",
                             "airline", "aviation", "fleet")):
        return "Industrial"
    return "Other"

def base_price(sym: str) -> float:
    if len(sym) <= 2: return random.choice([50, 75, 100, 150, 200])
    if len(sym) == 3: return random.choice([10, 15, 20, 25, 30, 40])
    return random.choice([2, 3, 4, 5, 6, 8, 10, 12, 15])

new_data_lines = []
new_sector_lines = []
for sym, name in sorted(new_stocks.items()):
    if sym in existing:
        continue
    price = base_price(sym)
    vol   = round(random.uniform(0.020, 0.050), 3)
    trend = random.choice([-0.0002, -0.0001, 0.0000, 0.0001, 0.0002])
    safe  = name.replace("'", "\\'")
    new_data_lines.append(f"  {sym}:['{safe}',{price},{vol},{trend}]")
    sector = infer_sector(sym, name)
    new_sector_lines.append(f"  {sym}:'{sector}'")

added = len(new_data_lines)
print(f"  ok {added:,} new stocks to add")

# ── Step 5: inject into STOCK_DATA ──────────────────────────────────────────
print("[5/10] Injecting STOCK_DATA...")
anchor = "  ALKT:['Alkami Technology',24,0.028,0.0002],\n};"
if anchor not in html:
    print("  ERROR: STOCK_DATA anchor not found - aborting")
    sys.exit(1)

block = (
    "  ALKT:['Alkami Technology',24,0.028,0.0002],\n"
    "  // ── Full NASDAQ listings (auto-generated) ──────────────────────\n"
    + ",\n".join(new_data_lines)
    + "\n};"
)
html = html.replace(anchor, block, 1)
print("  ok STOCK_DATA updated")

# ── Step 6: inject into SECTOR_MAP ──────────────────────────────────────────
print("[6/10] Injecting SECTOR_MAP...")
sm_anchor = "  ALKT:'Tech'\n};"
if sm_anchor in html:
    sm_block = (
        "  ALKT:'Tech',\n"
        + ",\n".join(new_sector_lines)
        + "\n};"
    )
    html = html.replace(sm_anchor, sm_block, 1)
    print("  ok SECTOR_MAP updated")
else:
    print("  warn: SECTOR_MAP anchor not found - skipping (non-fatal)")

# ── Step 7: replace heatmap div with iframe ──────────────────────────────────
print("[7/10] Replacing heatmap panel with Plotly iframe...")
old_div = '<div id="heatmap-panel"></div>'
new_div = (
    '<div id="heatmap-panel">'
    '<iframe id="heatmap-iframe" src="nasdaq_heatmap.html" '
    'style="width:100%;height:100%;border:none;background:#0d1117;" '
    'frameborder="0"></iframe>'
    '</div>'
)
if old_div in html:
    html = html.replace(old_div, new_div, 1)
    print("  ok iframe injected")
else:
    print("  warn: heatmap-panel div not found - skipping")

# ── Step 8: make renderHeatmap a no-op (iframe handles it) ───────────────────
print("[8/10] Patching renderHeatmap()...")
old_render = "function renderHeatmap(){"
new_render  = "function renderHeatmap(){return;// replaced by Plotly iframe\n//"
if old_render in html:
    html = html.replace(old_render, new_render, 1)
    print("  ok renderHeatmap patched")
else:
    print("  warn: renderHeatmap not found - skipping")

# ── Step 9: write updated index.html ────────────────────────────────────────
print("[9/10] Writing index.html...")
INDEX.write_text(html, encoding="utf-8")
size_kb = INDEX.stat().st_size / 1024
print(f"  ok saved ({size_kb:.0f} KB)")

# ── Step 10: start local server + open browser ───────────────────────────────
print("[10/10] Starting local HTTP server on http://localhost:8000...")
server = subprocess.Popen(
    [sys.executable, "-m", "http.server", "8000", "--directory", str(GAME_DIR)],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)
import time; time.sleep(1)
webbrowser.open("http://localhost:8000")
print("  ok browser opened -> http://localhost:8000")
print("  Press Ctrl+C to stop the server.")
try:
    server.wait()
except KeyboardInterrupt:
    server.terminate()
    print("\n  server stopped.")
