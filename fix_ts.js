const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'candidates', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix duplicates
content = content.replace(
  /background: '#111111', color: '#fbbf24', border: '1px solid #fbbf24',\s*color: 'white',\s*border: 'none',/gi,
  "background: '#111111', color: '#fbbf24', border: '1px solid #fbbf24',"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed typescript duplicates');
