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
  try {
    const { genreId } = req.query;
    const appId = process.env.ESTAT_APP_ID || process.env.VITE_ESTAT_APP_ID;
    const config = ESTAT_ITEM_MAP[genreId];
    
    if (!appId) return res.status(401).json({ error: 'Auth credentials missing' });
    if (!config) return res.status(400).json({ error: 'Invalid config' });

    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=13101&cntGet=20`;
    const response = await axios.get(url, { timeout: 10000 });
    
    // [🏮 DEBUG MODE] - 生のレスポンスを包み隠さず返却して原因を特定する
    if (response.data?.RESULT?.STATUS !== "0") {
      return res.status(502).json({ 
        error: 'e-Stat specialized reject', 
        rawResult: response.data?.RESULT,
        appIdPrefix: appId.substring(0, 5) + '...',
        targetUrl: url.replace(appId, 'REDACTED')
      });
    }
    
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: `Critical Proxy Failure: ${err.message}` });
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
    res.status(500).json({ error: `Snapshot error: ${e.message}` });
  }
});

export default app;
