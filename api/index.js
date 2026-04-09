import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// 統計表ID: 0003421913 = 主要品目の都市別小売価格（月次）
// cdCat02 = 品目コード（cat02軸）、cdArea 13100 = 東京都特別区部
const RETAIL_TABLE = '0003421913';

const ESTAT_ITEM_MAP = {
  rice:      { id: RETAIL_TABLE, code: '01002' },
  bread:     { id: RETAIL_TABLE, code: '01021' },
  egg:       { id: RETAIL_TABLE, code: '01341' },
  milk:      { id: RETAIL_TABLE, code: '01303' },
  oil:       { id: RETAIL_TABLE, code: '01601' },
  water:     { id: RETAIL_TABLE, code: '01982' },
  tp:        { id: RETAIL_TABLE, code: '04413' },
  tissue:    { id: RETAIL_TABLE, code: '04412' },
  detergent: { id: RETAIL_TABLE, code: '04441' },
};

app.get('/api/estat', async (req, res) => {
  try {
    const { genreId } = req.query;
    const appId = process.env.ESTAT_APP_ID || process.env.VITE_ESTAT_APP_ID;
    const config = ESTAT_ITEM_MAP[genreId];

    if (!appId) return res.status(401).json({ error: 'Auth credentials missing' });
    if (!config) return res.status(400).json({ error: `Invalid genreId: ${genreId}` });

    // cdCat02 で品目を指定、cdArea 13100 = 東京都特別区部
    const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=${config.id}&cdCat02=${config.code}&cdArea=13100&cntGet=20`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data?.GET_STATS_DATA?.RESULT?.STATUS != '0') {
      return res.status(502).json({
        error: 'e-Stat rejected',
        detail: response.data?.GET_STATS_DATA?.RESULT,
      });
    }

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

app.get('/api/snapshot', async (req, res) => {
  try {
    const snapshotPath = path.resolve(__dirname, 'amazon_snapshot.json');
    const data = await fs.readFile(snapshotPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: 'Snapshot error' });
  }
});

// AIアドバイザーのエンドポイント (Gemini 3.1 Flash Lite)
app.post('/api/ai/advice', async (req, res) => {
  try {
    const { householdSize, items } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing');
      return res.status(500).json({ error: 'AI設定が不足しています' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // ユーザー指定のモデル `gemini-3.1-flash-lite-preview` を使用
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

    const prompt = `あなたは「あなただけの生活通信」という生活防衛ダッシュボードのAIアドバイザーです。
以下のユーザー状況に基づき、親しみやすく的確なアドバイスを3〜4行で提示してください。

【ユーザー状況】
世帯人数: ${householdSize}人
現在の備蓄状況:
${items ? items.map(i => `- ${i.name}: 残り約${i.daysLeft}日分 (${i.amount})`).join('\n') : 'データなし'}

【指示】
1. 在庫が少ないもの（14日分以下）がある場合は最優先で補充を促してください。
2. すべて十分にある場合は、買いすぎへの注意や安心感を与えてください。
3. 以下のJSONフォーマットで完全に有効なJSON文字列のみを出力してください（Markdownのバッククォート等は絶対に含まないこと）。

{
  "advice": "アドバイスのテキスト。改行も適宜使用してください。",
  "risks": {
    "activeRisks": [
      { "title": "最新の物価高騰リスクに関する一般的なニュースタイトル（ダミー可）", "link": "#" }
    ]
  }
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'AIアドバイザーへの接続に失敗しました。' });
  }
});

export default app;
