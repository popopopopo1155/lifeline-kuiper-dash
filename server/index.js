import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import dotenv from 'dotenv';
import { parseStringPromise } from 'xml2js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

// 🏮 [REINFORCED] 外部ファイルへの依存を排除し、サーバーの自己完結性を高めるためのインライン辞書
const NEWS_DICTIONARY = {
  POSITIVE: { keywords: ['安値', '安定', '増産', '豊作', '解消'], weight: 0.9 },
  NEGATIVE: {
    CRITICAL: { keywords: ['高騰', '停止', '封鎖', '不足', '枯渇'], weight: 1.5 },
    HIGH: { keywords: ['上昇', '不足', '制限', '懸念', '減産'], weight: 1.2 },
    NORMAL: { keywords: ['変動', '影響', '推移'], weight: 1.05 }
  }
};

const CATEGORY_NEWS_MAP = {
  RICE: { keywords: ['米', '不足', 'タイ米', '備蓄'], sensitivity: 1.1 },
  WATER: { keywords: ['水', '原油', '輸送', 'インフラ'], sensitivity: 0.8 },
  EGG: { keywords: ['卵', '鶏', '鳥インフル', '供給'], sensitivity: 1.2 },
  DAIRY: { keywords: ['牛乳', '酪農', '飼料', '乳製品'], sensitivity: 1.0 },
  BREAD: { keywords: ['食パン', '小麦', '原材料', '輸入小麦'], sensitivity: 0.9 },
  COMMON: { keywords: ['物価', '高騰', '地政学', '原油', '電気'], sensitivity: 1.0 }
};

// 🏮 [OFFICIAL STATS SOURCES] - e-Stat Mapping for Proxy
const ESTAT_ITEM_MAP = {
  rice:      { id: '0003421913', code: '01002' },
  bread:     { id: '0003421913', code: '01021' },
  egg:       { id: '0003421913', code: '01341' },
  milk:      { id: '0003421913', code: '01303' },
  tp:        { id: '0003412351', code: '04413' },
  detergent: { id: '0003412351', code: '04441' },
  water:     { id: '0003412351', code: '01982' },
  oil:       { id: '0003421913', code: '01601' },
  tissue:    { id: '0003412351', code: '04412' },
};

dotenv.config();

const app = express();
const PORT = 3005;
const MANUAL_DATA_PATH = path.join(process.cwd(), 'server', 'manual_data.json');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(cors());

let currentRisks = { activeRisks: [], categoryModifiers: {} };

// 🏮 [NEWS ANALYSIS ENGINE] - 地政学リスクと価格変動の予兆を捕捉
async function fetchAndAnalyzeNews() {
  try {
    const response = await axios.get('https://news.google.com/rss/search?q=' + encodeURIComponent('物価 高騰 不足 供給制限') + '&hl=ja&gl=JP&ceid=JP:ja');
    const result = await parseStringPromise(response.data);
    const items = result.rss.channel[0].item;

    const risks = [];
    const modifiers = {};

    items.slice(0, 15).forEach(item => {
      const title = item.title[0];
      const link = item.link[0];
      
      let weight = 1.0;
      Object.keys(NEWS_DICTIONARY.NEGATIVE).forEach(level => {
        if (NEWS_DICTIONARY.NEGATIVE[level].keywords.some(k => title.includes(k))) {
          weight = NEWS_DICTIONARY.NEGATIVE[level].weight;
        }
      });

      Object.keys(CATEGORY_NEWS_MAP).forEach(cat => {
        if (CATEGORY_NEWS_MAP[cat].keywords.some(k => title.includes(k))) {
          risks.push({ title, link, category: cat, weight });
          modifiers[cat] = { multiplier: (modifiers[cat]?.multiplier || 1.0) * weight };
        }
      });
    });

    currentRisks = { activeRisks: risks, categoryModifiers: modifiers };
    console.log(`📰 News Analysis Complete: ${new Date().toLocaleString('ja-JP')}`);
  } catch (err) {
    console.error('News analysis failed:', err.message);
  }
}

