const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'candidates', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Navy Blue/Slate to Black/Zinc
content = content.replace(/#0f172a/gi, '#111111');
content = content.replace(/#1e293b/gi, '#171717');
content = content.replace(/#334155/gi, '#27272a');

// Replace Purples/Blues to Yellow/Amber
content = content.replace(/#7c3aed/gi, '#fbbf24');
content = content.replace(/#6366f1/gi, '#fbbf24');
content = content.replace(/#3b82f6/gi, '#fbbf24');
content = content.replace(/#4f46e5/gi, '#eab308');
content = content.replace(/#8b5cf6/gi, '#fbbf24');

// Replace Light Backgrounds (from blue/purple to yellow)
content = content.replace(/#eff6ff/gi, '#fef9c3');
content = content.replace(/#f3e8ff/gi, '#fef9c3');

// Replace text colors on those light backgrounds (from blue/purple to dark yellow)
content = content.replace(/#9333ea/gi, '#854d0e');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced colors in candidates/page.tsx');
