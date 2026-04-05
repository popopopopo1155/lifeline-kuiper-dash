import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// --- CACHE ---
let cachedRisks = null;
let lastUpdate = 0;
const CACHE_STALE = 1000 * 60 * 30; // 30 mins

/**
 * ニュース解析ロジック (On-demand with cache, Deduplication & Recency Check)
 */
async function getRisks() {
  const now = Date.now();
  if (cachedRisks && (now - lastUpdate < CACHE_STALE)) {
    return cachedRisks;
  }

  const NEWS_DICTIONARY = {
    POSITIVE: { keywords: ['低下', '安定', '増産', '豊作', '解消'] },
    NEGATIVE: {
      CRITICAL: { keywords: ['急騰', '枯渇', '不足', '高騰', '停止'], weight: 1.5 },
      HIGH: { keywords: ['上昇', '値上げ', '懸念', '品薄'], weight: 1.25 }
    }
  };

  const CATEGORY_NEWS_MAP = {
    rice: { keywords: ['米', 'コメ', '稲'], sensitivity: 1.0 },
    water: { keywords: ['水', '飲料', '断水'], sensitivity: 0.8 },
    tp: { keywords: ['紙', 'パルプ', 'ティッシュ', 'トイレット'], sensitivity: 0.7 },
    detergent: { keywords: ['洗剤', '化学', '石油'], sensitivity: 0.4 },
    oil: { keywords: ['油', '食用油', '大豆'], sensitivity: 0.9 },
    COMMON: { keywords: ['物流', '運賃', '増税', '円安'] }
  };

  try {
    const rssUrl = 'https://news.google.com/rss/search?q=%E7%89%A9%E4%BE%A1+%E5%80%A4%E4%B8%8A%E3%81%92+%E5%93%81%E8%96%84&hl=ja&gl=JP&ceid=JP:ja';
    const response = await axios.get(rssUrl, { timeout: 10000 });
    const result = await parseStringPromise(response.data);
    const items = result.rss.channel[0].item || [];
    const detectedRisks = [];
    const seenTitles = new Set();
    const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14; // 14日間

    items.forEach(item => {
      const title = item.title[0];
      const link = item.link[0];
      const pubDate = new Date(item.pubDate[0]).getTime();

      // 1. 鮮度チェック (14日以上前のニュースは除外)
      if (now - pubDate > TWO_WEEKS_MS) return;

      // 2. ポジティブニュースは除外
      if (NEWS_DICTIONARY.POSITIVE.keywords.some(k => title.includes(k))) return;

      // 3. 重複排除
      const cleanTitle = title.split(' - ')[0];
      if (seenTitles.has(cleanTitle)) return;

      Object.keys(NEWS_DICTIONARY.NEGATIVE).forEach(level => {
        const { keywords } = NEWS_DICTIONARY.NEGATIVE[level];
        keywords.forEach(kw => {
          if (title.includes(kw)) {
            if (!seenTitles.has(cleanTitle)) {
              detectedRisks.push({ title, link, level });
              seenTitles.add(cleanTitle);
            }
          }
        });
      });
    });

    const modifiers = {};
    Object.keys(CATEGORY_NEWS_MAP).forEach(catId => {
      if (catId === 'COMMON') return;
      let maxWeight = 1.0;
      const mapping = CATEGORY_NEWS_MAP[catId];
      const relatedNews = detectedRisks.filter(news => 
        mapping.keywords.some(k => news.title.includes(k)) || 
        CATEGORY_NEWS_MAP.COMMON.keywords.some(k => news.title.includes(k))
      );
      relatedNews.forEach(news => {
        const impact = 1 + (NEWS_DICTIONARY.NEGATIVE[news.level].weight - 1) * mapping.sensitivity;
        if (impact > maxWeight) maxWeight = impact;
      });
      modifiers[catId] = {
        multiplier: maxWeight,
        riskLevel: maxWeight > 1.3 ? 'CRITICAL' : (maxWeight > 1.1 ? 'HIGH' : 'NORMAL'),
        relevantNews: relatedNews.slice(0, 3)
      };
    });

    cachedRisks = {
      lastUpdated: new Date().toISOString(),
      activeRisks: detectedRisks.slice(0, 5),
      categoryModifiers: modifiers
    };
    lastUpdate = now;
    return cachedRisks;
  } catch (error) {
    console.error('Scraping or parsing failed:', error.message);
    return cachedRisks || { lastUpdated: new Date().toISOString(), activeRisks: [], categoryModifiers: {} };
  }
}

// --- ROUTES ---

app.get('/api/news/risks', async (req, res) => {
  const risks = await getRisks();
  res.json(risks);
});

