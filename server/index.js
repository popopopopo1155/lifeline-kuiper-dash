import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import dotenv from 'dotenv';
import { parseStringPromise } from 'xml2js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

const NEWS_DICTIONARY = {
  POSITIVE: { keywords: ['安値', '安定', '増産', '豊作', '解消'], weight: 0.9 },
  NEGATIVE: {
    CRITICAL: { keywords: ['高騰', '停止', '不足', '枯渇'], weight: 1.5 },
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

const ESTAT_ITEM_MAP = {
  rice:      { id: '0003421914', code: '01002' },
  bread:     { id: '0003421914', code: '01021' },
  egg:       { id: '0003421914', code: '01341' },
  milk:      { id: '0003421914', code: '01303' },
  tp:        { id: '0003412351', code: '04413' },
  detergent: { id: '0003412351', code: '04441' },
  water:     { id: '0003412351', code: '01982' },
  oil:       { id: '0003421914', code: '01601' },
  tissue:    { id: '0003412351', code: '04412' },
};

dotenv.config();
const app = express();
const PORT = 3005;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(cors());

let currentRisks = { activeRisks: [], categoryModifiers: {} };

async function fetchAndAnalyzeNews() {
  try {
    const q = encodeURIComponent('物価 高騰 不足 供給制限');
    const response = await axios.get(`https://news.google.com/rss/search?q=${q}&hl=ja&gl=JP&ceid=JP:ja`);
    const result = await parseStringPromise(response.data);
    const items = result.rss.channel[0].item || [];
    const risks = [];
    const modifiers = {};
    items.slice(0, 15).forEach(item => {
      const title = item.title[0];
      const link = item.link[0];
      let weight = 1.0;
      Object.keys(NEWS_DICTIONARY.NEGATIVE).forEach(level => {
        if (NEWS_DICTIONARY.NEGATIVE[level].keywords.some(k => title.includes(k))) weight = NEWS_DICTIONARY.NEGATIVE[level].weight;
      });
      Object.keys(CATEGORY_NEWS_MAP).forEach(cat => {
        if (CATEGORY_NEWS_MAP[cat].keywords.some(k => title.includes(k))) {
          risks.push({ title, link, category: cat, weight });
          modifiers[cat] = { multiplier: (modifiers[cat]?.multiplier || 1.0) * weight };
        }
      });
    });
    currentRisks = { activeRisks: risks, categoryModifiers: modifiers };
  } catch (err) { console.error('News failed:', err.message); }
}

app.get('/api/news/risks', (req, res) => res.json(currentRisks));
app.get('/api/snapshot', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'server', 'amazon_snapshot.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (e) { res.status(404).json({ error: 'Not found' }); }
});

app.get('/api/estat', async (req, res) => {
  const { genreId } = req.query;
  const appId = process.env.VITE_ESTAT_APP_ID || process.env.ESTAT_APP_ID;
  const config = ESTAT_ITEM_MAP[genreId];
  if (!appId || !config) return res.status(400).json({ error: 'Invalid genre' });
  try {
    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=00000`;
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
  } catch (err) { res.status(500).json({ error: 'e-Stat failed' }); }
});

app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
  fetchAndAnalyzeNews();
  setInterval(fetchAndAnalyzeNews, 3600000);
});
