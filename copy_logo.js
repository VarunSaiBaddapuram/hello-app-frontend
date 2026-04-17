const fs = require('fs');
const src = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\0ae10268-f12e-47af-9d5d-923e0609f94c\\hello_cyberpunk_logo_1776420215709.png';
const dest = __dirname + '/public/hello_logo.png';
fs.copyFileSync(src, dest);
console.log('Copied logo to ' + dest);
