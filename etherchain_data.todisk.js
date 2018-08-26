const fs = require('fs');
const path = require('path');
const data = require('./etherchain_data');
fs.writeFileSync(path.join(__dirname, 'etherchain_data.json'), JSON.stringify(data), 'utf8');
