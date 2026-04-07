import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import dotenv from 'dotenv';
import { parseStringPromise } from 'xml2js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();
const app = express();
const PORT = 3005;

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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(cors());

app.get('/api/estat', async (req, res) => {
  const { genreId } = req.query;
  const appId = process.env.VITE_ESTAT_APP_ID || process.env.ESTAT_APP_ID;
  const config = ESTAT_ITEM_MAP[genreId];
  const AREA = '13101'; // Tokyo benchmark
  if (!appId || !config) return res.status(400).json({ error: 'Invalid' });
  try {
    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=${AREA}`;
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/snapshot', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'server', 'amazon_snapshot.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (e) { res.status(404).json({ error: 'NF' }); }
});

app.listen(PORT, () => {
  console.log(`Server on ${PORT} (Tokyo Benchmark Mode)`);
});
