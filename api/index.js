import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { GoogleGenerativeAI } from '@google/generative-ai';
const path = require('path');
const fs = require('fs').promises;

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

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

app.get('/api/estat', async (req, res) => {
  const { genreId } = req.query;
  const appId = process.env.VITE_ESTAT_APP_ID || process.env.ESTAT_APP_ID;
  const config = ESTAT_ITEM_MAP[genreId];
  if (!appId || !config) return res.status(400).json({ error: 'Invalid' });
  try {
    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=13101&cntGet=20`;
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
  } catch (err) { res.status(500).json({ error: 'e-Stat down' }); }
});

app.get('/api/snapshot', async (req, res) => {
  try {
    const snapshotPath = path.join(process.cwd(), 'server', 'amazon_snapshot.json');
    const data = await fs.readFile(snapshotPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(404).json({ error: 'Snapshot not found' });
  }
});

app.get('/api/ai/advice', async (req, res) => {
  res.json({ advice: "統計データに基づき、お買い得なタイミングを判定中です。" });
});

app.get('/api/news/risks', async (req, res) => {
  res.json({ activeRisks: [], categoryModifiers: {} });
});

export default app;