app.get('/api/news/risks', (req, res) => res.json(currentRisks));

app.post('/api/manual/register', async (req, res) => {
  const { item } = req.body;
  try {
    let manualItems = [];
    try {
      const existing = await fs.readFile(MANUAL_DATA_PATH, 'utf8');
      manualItems = JSON.parse(existing);
    } catch (e) { /* ignore */ }

    const index = manualItems.findIndex(i =>
      (i.itemUrl && i.itemUrl === item.itemUrl) || (i.asin && i.asin === item.asin)
    );

    if (index !== -1) {
      manualItems[index] = { ...manualItems[index], ...item, verified: true, lastVerified: new Date().toISOString() };
    } else {
      manualItems.push({ ...item, verified: true, lastVerified: new Date().toISOString() });
    }

    await fs.writeFile(MANUAL_DATA_PATH, JSON.stringify(manualItems, null, 2));
    res.json({ success: true, item: manualItems[index !== -1 ? index : manualItems.length - 1] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save manual data' });
  }
});

app.get('/api/snapshot', async (req, res) => {
  const SNAPSHOT_PATH = path.join(process.cwd(), 'server', 'amazon_snapshot.json');
  try {
    const data = await fs.readFile(SNAPSHOT_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(404).json({ error: 'Snapshot not found' });
  }
});

app.get('/api/keepa', async (req, res) => {
  const { asin, search } = req.query;
  const apiKey = process.env.KEEPA_API_KEY;
  const amazonTag = process.env.AMAZON_AFFILIATE_TAG || '';
  const SNAPSHOT_PATH = path.join(process.cwd(), 'server', 'amazon_snapshot.json');

  // 🏮 [SNAPSHOT PREFERENCE] - すでに収穫済みのデータがあれば API を叩かずに返す
  if (asin) {
    try {
      const snapshotRaw = await fs.readFile(SNAPSHOT_PATH, 'utf8');
      const snapshot = JSON.parse(snapshotRaw);
      if (snapshot[asin]) {
        console.log(`📦 Snapshot Hit: ${asin}`);
        const p = snapshot[asin];
        const baseUrl = `https://www.amazon.co.jp/gp/product/${asin}`;
        return res.json({
          products: [{
            asin: asin,
            title: p.title,
            currentPrice: p.currentPrice,
            avg90: p.avg90,
            csv: { [1]: p.history, [18]: p.history }, // グラフ描画互換モード
            affiliateUrl: amazonTag ? `${baseUrl}/?tag=${amazonTag}` : baseUrl,
          }],
          tokensLeft: 'SNAPSHOT_MODE',
          amazonTag
        });
      }
    } catch (e) { /* ignore error and fallback to API */ }
  }

  if (!apiKey) return res.status(500).json({ error: 'Keepa key missing' });

  try {
    let url = 'https://api.keepa.com/product?domain=5'; 
    let resultData;

    if (asin) {
      url += `&key=${apiKey}&asin=${asin}&stats=1`;
      const response = await axios.get(url);
      resultData = response.data;
    } else if (search) {
      url = `https://api.keepa.com/search?key=${apiKey}&domain=5&type=product&term=${encodeURIComponent(search)}`;
      const response = await axios.get(url);
      resultData = response.data;
    } else {
      return res.status(400).json({ error: 'No ASIN or Search term provided' });
    }

    if (resultData.products && resultData.products.length > 0) {
      resultData.products = resultData.products.slice(0, 10).map(p => {
        const baseUrl = `https://www.amazon.co.jp/gp/product/${p.asin}`;
        return {
          ...p,
          affiliateUrl: amazonTag ? `${baseUrl}/?tag=${amazonTag}` : baseUrl,
          currentPrice: p.stats?.current?.[0] || p.stats?.current?.[1] || -1
        };
      });
    }

    res.json({ 
      ...resultData,
      tokensLeft: resultData.tokensLeft || 0,
      amazonTag
    });
  } catch (err) {
    console.error('Keepa API error:', err.message);
    res.status(500).json({ error: 'Keepa API failed' });
  }
});

app.get('/api/estat', async (req, res) => {
  const { genreId } = req.query;
  const appId = process.env.VITE_ESTAT_APP_ID || process.env.ESTAT_APP_ID;
  const config = ESTAT_ITEM_MAP[genreId];

  if (!appId || !config) {
    return res.status(400).json({ error: 'Config missing or invalid genreId' });
  }

  const ESTAT_BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';
  const NATIONAL_AREA_CODE = '00000';

  try {
    const url = `${ESTAT_BASE_URL}?appId=${appId}&statsDataId=${config.id}&cdCat02=${config.code}&cdArea=${NATIONAL_AREA_CODE}`;
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
    console.log(`🏛️ State Stats Synced (Server Proxy): ${genreId}`);
  } catch (err) {
    console.error('e-Stat Proxy error:', err.message);
    res.status(500).json({ error: 'e-Stat API failed' });
  }
});

app.get('/api/admin/check-link', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let targetUrl = url;

  if (url.includes('hb.afl.rakuten.co.jp') && url.includes('pc=')) {
    try {
      const urlObj = new URL(url);
      const pc = urlObj.searchParams.get('pc');
      if (pc) {
        targetUrl = decodeURIComponent(pc);
        console.log(`🚀 Bypass Rakuten Redirect: -> ${targetUrl}`);
      }
    } catch (e) { /* fallback to original */ }
  }

  try {
    const stealthHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://www.google.com/'
    };

    const response = await axios.get(targetUrl, {
      headers: stealthHeaders,
      timeout: 15000, 
      maxRedirects: 10,
      validateStatus: () => true
    });

    if (response.status === 404) {
      return res.json({ status: 'broken', reason: '404 Not Found' });
    }

    const html = response.data.toLowerCase();

    if (url.includes('amazon.co.jp') && (html.includes('申し訳ございません') || html.includes('something went wrong') || html.includes('dog of amazon'))) {
      return res.json({ status: 'broken', reason: 'Amazon Dog Page (Dead)' });
    }

    const rakutenDeathSigns = ['item_error', 'item_not_found', 'item_not_available', 'item-error', 'err300'];
    if (url.includes('rakuten.co.jp') && (
      html.includes('ページが表示できません') ||
      html.includes('一致する商品は見つかりませんでした') ||
      rakutenDeathSigns.some(sign => html.includes(sign.toLowerCase()))
    )) {
      return res.json({ status: 'broken', reason: 'Rakuten Page Missing' });
    }

    res.json({ status: 'ok', responseCode: response.status });
  } catch (error) {
    console.error('Watchdog Error:', error.message);
    if (error.code === 'ECONNABORTED' && url.includes('hb.afl.rakuten.co.jp')) {
      return res.json({ status: 'unknown', reason: 'Redirect Timeout - Store alive but check skipped for safety' });
    }
    res.json({ status: 'unknown', reason: error.message });
  }
});

app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    console.error('⚠️ AI Key Missing in ENV');
    return res.status(500).json({ error: 'AI key missing' });
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `あなたは「生活必需品.com」の専属AI解析官です。
世帯人数: ${householdSize}人
現在の市場リスク: ${JSON.stringify(currentRisks.activeRisks.slice(0, 2))}
在庫状況: ${JSON.stringify(items)}

【指令】
1. 政府統計(e-Stat)に基づき、現在の市場の「真の買い時」を2点以内で提示せよ。
2. 日本語で、各25文字以内で、絵文字なし、句読点なしで出力せよ。
3. 信頼性を重視し、過激な表現は避けよ。`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ advice: text, risks: currentRisks });
    console.log('🔮 AI Intelligence Generated Successfully');
  } catch (err) {
    console.error('⚠️ AI Advice Generation Failed:', err.message);
    res.status(500).json({ error: 'AI failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
  fetchAndAnalyzeNews();
  setInterval(fetchAndAnalyzeNews, 3600000);
});
