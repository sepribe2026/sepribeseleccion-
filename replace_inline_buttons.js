const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'candidates', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace inline styles for buttons that had blue/purple/yellow gradients
content = content.replace(/background: 'linear-gradient\(135deg, #fbbf24, #1d4ed8\)'/gi, "background: '#111111', color: '#fbbf24', border: '1px solid #fbbf24'");
content = content.replace(/background: 'linear-gradient\(135deg, #fbbf24, #6d28d9\)'/gi, "background: '#111111', color: '#fbbf24', border: '1px solid #fbbf24'");
content = content.replace(/background: 'linear-gradient\(135deg, #10b981, #059669\)'/gi, "background: '#111111', color: '#fbbf24', border: '1px solid #fbbf24'");
content = content.replace(/background: 'linear-gradient\(135deg, #ef4444, #dc2626\)'/gi, "background: '#111111', color: '#fbbf24', border: '1px solid #fbbf24'");

fs.writeFileSync(filePath, content, 'utf8');

const postularPath = path.join(__dirname, 'src', 'app', '[companySlug]', 'postular', 'page.tsx');
let content2 = fs.readFileSync(postularPath, 'utf8');

content2 = content2.replace(
  /background: 'linear-gradient\\(135deg, #fbbf24 0%, #d97706 100%\\)',\\s*color: '#111111'/gi,
  "background: '#111111',\n                    color: '#fbbf24',\n                    border: '1px solid #fbbf24'"
);
content2 = content2.replace(
  /background: 'linear-gradient\\(135deg, #fbbf24 0%, #d97706 100%\\)',\\s*color: '#0f172a'/gi,
  "background: '#111111',\n                    color: '#fbbf24',\n                    border: '1px solid #fbbf24'"
);
// Also the submit button in postular
content2 = content2.replace(
  /background: submitting \? 'rgba\\(251, 191, 36, 0.5\\)' : '#fbbf24',\\s*color: '#0f172a'/gi,
  "background: submitting ? '#333333' : '#111111',\n              color: '#fbbf24',\n              border: '1px solid #fbbf24'"
);
content2 = content2.replace(
  /background: submitting \? 'rgba\\(251, 191, 36, 0.5\\)' : '#fbbf24',\\s*color: '#111111'/gi,
  "background: submitting ? '#333333' : '#111111',\n              color: '#fbbf24',\n              border: '1px solid #fbbf24'"
);

fs.writeFileSync(postularPath, content2, 'utf8');

console.log('Replaced inline button styles');
