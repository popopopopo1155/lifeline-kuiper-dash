import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// ESM で __dirname を定義するための定石
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
  const appId = process.env.ESTAT_APP_ID || process.env.VITE_ESTAT_APP_ID;
  const config = ESTAT_ITEM_MAP[genreId];
  
  if (!appId) return res.status(401).json({ error: 'Auth credentials missing' });
  if (!config) return res.status(400).json({ error: 'Invalid config' });

  try {
    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=13101&cntGet=20`;
    const response = await axios.get(url, { timeout: 10000 });
    if (response.data?.RESULT?.STATUS !== "0") {
      return res.status(502).json({ error: response.data?.RESULT?.ERROR_MSG || 'e-Stat error' });
    }
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'e-Stat down or timeout' });
  }
});

app.get('/api/snapshot', async (req, res) => {
  try {
    const snapshotPath = path.join(__dirname, 'amazon_snapshot.json');
    const data = await fs.readFile(snapshotPath, 'utf8');
    const metaSnapshot = {
      ...JSON.parse(data),
      _meta: { lastUpdate: new Date().toISOString() }
    };
    res.json(metaSnapshot);
  } catch (e) {
    res.status(404).json({ error: 'Snapshot not found in api bundle' });
  }
});

app.get('/api/ai/advice', async (req, res) => {
  res.json({ advice: "統計データに基づき、お買い得なタイミングを判定中です。" });
});

app.get('/api/news/risks', async (req, res) => {
  res.json({ activeRisks: [], categoryModifiers: {} });
});

export default app;
