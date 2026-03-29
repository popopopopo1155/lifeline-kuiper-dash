import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// セキュリティ強化：ヘッダーの保護
app.use(helmet());
app.use(cors());
app.use(express.json());

// API乱用防止：15分間に100リクエストまで
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

/**
 * 楽天API プロキシ
 */
app.get('/api/rakuten', async (req, res) => {
  const { keyword } = req.query;
  const appId = process.env.RAKUTEN_APP_ID?.trim(); // Windowsの改行コード等を考慮してトリム

  console.log(`[Server] Rakuten Request for: "${keyword}", AppID Prefix: ${appId ? appId.substring(0, 4) + '...' : 'NONE'}`);

  if (!appId) {
    console.error('RAKUTEN_APP_ID is missing in .env');
    return res.status(500).json({ error: 'Server configuration error: Key missing' });
  }

  try {
    const response = await axios.get('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706', {
      params: {
        applicationId: appId,
        keyword,
        format: 'json'
      }
    });
    res.json(response.data);
  } catch (error) {
    const errorDetail = error.response?.data || error.message;
    console.error('Rakuten API failed:', JSON.stringify(errorDetail));
    res.status(500).json({ error: 'Rakuten API access failed', details: errorDetail });
  }
});

/**
 * Keepa API プロキシ
 */
app.get('/api/keepa', async (req, res) => {
  const { asin } = req.query;
  const apiKey = process.env.KEEPA_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'Server configuration error' });

  try {
    const response = await axios.get('https://api.keepa.com/product', {
      params: {
        key: apiKey,
        domain: 1,
        asin,
        stats: 1
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Keepa API access failed' });
  }
});

/**
 * Gemini AI アドバイザー
 */
app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'AI key missing' });

  try {
    const modelName = "gemini-3.1-flash-lite-preview"; // ユーザー指定のモデル名
    console.log(`[AI] Generating advice using model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      あなたは親密で頼りになる「生活のコンシェルジュ」です。
      以下の家庭の在庫状況に基づき、ユーザーの家計を助けるための「今日のアドバイス」を2つ、自然な日本語（各25文字以内）で生成してください。
      
      【前提条件】
      - 世帯人数: ${householdSize}人
      - 在庫データ: ${JSON.stringify(items)}
      
      【人格・トーン】
      - 「〜ですよ」「〜しましょう」といった、親しみやすく温かい口調で。
      - ロボットのような箇条書きではなく、生身の人間が書いたメモのような自然な短文に。
      - 25文字を超えないように非常に簡潔にまとめてください。
      - 【重要】絵文字は一切使用せず、テキストのみで表現してください。
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('[AI] Advice generated successfully');
    res.json({ advice: text });
  } catch (error) {
    console.error('[AI] Gemini API Error Details:', error.message || error);
    if (error.status === 404) {
      return res.status(404).json({ error: 'Model not found (Gemini 3.1 is yet to be public?)' });
    }
    res.status(500).json({ error: 'AI generation failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Security Proxy Server running on port ${PORT}`);
});
