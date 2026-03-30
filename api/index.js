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
  const appId = process.env.RAKUTEN_APP_ID?.trim();
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim();
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID?.trim();

  if (!appId || !accessKey) {
    return res.status(500).json({ error: 'Rakuten API credentials missing (AppId or AccessKey)' });
  }

  try {
    const params = new URLSearchParams({
      applicationId: appId,
      accessKey: accessKey, // 2026 standard
      keyword: keyword,
      format: 'json',
      hits: 30,
      imageFlag: 1,
      availability: 1,
      sort: '-itemPrice'
    });

    if (affiliateId) {
      params.append('affiliateId', affiliateId);
    }

    const response = await axios.get('https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601', {
      params: params,
      headers: {
        'Referer': 'https://hitsujuhin.com',
        'Origin': 'https://hitsujuhin.com'
      }
    });

    const rawItems = response.data.Items || [];
    const formattedItems = rawItems.map(itemContainer => {
      const p = itemContainer.Item;
      let finalAffiliateUrl = p.affiliateUrl;

      // APIがaffiliateUrlを返さない、または生URLのままの場合、手動でパッケージング
      if (affiliateId && (!finalAffiliateUrl || finalAffiliateUrl === p.itemUrl)) {
        const encodedItemUrl = encodeURIComponent(p.itemUrl);
        finalAffiliateUrl = `https://hb.afl.rakuten.co.jp/hgc/${affiliateId}/?pc=${encodedItemUrl}`;
      }

      return {
        ...itemContainer,
        Item: {
          ...p,
          affiliateUrl: finalAffiliateUrl
        }
      };
    });

    res.json({
      ...response.data,
      Items: formattedItems,
      amazonTag: process.env.AMAZON_AFFILIATE_TAG || ''
    });
  } catch (error) {
    console.error('Rakuten API proxy error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch from Rakuten API' });
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
