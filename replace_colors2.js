const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'candidates', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Blues to Yellow/Black in <style>
content = content.replace(/#2563eb/gi, '#fbbf24'); // tab active
content = content.replace(/rgba\(37,\s*99,\s*235/gi, 'rgba(251, 191, 36'); // tab active bg
content = content.replace(/#1e40af/gi, '#171717'); // event time
content = content.replace(/#1e3a8a/gi, '#09090b'); // event title

// Other indigo remnants
content = content.replace(/#4338ca/gi, '#eab308');
content = content.replace(/#3730a3/gi, '#854d0e');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced more blues in candidates/page.tsx');
