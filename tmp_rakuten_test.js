import axios from 'axios';

const appId = 'b7a35398-04b9-40b0-b5d8-71929bf0fd65'; // The ID in .env
const keyword = '米';

async function testRakuten() {
  try {
    console.log(`Testing Rakuten API with AppID: ${appId}`);
    const response = await axios.get('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706', {
      params: {
        applicationId: appId,
        keyword: keyword,
        format: 'json'
      }
    });
    console.log('SUCCESS: API response received.');
    console.log('Items found:', response.data.count);
  } catch (error) {
    console.error('FAILED: API error.');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testRakuten();
