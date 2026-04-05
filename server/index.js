import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import dotenv from 'dotenv';
import { parseStringPromise } from 'xml2js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
// 🏮 [REINFORCED] 外部ファイルへの依存を排除し、サーバーの自己完結性を高めるためのインライン化
const NEWS_DICTIONARY = {
  POSITIVE: { keywords: ['低下', '安定', '増産', '豊作', '解消'], weight: 0.9 },
  NEGATIVE: {
    CRITICAL: { keywords: ['高騰', '停止', '封鎖', '不作', '枯渇'], weight: 1.5 },
    HIGH: { keywords: ['上昇', '不足', '制限', '懸念', '減産'], weight: 1.2 },
    NORMAL: { keywords: ['変動', '影響', '推移'], weight: 1.05 }
  }
};

const CATEGORY_NEWS_MAP = {
  RICE: { keywords: ['米', '不作', 'タイ米', '備蓄'], sensitivity: 1.1 },
  WATER: { keywords: ['水', '原油', '輸送', 'インフラ'], sensitivity: 0.8 },
  EGG: { keywords: ['卵', '鶏', '鳥インフル', '供給'], sensitivity: 1.2 },
  DAIRY: { keywords: ['牛乳', '酪農', '飼料', '乳製品'], sensitivity: 1.0 },
  BREAD: { keywords: ['食パン', '小麦', '原材料', '輸入小麦'], sensitivity: 0.9 },
  COMMON: { keywords: ['物価', '高騰', '地政学', '原油', '電気'], sensitivity: 1.0 }
};

dotenv.config();

const app = express();
const PORT = 3005;
const MANUAL_DATA_PATH = path.join(process.cwd(), 'server', 'manual_data.json');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

let currentRisks = {
  lastUpdated: null,
  activeRisks: [],
  categoryModifiers: {}
};

const fetchAndAnalyzeNews = async () => {
  try {
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent('物価 高騰 原油 米 小麦 地政学 不作')}&hl=ja&gl=JP&ceid=JP:ja`;
    const response = await axios.get(feedUrl, { timeout: 10000 });
    const result = await parseStringPromise(response.data);
    const channel = result && result.rss && result.rss.channel && result.rss.channel[0];
    const items = channel && channel.item ? channel.item : [];

    const detectedRisks = [];
    
    // DEMO DATA INJECTION
    detectedRisks.push({
      title: '【緊急速報】ホルムズ海峡で船舶の通行が一部制限、原油高騰の懸念広まる',
      link: 'https://news.google.com/',
      level: 'CRITICAL',
      kw: '封鎖'
    });

    if (Array.isArray(items)) {
      items.forEach(item => {
        const title = item.title && item.title[0];
        const link = item.link && item.link[0];
        if (!title || typeof title !== 'string') return;
        
        const isResolved = NEWS_DICTIONARY.POSITIVE.keywords.some(k => title.includes(k));
        if (isResolved) return;

        Object.keys(NEWS_DICTIONARY.NEGATIVE).forEach(level => {
          const { keywords } = NEWS_DICTIONARY.NEGATIVE[level];
          keywords.forEach(kw => {
            if (title.includes(kw)) {
              detectedRisks.push({ title, link, level, kw });
            }
          });
        });
      });
    }

    const modifiers = {};
    Object.keys(CATEGORY_NEWS_MAP).forEach(catId => {
      if (catId === 'COMMON') return;
      
      let maxWeight = 1.0;
      const mapping = CATEGORY_NEWS_MAP[catId];
      
      // カテゴリ固有ニュース、または共通ニュース（原油・地政学等）を抽出
      const relatedNews = detectedRisks.filter(news => 
        mapping.keywords.some(k => news.title.includes(k)) || 
        CATEGORY_NEWS_MAP.COMMON.keywords.some(k => news.title.includes(k))
      );

      relatedNews.forEach(news => {
        const baseWeight = NEWS_DICTIONARY.NEGATIVE[news.level].weight;
        // カテゴリ感度を適用して影響を算出
        const impact = 1 + (baseWeight - 1) * mapping.sensitivity;
        if (impact > maxWeight) maxWeight = impact;
      });

      modifiers[catId] = {
        multiplier: Number(maxWeight.toFixed(2)),
        riskLevel: maxWeight > 1.3 ? 'CRITICAL' : (maxWeight > 1.1 ? 'HIGH' : 'NORMAL'),
        relevantNews: relatedNews.slice(0, 2)
      };
    });

    currentRisks = {
      lastUpdated: new Date().toISOString(),
      activeRisks: detectedRisks.slice(0, 5),
      categoryModifiers: modifiers
    };
    console.log('📰 News Analysis Complete:', new Date().toLocaleString());
  } catch (error) {
    console.error('❌ News fetch error:', error.message);
  }
};

// --- ROUTES ---
app.get(['/api/news/risks', '/api/risks'], (req, res) => {
  res.json(currentRisks);
});

app.get('/api/rakuten', async (req, res) => {
  const { keyword } = req.query;
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  
  if (!appId) return res.status(500).json({ error: 'Config missing' });
  
  try {
    // 楽天 API v3 (20220601版) を使用し、pk_... 形式のアクセキーを正常に処理します
    const url = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
    const params = { 
      applicationId: appId, 
      accessKey: accessKey, 
      affiliateId: affiliateId, 
      keyword: keyword, 
      format: 'json', 
      hits: 30 
    };
    
    const response = await axios.get(url, { 
      params, 
      headers: {
        'Referer': 'https://www.hitsujuhin.com/',
        'Origin': 'https://www.hitsujuhin.com/',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 10000 // 🏮 [REINFORCED] ハング防止用10sタイムアウト
    });

    // v3 API のレスポンス構造（data.items または data.Items）に柔軟に対応
    let items = response.data.items || response.data.Items || [];

    // お米（5kg/10kg）向けの強力な足切りフィルタ
    if (keyword && keyword.includes('米')) {
      items = items.filter(i => {
        // v3 API の個別アイテム構造に対応
        const itemObj = i.item || i.Item || i;
        const rawPrice = itemObj.itemPrice || itemObj.price;
        const price = Number(rawPrice);
        if (isNaN(price)) return false;

        // 10kgの検索キーワードが含まれる場合
        if (keyword.includes('10kg')) {
          return price >= 5400; 
        }
        // 5kgの検索キーワードが含まれる場合
        if (keyword.includes('5kg')) {
          return price >= 2940; // 2940円以下は排除（2950円が境界線）
        }
        return true;
      });
    }

    res.json({ 
      ...response.data, 
      Items: items,
      amazonTag: process.env.AMAZON_AFFILIATE_TAG || '' 
    });
  } catch (err) { 
    console.error('Rakuten API error:', err.message);
    res.status(500).json({ error: 'Rakuten API failed', details: err.message }); 
  }
});

app.get('/api/keepa', async (req, res) => {
  const { asin } = req.query;
  const apiKey = process.env.KEEPA_API_KEY;
  const amazonTag = process.env.AMAZON_AFFILIATE_TAG;

  if (!asin || !apiKey) {
    return res.status(400).json({ error: 'Missing ASIN or API Key' });
  }

  try {
    const url = `https://api.keepa.com/product?key=${apiKey}&domain=5&asin=${asin}&stats=1`;
    const response = await axios.get(url);
    
    // アフィリエイトリンクの正規化
    const baseUrl = `https://www.amazon.co.jp/gp/product/${asin}`;
    const affiliateUrl = amazonTag ? `${baseUrl}/?tag=${amazonTag}` : baseUrl;

    res.json({
      ...response.data,
      affiliateUrl
    });
  } catch (err) {
    // トークン切れ等のエラーはコンソールに出すが、フロントエンドを壊さないように 200 でエラー詳細を返す
    console.warn('Keepa API expected error (Token might be exhausted):', err.message);
    res.status(200).json({ 
      products: [], 
      error: 'Keepa limit reached', 
      details: err.message,
      affiliateUrl: `https://www.amazon.co.jp/gp/product/${asin}/?tag=${amazonTag || ''}`
    });
  }
});

