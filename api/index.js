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

let cachedRisks = {
  lastUpdated: new Date().toISOString(),
  activeRisks: [],
  categoryModifiers: {}
};

async function updateNewsRisks() {
  try {
    const rssUrl = 'https://news.google.com/rss/search?q=%E7%89%A9%E4%BE%A1+%E5%80%A4%E4%B8%8A%E3%81%92+%E5%93%81%E8%96%84&hl=ja&gl=JP&ceid=JP:ja';
    const response = await axios.get(rssUrl);
    const result = await parseStringPromise(response.data);
    const items = result.rss.channel[0].item || [];
    const detectedRisks = [];
    items.forEach(item => {
      const title = item.title[0];
      const link = item.link[0];
      if (NEWS_DICTIONARY.POSITIVE.keywords.some(k => title.includes(k))) return;
      Object.keys(NEWS_DICTIONARY.NEGATIVE).forEach(level => {
        const { keywords } = NEWS_DICTIONARY.NEGATIVE[level];
        keywords.forEach(kw => {
          if (title.includes(kw)) detectedRisks.push({ title, link, level });
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
        relevantNews: relatedNews.slice(0, 2)
      };
    });
    cachedRisks = { lastUpdated: new Date().toISOString(), activeRisks: detectedRisks.slice(0, 5), categoryModifiers: modifiers };
  } catch (error) {
    console.error('News analysis failed:', error.message);
  }
}

updateNewsRisks();

app.get('/api/news/risks', async (req, res) => res.json(cachedRisks));

app.get('/api/rakuten', async (req, res) => {
  const { keyword } = req.query;
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  try {
    const url = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
    // ヒット数を最大化 (100件) してお米の足切り後でも十分な件数を確保
    const params = { applicationId: appId, accessKey, affiliateId, keyword, format: 'json', hits: 100 };
    const response = await axios.get(url, { params, headers: { 'Referer': 'https://www.hitsujuhin.com/', 'Origin': 'https://www.hitsujuhin.com/' } });
    let items = response.data.items || response.data.Items || [];
    if (keyword && keyword.includes('米')) {
      items = items.filter(i => {
        const p = i.item || i.Item || i;
        const price = Number(p.itemPrice || p.price);
        if (keyword.includes('10kg')) return price >= 5400; 
        if (keyword.includes('5kg')) return price >= 2940; 
        return true;
      });
    }
    res.json({ ...response.data, Items: items });
  } catch (error) { res.status(500).json({ error: 'Rakuten API failed' }); }
});

app.get('/api/keepa', async (req, res) => {
  const { asin } = req.query;
  const key = process.env.KEEPA_API_KEY;
  const tag = process.env.AMAZON_AFFILIATE_TAG;
  try {
    const response = await axios.get('https://api.keepa.com/product', { params: { key, domain: 5, asin, stats: 1 } });
    const baseUrl = `https://www.amazon.co.jp/gp/product/${asin}`;
    res.json({ ...response.data, affiliateUrl: tag ? `${baseUrl}/?tag=${tag}` : baseUrl });
  } catch (error) { 
    const baseUrl = `https://www.amazon.co.jp/gp/product/${asin}`;
    res.json({ products: [], error: 'Keepa limit reached', affiliateUrl: tag ? `${baseUrl}/?tag=${tag}` : baseUrl });
  }
});

app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const result = await model.generateContent(`世帯人数: ${householdSize}人。在庫: ${JSON.stringify(items)}。節約と備蓄のアドバイスを最短2つ。`);
    res.json({ advice: (await result.response).text() });
  } catch (error) { res.status(500).json({ error: 'AI Advice failed' }); }
});

app.get('/api/manual/items', (req, res) => res.json([]));

export default app;
