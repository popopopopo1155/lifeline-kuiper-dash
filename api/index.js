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

// [OFFICIAL STATS SOURCES] - e-Stat Mapping for Vercel Proxy
// Primary: 0003421913 (Principal Cities), Area: 13101 (Tokyo) as benchmark
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

async function getRisks() {
  const now = Date.now();
  if (cachedRisks && (now - lastUpdate < CACHE_STALE)) return cachedRisks;
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
    items.forEach(item => {
      const title = item.title[0];
      if (NEWS_DICTIONARY.POSITIVE.keywords.some(k => title.includes(k))) return;
      const cleanTitle = title.split(' - ')[0];
      if (seenTitles.has(cleanTitle)) return;
      Object.keys(NEWS_DICTIONARY.NEGATIVE).forEach(level => {
        const { keywords } = NEWS_DICTIONARY.NEGATIVE[level];
        keywords.forEach(kw => {
          if (title.includes(kw) && !seenTitles.has(cleanTitle)) {
            detectedRisks.push({ title, link: item.link[0], level });
            seenTitles.add(cleanTitle);
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
      modifiers[catId] = { multiplier: maxWeight, riskLevel: maxWeight > 1.3 ? 'CRITICAL' : (maxWeight > 1.1 ? 'HIGH' : 'NORMAL'), relevantNews: relatedNews.slice(0, 3) };
    });
    cachedRisks = { lastUpdated: new Date().toISOString(), activeRisks: detectedRisks.slice(0, 5), categoryModifiers: modifiers };
    lastUpdate = now;
    return cachedRisks;
  } catch (error) { return cachedRisks || { activeRisks: [], categoryModifiers: {} }; }
}

app.get('/api/news/risks', async (req, res) => res.json(await getRisks()));
app.get('/api/estat', async (req, res) => {
  const { genreId } = req.query;
  const appId = process.env.VITE_ESTAT_APP_ID || process.env.ESTAT_APP_ID;
  const config = ESTAT_ITEM_MAP[genreId];
  if (!appId || !config) return res.status(400).json({ error: 'Invalid config' });
  const AREA = '13101'; // Benchmark: Tokyo
  try {
    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=${AREA}`;
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
  } catch (err) { res.status(500).json({ error: 'e-Stat failed' }); }
});

export default app;
