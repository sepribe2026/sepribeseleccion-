const fs = require('fs');
const fileContent = fs.readFileSync('c:/Users/JSOTO/.gemini/antigravity/playground/digitalizacion/src/app/candidates/page.tsx', 'utf8');
const lines = fileContent.split('\n');
lines.forEach((line, idx) => {
  if (line.includes("handleUpdatePhone") || line.includes("sender_phone")) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