app.get('/api/rakuten', async (req, res) => {
  const { keyword } = req.query;
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  try {
    const url = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
    const params = { applicationId: appId, accessKey, affiliateId, keyword, format: 'json', hits: 100 };
    const response = await axios.get(url, { 
      params, 
      headers: { 'Referer': 'https://www.hitsujuhin.com/', 'Origin': 'https://www.hitsujuhin.com/' },
      timeout: 10000 // 🏮 [REINFORCED] ハング防止用10sタイムアウト
    });
    let rawItems = response.data.items || response.data.Items || [];
    let items = rawItems.map(i => {
      if (i.item) return { Item: i.item };
      if (i.Item) return i;
      return { Item: i };
    });
    if (keyword && keyword.includes('米')) {
      items = items.filter(i => {
        const price = Number(i.Item.itemPrice || i.Item.price);
        if (keyword.includes('10kg')) return price >= 5400; 
        if (keyword.includes('5kg')) return price >= 2940; 
        return true;
      });
    }
    res.json({ Items: items });
  } catch (error) { 
    console.error('Rakuten API failed:', error.message);
    res.status(500).json({ error: 'Rakuten API failed', details: error.message }); 
  }
});

app.get('/api/keepa', async (req, res) => {
  // Syncing ASIN metadata with Keepa API (v6.61 refresh)
  const { asin } = req.query;
  const key = process.env.KEEPA_API_KEY;
  const tag = process.env.AMAZON_AFFILIATE_TAG;
  const baseUrl = `https://www.amazon.co.jp/gp/product/${asin}`;
  const affiliateUrl = tag ? `${baseUrl}/?tag=${tag}` : baseUrl;

  if (!key) {
    return res.json({ products: [], error: 'KEEPA_API_KEY missing in server env', affiliateUrl });
  }

  try {
    const response = await axios.get('https://api.keepa.com/product', { 
      params: { key, domain: 5, asin, stats: 1 },
      timeout: 15000 
    });
    res.json({ ...response.data, affiliateUrl });
  } catch (error) {
    const message = error.response ? `Keepa API Error: ${error.response.status} ${JSON.stringify(error.response.data)}` : error.message;
    console.error('Keepa Proxy Error:', message);
    res.json({ products: [], error: message, affiliateUrl });
  }
});

app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const prompt = `世帯人数: ${householdSize}人。在庫: ${JSON.stringify(items)}。節約と備蓄のアドバイスを最短2つ（各18文字以内）。`;
    const result = await model.generateContent(prompt);
    res.json({ advice: (await result.response).text() });
  } catch (error) { res.status(500).json({ error: 'AI Advice failed' }); }
});

app.get('/api/admin/check-link', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let targetUrl = url;

  // 🏮 [RAKUTEN AFFILIATE BYPASS] 転送サーバーの意図的な遅延を避けるため、商品URLを直接抽出
  if (url.includes('hb.afl.rakuten.co.jp') && url.includes('pc=')) {
    try {
      const urlObj = new URL(url);
      const pc = urlObj.searchParams.get('pc');
      if (pc) {
        targetUrl = decodeURIComponent(pc);
        console.log(`🚀 Bypass Rakuten Redirect: -> ${targetUrl}`);
      }
    } catch (e) { /* fallback */ }
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
    
    // 🏮 [DEATH DETECTION FINGERPRINTS]
    if (url.includes('amazon.co.jp') && (html.includes('申し訳ございません') || html.includes('something went wrong') || html.includes('dog of amazon'))) {
      return res.json({ status: 'broken', reason: 'Amazon Dog Page (Dead)' });
    }

    // 🏮 [MULTI-FINGERPRINT]
    const rakutenDeathSigns = ['item_error', 'item_not_found', 'item_not_available', 'item-error', 'err300'];
    if (url.includes('rakuten.co.jp') && (
      html.includes('ページが表示できません') || 
      html.includes('一致する商品は見つかりませんでした') || 
      rakutenDeathSigns.some(sign => html.includes(sign.toLowerCase()))
    )) {
      return res.json({ status: 'broken', reason: 'Rakuten Page Missing' });
    }

    res.json({ 
      status: 'ok', 
      responseCode: response.status,
      lastChecked: Date.now()
    });

  } catch (error) {
    console.error('Link Check Error:', error.message);
    
    // 🏮 [SMART RECOVERY]
    if (error.code === 'ECONNABORTED' && url.includes('hb.afl.rakuten.co.jp')) {
      return res.json({ status: 'unknown', reason: 'Redirect Timeout - Store alive but check skipped for safety' });
    }

    res.json({ status: 'unknown', reason: `Check Failed: ${error.message}`, lastChecked: Date.now() });
  }
});

export default app;