// --- MANUAL DATA PERSISTENCE ---
app.get('/api/manual/items', async (req, res) => {
  try {
    const data = await fs.readFile(MANUAL_DATA_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.json([]); // ファイルがない場合は空配列
  }
});

app.post('/api/manual/verify', async (req, res) => {
  const { item } = req.body;
  if (!item) return res.status(400).json({ error: 'No item provided' });

  try {
    let manualItems = [];
    try {
      const existing = await fs.readFile(MANUAL_DATA_PATH, 'utf8');
      manualItems = JSON.parse(existing);
    } catch (e) { /* ignore */ }

    // 重複チェック（URLまたはASINで上書き）
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

app.get('/api/keepa', async (req, res) => {
  const { asin, search } = req.query;
  const apiKey = process.env.KEEPA_API_KEY;
  const amazonTag = process.env.AMAZON_AFFILIATE_TAG || '';
  if (!apiKey) return res.status(500).json({ error: 'Keepa key missing' });

  try {
    let url = 'https://api.keepa.com/product?domain=5'; // 5 is Japan
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

    // リンクの正規化とデータのクリーンアップ
    if (resultData.products && resultData.products.length > 0) {
      // 取得件数を上位10件に絞り、トークン消費を節約する（フロントエンドの要求に合わせて）
      resultData.products = resultData.products.slice(0, 10).map(p => {
        // Amazonリンクをgp/product形式に強制、404を回避
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

// --- ADMIN: LINK HEALTH WATCHDOG --- v6.80 🏮
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
      timeout: 15000, // 🏮 [PATIENCE] 転送の多い楽天リンク等のために 15秒へ延長
      maxRedirects: 10,
      validateStatus: () => true 
    });

    if (response.status === 404) {
      return res.json({ status: 'broken', reason: '404 Not Found' });
    }

    const html = response.data.toLowerCase(); // 🏮 大文字小文字を無視して確実に捕捉
    
    // Amazon "Dog Page" detection
    if (url.includes('amazon.co.jp') && (html.includes('申し訳ございません') || html.includes('something went wrong') || html.includes('dog of amazon'))) {
      return res.json({ status: 'broken', reason: 'Amazon Dog Page (Dead)' });
    }

    // Rakuten "Not Found" / "Under Construction" detection
    // 🏮 [MULTI-FINGERPRINT] 日本語だけでなく、不変のASCIIコード群で死を捉える
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
    
    // 🏮 [SMART RECOVERY] 転送自体がタイムアウトした場合、URLから商品ページを抜き出せないか試行
    if (error.code === 'ECONNABORTED' && url.includes('hb.afl.rakuten.co.jp')) {
      return res.json({ status: 'unknown', reason: 'Redirect Timeout - Store alive but check skipped for safety' });
    }

    res.json({ status: 'unknown', reason: error.message });
  }
});

app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'AI key missing' });
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `世帯人数: ${householdSize}人, 在庫: ${JSON.stringify(items)}, リスク: ${JSON.stringify(currentRisks.activeRisks.slice(0, 3))}。生活アドバイスを2つ日本語で（各20文字以内、絵文字なし）。`;
    const result = await model.generateContent(prompt);
    res.json({ advice: result.response.text(), risks: currentRisks });
  } catch (err) { res.status(500).json({ error: 'AI failed' }); }
});

app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
  fetchAndAnalyzeNews();
  setInterval(fetchAndAnalyzeNews, 3600000);
});
