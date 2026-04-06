const axios = require('axios');

async function findTheTruth() {
  const appId = process.env.VITE_ESTAT_APP_ID || process.env.ESTAT_APP_ID;
  const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${appId}&statsDataId=0003421913&cdArea=13100`;

  try {
    const response = await axios.get(url);
    const values = response.data.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;
    const classes = response.data.GET_STATS_DATA.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ;
    
    // Find rice categories (cat02)
    const riceCats = classes.find(c => c['@id'] === 'cat02').CLASS;
    
    console.log('--- 🏮 Rice Category Audit ---');
    
    for (const cat of Array.isArray(riceCats) ? riceCats : [riceCats]) {
       const code = cat['@code'];
       const name = cat['@name'];
       
       // Get latest value for this code
       const items = values.filter(v => v['@cat02'] === code);
       if (items.length > 0) {
         // Items are sorted? Let's check first and last
         const latest = items[0]; 
         const price = latest['$'];
         const time = latest['@time'];
         
         console.log(`Code: ${code} | Name: ${name} | Price: ¥${price} | Time: ${time}`);
       }
    }
    
    console.log('\n--- 🏮 Search for Target ¥3935 ---');
    const targetMatch = values.find(v => v['$'] === '3935');
    if (targetMatch) {
       const catName = riceCats.find(c => c['@code'] === targetMatch['@cat02'])?.['@name'];
       console.log(`🎯 FOUND THE TRUTH!`);
       console.log(`Target Code: ${targetMatch['@cat02']} (${catName})`);
       console.log(`Target Time: ${targetMatch['@time']}`);
    } else {
       console.log('Target ¥3935 not found exactly. Searching closest for current period...');
    }

  } catch (err) {
    console.error('Audit failed:', err.message);
  }
}

findTheTruth();
