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

// 尚 [OFFICIAL STATS SOURCES] - e-Stat Mapping for Vercel Proxy
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

// --- CACHE ---
let cachedRisks = null;
let lastUpdate = 0;
const CACHE_STALE = 1000 * 60 * 30; // 30 mins

/**
 * 繝九Η繝ｼ繧ｹ隗｣譫舌Ο繧ｸ繝・け (On-demand with cache, Deduplication & Recency Check)
 */
async function getRisks() {
  const now = Date.now();
  if (cachedRisks && (now - lastUpdate < CACHE_STALE)) {
    return cachedRisks;
  }

  const NEWS_DICTIONARY = {
    POSITIVE: { keywords: ['菴惹ｸ・, '螳牙ｮ・, '蠅礼肇', '雎贋ｽ・, '隗｣豸・] },
    NEGATIVE: {
      CRITICAL: { keywords: ['諤･鬨ｰ', '譫ｯ貂・, '荳崎ｶｳ', '鬮倬ｨｰ', '蛛懈ｭ｢'], weight: 1.5 },
      HIGH: { keywords: ['荳頑・', '蛟､荳翫￡', '諛ｸ蠢ｵ', '蜩∬埋'], weight: 1.25 }
    }
  };

  const CATEGORY_NEWS_MAP = {
    rice: { keywords: ['邀ｳ', '繧ｳ繝｡', '遞ｲ'], sensitivity: 1.0 },
    water: { keywords: ['豌ｴ', '鬟ｲ譁・, '譁ｭ豌ｴ'], sensitivity: 0.8 },
    tp: { keywords: ['邏・, '繝代Ν繝・, '繝・ぅ繝・す繝･', '繝医う繝ｬ繝・ヨ'], sensitivity: 0.7 },
    detergent: { keywords: ['豢怜王', '蛹門ｭｦ', '遏ｳ豐ｹ'], sensitivity: 0.4 },
    oil: { keywords: ['豐ｹ', '鬟溽畑豐ｹ', '螟ｧ雎・], sensitivity: 0.9 },
    COMMON: { keywords: ['迚ｩ豬・, '驕玖ｳ・, '蠅礼ｨ・, '蜀・ｮ・] }
  };

  try {
    const rssUrl = 'https://news.google.com/rss/search?q=%E7%89%A9%E4%BE%A1+%E5%80%A4%E4%B8%8A%E3%81%92+%E5%93%81%E8%96%84&hl=ja&gl=JP&ceid=JP:ja';
    const response = await axios.get(rssUrl, { timeout: 10000 });
    const result = await parseStringPromise(response.data);
    const items = result.rss.channel[0].item || [];
    const detectedRisks = [];
    const seenTitles = new Set();
    const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14; // 14譌･髢・

    items.forEach(item => {
      const title = item.title[0];
      const link = item.link[0];
      const pubDate = new Date(item.pubDate[0]).getTime();

      // 1. 魄ｮ蠎ｦ繝√ぉ繝・け (14譌･莉･荳雁燕縺ｮ繝九Η繝ｼ繧ｹ縺ｯ髯､螟・
      if (now - pubDate > TWO_WEEKS_MS) return;

      // 2. 繝昴ず繝・ぅ繝悶ル繝･繝ｼ繧ｹ縺ｯ髯､螟・
      if (NEWS_DICTIONARY.POSITIVE.keywords.some(k => title.includes(k))) return;

      // 3. 驥崎､・賜髯､
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
      timeout: 10000 // 尚 [REINFORCED] 繝上Φ繧ｰ髦ｲ豁｢逕ｨ10s繧ｿ繧､繝繧｢繧ｦ繝・
    });
    let rawItems = response.data.items || response.data.Items || [];
    let items = rawItems.map(i => {
      if (i.item) return { Item: i.item };
      if (i.Item) return i;
      return { Item: i };
    });
    if (keyword && keyword.includes('邀ｳ')) {
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
    const url = `${ESTAT_BASE_URL}?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=${NATIONAL_AREA_CODE}`;
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
    console.log(`鋤・・State Stats Synced (Vercel Proxy): ${genreId}`);
  } catch (err) {
    console.error('e-Stat Proxy error:', err.message);
    res.status(500).json({ error: 'e-Stat API failed' });
  }
});

app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const prompt = `荳門ｸｯ莠ｺ謨ｰ: ${householdSize}莠ｺ縲ょ惠蠎ｫ: ${JSON.stringify(items)}縲らｯ邏・→蛯呵塘縺ｮ繧｢繝峨ヰ繧､繧ｹ繧呈怙遏ｭ2縺､・亥推18譁・ｭ嶺ｻ･蜀・ｼ峨Ａ;
    const result = await model.generateContent(prompt);
    res.json({ advice: (await result.response).text() });
  } catch (error) { res.status(500).json({ error: 'AI Advice failed' }); }
});

app.get('/api/admin/check-link', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let targetUrl = url;

  // 尚 [RAKUTEN AFFILIATE BYPASS] 霆｢騾√し繝ｼ繝舌・縺ｮ諢丞峙逧・↑驕・ｻｶ繧帝∩縺代ｋ縺溘ａ縲∝膚蜩ゞRL繧堤峩謗･謚ｽ蜃ｺ
  if (url.includes('hb.afl.rakuten.co.jp') && url.includes('pc=')) {
    try {
      const urlObj = new URL(url);
      const pc = urlObj.searchParams.get('pc');
      if (pc) {
        targetUrl = decodeURIComponent(pc);
        console.log(`噫 Bypass Rakuten Redirect: -> ${targetUrl}`);
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
    
    // 尚 [DEATH DETECTION FINGERPRINTS]
    if (url.includes('amazon.co.jp') && (html.includes('逕ｳ縺苓ｨｳ縺斐＊縺・∪縺帙ｓ') || html.includes('something went wrong') || html.includes('dog of amazon'))) {
      return res.json({ status: 'broken', reason: 'Amazon Dog Page (Dead)' });
    }

    // 尚 [MULTI-FINGERPRINT]
    const rakutenDeathSigns = ['item_error', 'item_not_found', 'item_not_available', 'item-error', 'err300'];
    if (url.includes('rakuten.co.jp') && (
      html.includes('繝壹・繧ｸ縺瑚｡ｨ遉ｺ縺ｧ縺阪∪縺帙ｓ') || 
      html.includes('荳閾ｴ縺吶ｋ蝠・刀縺ｯ隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆') || 
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
    
    // 尚 [SMART RECOVERY]
    if (error.code === 'ECONNABORTED' && url.includes('hb.afl.rakuten.co.jp')) {
      return res.json({ status: 'unknown', reason: 'Redirect Timeout - Store alive but check skipped for safety' });
    }

    res.json({ status: 'unknown', reason: `Check Failed: ${error.message}`, lastChecked: Date.now() });
  }
});

export default app;
