const fs = require('fs');
const https = require('https');
const path = require('path');

// 設定
const MOCK_DATA_PATH = path.join(__dirname, '../src/data/mockData.ts');
const OUTPUT_PATH = path.join(__dirname, '../server/amazon_snapshot.json');
const KEEPA_API_KEY = '5cm303g78tl9pungfs0ccj42mftedb1u6e8ostesfvlld26d4a7uhin9kgtgs5gj';

async function harvest() {
  console.log('--- Start Data Harvest (Standard Fetch Mode) ---');

  // 1. ASIN 抽出
  const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
  const asinRegex = /asin:\s*'([A-Z0-9]{10})'/g;
  const asins = new Set();
  let match;
  while ((match = asinRegex.exec(content)) !== null) {
    asins.add(match[1]);
  }

  const asinList = Array.from(asins);
  console.log(`Found ${asinList.length} unique ASINs:`, asinList);

  if (asinList.length === 0) {
    console.error('No ASINs found in mockData.ts');
    return;
  }

  // 2. Keepa API コール (Batch)
  const asinQuery = asinList.join(',');
  const url = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=5&asin=${asinQuery}&stats=90`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response body:', text.substring(0, 500));
      return;
    }

    const result = await response.json();
    if (!result.products) {
      console.error('API Logic Error: No products field found in result.');
      return;
    }

    const snapshot = {};
    
    result.products.forEach(p => {
      const csv = p.csv || [];
      const currentPrice = p.stats ? Math.round(p.stats.buyBoxItemPriceLast / 100) : null;
      const avg90 = p.stats ? Math.round(p.stats.avg90_1 / 100) : null;

      // グラフ用データ抽出 (Amazon もしくは Buy Box)
      const priceHistoryRaw = csv[18] || csv[1] || [];
      const historyPoints = [];
      for (let i = 0; i < priceHistoryRaw.length; i += 2) {
        const price = priceHistoryRaw[i+1];
        if (price > 0) {
          historyPoints.push(Math.round(price / 100));
        }
      }

      snapshot[p.asin] = {
        title: p.title,
        currentPrice: currentPrice || (historyPoints.length > 0 ? historyPoints[historyPoints.length - 1] : null),
        avg90: avg90,
        history: historyPoints.slice(-30),
        lastUpdate: new Date().toISOString()
      };
    });

    // 3. 保存
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2));
    console.log('--- Harvest Complete! Snapshot saved to server/amazon_snapshot.json ---');
    console.log('Result Summary:', Object.keys(snapshot).length, 'ASINs processed.');
  } catch (err) {
    console.error('Fetch Fatal Error:', err.message);
  }
}

harvest();
