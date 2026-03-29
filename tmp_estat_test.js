const appId = 'f927efd907b026bc1fe3898522bb634801e2532a';
const statsDataId = '0003421913';
const itemCode = '1001'; // Rice
const areaCode = '13101'; // Tokyo Chiyoda (example)

const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getMetaInfo?appId=${appId}&statsDataId=${statsDataId}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const classObj = data.GET_META_INFO.METADATA_INF.CLASS_INF.CLASS_OBJ;
    classObj.forEach(obj => {
      const classes = Array.isArray(obj.CLASS) ? obj.CLASS : (obj.CLASS ? [obj.CLASS] : []);
      if (obj['@id'] === 'area') {
        const tokyoCodes = classes.filter(c => c['@code'] && c['@code'].startsWith('13'));
        console.log('Tokyo Area Codes:', tokyoCodes.map(c => `${c['@code']}: ${c['@name']}`));
      }
      if (obj['@id'] === 'cat02') {
        const milk = classes.filter(c => c['@name'] && c['@name'].includes('牛乳'));
        console.log('Milk varieties:', milk.map(c => `${c['@code']}: ${c['@name']}`));
        const oil = classes.filter(c => c['@name'] && c['@name'].includes('油'));
        console.log('Oil varieties:', oil.map(c => `${c['@code']}: ${c['@name']}`));
      }
    });
  })
  .catch(err => {
    console.error('Error:', err);
  });
