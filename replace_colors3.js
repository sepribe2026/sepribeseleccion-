const fs = require('fs');
const path = require('path');
const folder = path.join(__dirname, 'src', 'app');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(folder);
files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Navy Blue/Slate to Black/Zinc
  content = content.replace(/#0f172a/gi, '#111111');
  content = content.replace(/#1e293b/gi, '#171717');
  content = content.replace(/#334155/gi, '#27272a');
  content = content.replace(/rgba\(30,\s*41,\s*59/gi, 'rgba(23, 23, 23'); // rgba #1e293b -> #171717
  content = content.replace(/rgba\(15,\s*23,\s*42/gi, 'rgba(17, 17, 17'); // rgba #0f172a -> #111111

  // Replace Purples/Blues to Yellow/Amber
  content = content.replace(/#7c3aed/gi, '#fbbf24');
  content = content.replace(/#6366f1/gi, '#fbbf24');
  content = content.replace(/#3b82f6/gi, '#fbbf24');
  content = content.replace(/#4f46e5/gi, '#eab308');
  content = content.replace(/#8b5cf6/gi, '#fbbf24');
  
  // Specific blues
  content = content.replace(/#2563eb/gi, '#fbbf24'); // tab active
  content = content.replace(/rgba\(37,\s*99,\s*235/gi, 'rgba(251, 191, 36'); // tab active bg
  content = content.replace(/#1e40af/gi, '#171717'); // event time
  content = content.replace(/#1e3a8a/gi, '#09090b'); // event title
  content = content.replace(/#4338ca/gi, '#eab308');
  content = content.replace(/#3730a3/gi, '#854d0e');

  // Light Backgrounds (from blue/purple to yellow)
  content = content.replace(/#eff6ff/gi, '#fef9c3');
  content = content.replace(/#f3e8ff/gi, '#fef9c3');

  // text colors on those light backgrounds
  content = content.replace(/#9333ea/gi, '#854d0e');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Replaced colors across all TSX files.');
