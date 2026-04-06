const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.KEEPA_API_KEY;
const DOMAIN = 5; // Japan

async function testKeepa() {
  try {
    // 1. Search for a keyword to get ASINs
    console.log('--- Phase 1: Search ---');
    const searchRes = await axios.get(`https://api.keepa.com/search?key=${API_KEY}&domain=${DOMAIN}&type=product&term=${encodeURIComponent('白米 5kg')}`);
    console.log('Search Data Keys:', Object.keys(searchRes.data));
    
    // asinList exists in products[0].asinList for keyword research or directly if using search?
    // Let's find where the ASINs are.
    const products = searchRes.data.products; 
    console.log(`Found ${products?.length || 0} products in search response.`);
    if (products && products.length > 0) {
      console.log('Top Product ASIN:', products[0].asin);
    }

    if (asins && asins.length > 0) {
      // 2. Fetch full product details (including history) for the top ASIN
      console.log('\n--- Phase 2: Product Info & History ---');
      const targetAsin = asins[0];
      const productRes = await axios.get(`https://api.keepa.com/product?key=${API_KEY}&domain=${DOMAIN}&asin=${targetAsin}&stats=90&history=1`);
      
      const product = productRes.data.products[0];
      console.log(`Product Name: ${product.title}`);
      console.log(`Current Price (new): ${product.stats?.current?.at(0) || 'N/A'}`);
      console.log(`Price History Length: ${product.csv?.at(0)?.length || 0}`); // csv[0] is usually Amazon price history
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testKeepa();
