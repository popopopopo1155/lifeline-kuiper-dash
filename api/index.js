import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

/**
 * Rakuten API Proxy (Upgraded to v3 with Rice Intelligence)
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

    let items = response.data.items || response.data.Items || [];

    // お米（5kg/10kg）向けの強力な足切りフィルタ (2,940円/5,400円の壁)
    if (keyword && keyword.includes('米')) {
      items = items.filter(i => {
        const itemObj = i.item || i.Item || i;
        const price = Number(itemObj.itemPrice || itemObj.price);
        if (isNaN(price)) return false;

        if (keyword.includes('10kg')) return price >= 5400; 
        if (keyword.includes('5kg')) return price >= 2940; 
        return true;
      });
    }

    res.json({
      ...response.data,
      Items: items,
      amazonTag: process.env.AMAZON_AFFILIATE_TAG || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Rakuten API failed', details: error.message });
  }
});

/**
 * Keepa API Proxy
 */
app.get('/api/keepa', async (req, res) => {
  const { asin } = req.query;
  const key = process.env.KEEPA_API_KEY;
  const amazonTag = process.env.AMAZON_AFFILIATE_TAG;

  if (!asin || !key) return res.status(400).json({ error: 'ASIN or Key missing' });

  try {
    const response = await axios.get('https://api.keepa.com/product', {
      params: { key, domain: 5, asin: asin, stats: 1 }
    });
    
    const baseUrl = `https://www.amazon.co.jp/gp/product/${asin}`;
    const affiliateUrl = amazonTag ? `${baseUrl}/?tag=${amazonTag}` : baseUrl;

    res.json({ ...response.data, affiliateUrl });
  } catch (error) {
    const baseUrl = `https://www.amazon.co.jp/gp/product/${asin}`;
    res.json({ products: [], error: 'Keepa limit reached', affiliateUrl: amazonTag ? `${baseUrl}/?tag=${amazonTag}` : baseUrl });
  }
});

/**
 * AI Advisor Endpoint
 */
app.post('/api/ai/advice', async (req, res) => {
  const { householdSize, items } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = `
      あなたは生活のコンシェルジュです。世帯人数: ${householdSize}人。在庫: ${JSON.stringify(items)}。
      節約と備蓄のアドバイスを具体的かつ最短（2つ、各18文字以内）で生成してください。
      プロフェッショナルかつ温かみのある日本語を使用してください。ロボット的な表現は避けて。
    `;
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    res.json({ advice: text });
  } catch (error) {
    res.status(500).json({ error: 'AI Advice failed' });
  }
});

export default app;
