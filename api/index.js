import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// [🏮 黄金の定義] 月次統計表 ID への物理的な切り替え
const MONTHLY_RETAIL_TABLE = '0003421911'; // 主要都市編（月次）
const OTHER_RETAIL_TABLE = '0003412351';   // 構造編（月次）

const ESTAT_ITEM_MAP = {
  rice:      { id: MONTHLY_RETAIL_TABLE, code: '01002' },
  bread:     { id: MONTHLY_RETAIL_TABLE, code: '01021' },
  egg:       { id: MONTHLY_RETAIL_TABLE, code: '01341' },
  milk:      { id: MONTHLY_RETAIL_TABLE, code: '01303' },
  tp:        { id: OTHER_RETAIL_TABLE,   code: '04413' },
  detergent: { id: OTHER_RETAIL_TABLE,   code: '04441' },
  water:     { id: OTHER_RETAIL_TABLE,   code: '01982' },
  oil:       { id: MONTHLY_RETAIL_TABLE, code: '01601' },
  tissue:    { id: OTHER_RETAIL_TABLE,   code: '04412' },
};

app.get('/api/estat', async (req, res) => {
  try {
    const { genreId } = req.query;
    const appId = process.env.ESTAT_APP_ID || process.env.VITE_ESTAT_APP_ID;
    const config = ESTAT_ITEM_MAP[genreId];
    
    if (!appId) return res.status(401).json({ error: 'Auth credentials missing' });
    if (!config) return res.status(400).json({ error: 'Invalid config' });

    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=13101&cntGet=20`;
    const response = await axios.get(url, { timeout: 10000 });
    
    // 型の違い（"0" vs 0）を吸収するため != を使用
    if (response.data?.GET_STATS_DATA?.RESULT?.STATUS != "0") {
      const errorMsg = response.data?.GET_STATS_DATA?.RESULT?.ERROR_MSG || 'e-Stat reject';
      return res.status(502).json({ error: errorMsg });
    }
    
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error (api/estat)' });
  }
});

app.get('/api/snapshot', async (req, res) => {
  try {
    const snapshotPath = path.resolve(__dirname, 'amazon_snapshot.json');
    const data = await fs.readFile(snapshotPath, 'utf8');
    const parsed = JSON.parse(data);
    res.json({
      ...parsed,
      _meta: { lastUpdate: new Date().toISOString() }
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error (api/snapshot)' });
  }
});

export default app;
