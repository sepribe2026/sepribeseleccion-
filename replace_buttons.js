const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'candidates', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update ai-btn
content = content.replace(
  /\.ai-btn \{ background: linear-gradient\(135deg, #fbbf24, #fbbf24\); color: white;/gi,
  '.ai-btn { background: #111111; color: #fbbf24; border: 1px solid #fbbf24;'
);
content = content.replace(
  /box-shadow: 0 4px 10px rgba\(139, 92, 246, 0\.2\);/gi,
  'box-shadow: 0 4px 10px rgba(251, 191, 36, 0.15);'
);

// Update ai-btn hover
content = content.replace(
  /\.ai-btn:hover \{ transform: translateY\(-1px\); box-shadow: 0 6px 15px rgba\(139, 92, 246, 0\.3\); \}/gi,
  '.ai-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(251, 191, 36, 0.2); background: #000000; }'
);


// Update ranking-btn-primary
content = content.replace(
  /\.ranking-btn-primary \{ width: 100%; background: linear-gradient\(135deg, #fbbf24, #eab308\); color: white; border: none;/gi,
  '.ranking-btn-primary { width: 100%; background: #111111; color: #fbbf24; border: 1px solid #fbbf24;'
);
content = content.replace(
  /box-shadow: 0 10px 15px -3px rgba\(124, 58, 237, 0\.3\);/gi,
  'box-shadow: 0 10px 15px -3px rgba(251, 191, 36, 0.15);'
);

// Update ranking-btn-primary hover
content = content.replace(
  /\.ranking-btn-primary:hover \{ transform: translateY\(-2px\); box-shadow: 0 20px 25px -5px rgba\(124, 58, 237, 0\.4\); \}/gi,
  '.ranking-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(251, 191, 36, 0.25); background: #000000; }'
);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced button styles');
