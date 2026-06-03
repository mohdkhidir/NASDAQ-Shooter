# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import time, os, sys

OUT = r'C:\Users\User\nasdaq-shooter\Screenshoot'
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Screenshot the real estate page directly
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:8000/realestate.html', wait_until='domcontentloaded', timeout=15000)
    time.sleep(2)

    # Screenshot 1: Marketplace tab
    page.screenshot(path=OUT + r'\re_marketplace.png')
    sys.stdout.buffer.write(b'[1] marketplace saved\n')

    # Switch to My Properties tab
    page.evaluate("""() => {
        const re = JSON.parse(localStorage.getItem('nq_re_v2')||'null') || {properties:[],totalEarned:0,totalTaxPaid:0,totalSpent:0,pendingIncome:0,pendingDebits:0,lastSyncDay:0};
        re.properties = [
            {id:'p1',type:'apartment',area:'urban',name:'Skyline Residences',location:'Tech Quarter',
             purchasePrice:800000,currentValue:940000,baseRentDay:165,maintenanceDay:40,netIncomeDay:125,
             occupancy:85,size:420,improvements:['landscape','solar','security'],isLeased:true,
             tenant:'BlueTech Corp',leaseType:'Long-term (3yr)',leaseRent:130,totalEarned:4200,boughtDay:10},
            {id:'p2',type:'house',area:'town',name:'Garden Villa',location:'Main Street',
             purchasePrice:150000,currentValue:175000,baseRentDay:28,maintenanceDay:7,netIncomeDay:21,
             occupancy:90,size:180,improvements:['landscape'],isLeased:false,totalEarned:800,boughtDay:5},
            {id:'p3',type:'land',area:'megacity',name:'Prime Corner Lot',location:'Downtown Core',
             purchasePrice:2000000,currentValue:2250000,baseRentDay:150,maintenanceDay:20,netIncomeDay:130,
             occupancy:95,size:800,improvements:[],isLeased:false,totalEarned:600,boughtDay:2},
        ];
        re.totalEarned=5600; re.totalTaxPaid=1200;
        localStorage.setItem('nq_re_v2', JSON.stringify(re));
        const sh = {cash:95000, day:42, playerName:'KhidirTrader'};
        localStorage.setItem('nq_shared_v1', JSON.stringify(sh));
    }""")
    page.reload(wait_until='domcontentloaded')
    time.sleep(2)

    page.screenshot(path=OUT + r'\re_marketplace2.png')
    sys.stdout.buffer.write(b'[2] marketplace with data saved\n')

    # Switch to My Properties
    page.click('[data-tab="myprops"]')
    time.sleep(0.8)
    page.screenshot(path=OUT + r'\re_myprops.png')
    sys.stdout.buffer.write(b'[3] my properties saved\n')

    # Switch to Market Report
    page.click('[data-tab="report"]')
    time.sleep(0.8)
    page.screenshot(path=OUT + r'\re_report.png')
    sys.stdout.buffer.write(b'[4] market report saved\n')

    browser.close()
