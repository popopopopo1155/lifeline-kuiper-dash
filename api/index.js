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

const MONTHLY_RETAIL_TABLE = '0003421911'; 
const ESTAT_ITEM_MAP = {
  rice:      { id: MONTHLY_RETAIL_TABLE, code: '01002' },
  bread:     { id: MONTHLY_RETAIL_TABLE, code: '01021' },
  egg:       { id: MONTHLY_RETAIL_TABLE, code: '01341' },
  milk:      { id: MONTHLY_RETAIL_TABLE, code: '01303' },
  oil:       { id: MONTHLY_RETAIL_TABLE, code: '01601' },
};

app.get('/api/estat', async (req, res) => {
  try {
    const { genreId } = req.query;
    // [🏮 DEBUG] キーの正体暴き
    const appId = process.env.ESTAT_APP_ID || process.env.VITE_ESTAT_APP_ID;
    const config = ESTAT_ITEM_MAP[genreId];
    
    if (!appId) return res.status(401).json({ error: 'Auth credentials missing' });
    if (!config) return res.status(400).json({ error: 'Invalid config' });

    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat01=${config.code}&cdArea=13101&cntGet=20`;
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data?.GET_STATS_DATA?.RESULT?.STATUS != "0") {
      return res.status(502).json({ 
        error: 'e-Stat specialized reject', 
        rawResult: response.data?.GET_STATS_DATA?.RESULT,
        debugAppIdPrefix: appId.substring(0, 8),
        debugUrl: url.replace(appId, 'REDACTED')
      });
    }
    
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: `Critical Failure: ${err.message}` });
  }
});

app.get('/api/snapshot', async (req, res) => {
  try {
    const snapshotPath = path.resolve(__dirname, 'amazon_snapshot.json');
    const data = await fs.readFile(snapshotPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) { res.status(500).json({ error: 'Snapshot error' }); }
});

export default app;
