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
 * Rakuten API Proxy (Upgraded to OpenAPI 2026 Standard)
 */
app.get('/api/rakuten', async (req, res) => {
  const { keyword } = req.query;
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId) {
    return res.status(500).json({ error: 'Rakuten API credentials missing' });
  }

  try {
    // 楽天 API v3 (20220601版) を使用し、pk_... 形式のアクセキーを正常に処理
    const url = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601';
    const params = { 
      applicationId: appId, 
      accessKey: accessKey, 
      affiliateId: affiliateId, 
      keyword: keyword, 
      format: 'json', 
      hits: 30 
    };
    
    const response = await axios.get(url, { 
      params, 
      headers: {
        'Referer': 'https://www.hitsujuhin.com/',
        'Origin': 'https://www.hitsujuhin.com/',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    // v3 API のレスポンス構造に柔軟に対応
    let items = response.data.items || response.data.Items || [];

    // お米（5kg/10kg）向けの強力な足切りフィルタ
    if (keyword && keyword.includes('米')) {
      items = items.filter(i => {
        const itemObj = i.item || i.Item || i;
        const rawPrice = itemObj.itemPrice || itemObj.price;
        const price = Number(rawPrice);
        if (isNaN(price)) return false;

        if (keyword.includes('10kg')) {
          return price >= 5400; 
        }
        if (keyword.includes('5kg')) {
          return price >= 2940; 
        }
        return true;
      });
    }

    res.json({
      ...response.data,
      Items: items,
      amazonTag: process.env.AMAZON_AFFILIATE_TAG || ''
    });
  } catch (error) {
    console.error('Rakuten API error:', error.message);
    res.status(500).json({ error: 'Rakuten API failed', details: error.message });
  }
});

/**
 * Keepa API Proxy (Upgraded with Search & Token Awareness)
 */
app.get('/api/keepa', async (req, res) => {
  const { asin, search } = req.query;
  const key = process.env.KEEPA_API_KEY;
  const amazonTag = process.env.AMAZON_AFFILIATE_TAG;

  if (!key) {
    return res.status(500).json({ error: 'KEEPA_API_KEY is not set' });
  }

  try {
    let url = 'https://api.keepa.com/product';
    let params = { key, domain: 1, stats: 1 };

    if (search) {
      // Perform a keyword search to find the best current deals
      url = 'https://api.keepa.com/search';
      params.type = 'product';
      params.term = search;
    } else {
      params.asin = asin;
    }

    const response = await axios.get(url, { params });
    const data = response.data;

    // Standardize the response and inject affiliate tracking
    if (data.products && data.products.length > 0) {
      data.products = data.products.map(p => {
        const encodedAsin = encodeURIComponent(p.asin);
        const baseUrl = `https://www.amazon.co.jp/dp/${encodedAsin}`;
        return {
          ...p,
          affiliateUrl: amazonTag ? `${baseUrl}/?tag=${amazonTag}` : baseUrl
        };
      });
    }

    // Pass through token metadata for client-side greedy management
    res.json({
      ...data,
      tokensLeft: data.tokensLeft,
      refillRate: data.refillRate
    });
  } catch (error) {
    console.error('Keepa API proxy error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch from Keepa API' });
  }
});

/**
 * AI Advisor Endpoint
 * Uses Google Gemini to generate lifestyle advice based on inventory
 */
app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = `
      あなたは親密で頼りになる「生活のコンシェルジュ」です。
      世帯人数: ${householdSize}人
      現在の在庫詳細: ${JSON.stringify(items)}
      
      家計の節約と備蓄の最適化のために、最短かつ具体的なアドバイスを2つ（それぞれ18文字以内）生成してください。
      語り口はプロフェッショナルかつ温かみのある日本語とし、ロボット的な「AI」という単語や、絵文字、感嘆符、箇条書き記号は一切含めないでください。
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ advice: text });
  } catch (error) {
    console.error('AI Advice Error:', error);
    res.status(500).json({ error: 'AI Advice failed' });
  }
});

// Export the app for Vercel
export default app;
