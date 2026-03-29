import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Vercel handles CORS and Security at the edge, but keeping these for robustness
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for easier integration if needed
}));
app.use(cors());
app.use(express.json());

/**
 * Rakuten API Proxy
 */
app.get('/api/rakuten', async (req, res) => {
  const { keyword } = req.query;
  const appId = process.env.RAKUTEN_APP_ID?.trim();

  if (!appId) {
    return res.status(500).json({ error: 'RAKUTEN_APP_ID missing' });
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
    res.status(500).json({ error: 'Rakuten API failed' });
  }
});

/**
 * Keepa API Proxy
 */
app.get('/api/keepa', async (req, res) => {
  const { asin } = req.query;
  const apiKey = process.env.KEEPA_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'KEEPA_API_KEY missing' });

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
    res.status(500).json({ error: 'Keepa API failed' });
  }
});

/**
 * Gemini AI Advice
 */
app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY missing' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use a stable model for production
    
    const prompt = `
      あなたは親密で頼りになる「生活のコンシェルジュ」です。
      世帯人数: ${householdSize}人
      在庫データ: ${JSON.stringify(items)}
      家計を助けるためのアドバイスを2つ、自然な日本語（各25文字以内、絵文字なし）で生成してください。
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ advice: text });
  } catch (error) {
    res.status(500).json({ error: 'AI Advice failed' });
  }
});

// Export the app for Vercel
export default app;
