const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'candidates', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const safeString =     const safeString = (val: any, fallback = '') => {
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (typeof val === 'object' && val !== null) {
        const vals = Object.values(val);
        if (vals.length > 0 && typeof vals[0] === 'string') return vals[0];
        return JSON.stringify(val);
      }
      return fallback;
    };;

content = content.replace(
  /const unifiedList: any\[\] = \[\];/g,
  safeString + '\n\n    const unifiedList: any[] = [];'
);

content = content.replace(
  /id: String\(r\.id\),/g,
  'id: safeString(r.id),'
);
content = content.replace(
  /name: String\(r\.name \|\| r\.sender_name \|\| 'Sin Nombre'\),/g,
  "name: safeString(r.name || r.sender_name || 'Sin Nombre'),"
);
content = content.replace(
  /city: typeof r\.city === 'string' \? r\.city : typeof r\.ciudad === 'string' \? r\.ciudad : String\(r\.city \|\| r\.ciudad \|\| ''\),/g,
  "city: safeString(r.city || r.ciudad || ''),"
);
content = content.replace(
  /justification: String\(r\.justification \|\| 'Evaluado por IA'\),/g,
  "justification: safeString(r.justification || 'Evaluado por IA'),"
);
content = content.replace(
  /pdf_url: String\(r\.pdf_url \|\| ''\),/g,
  "pdf_url: safeString(r.pdf_url || ''),"
);
content = content.replace(
  /position: String\(r\.position \|\| ''\),/g,
  "position: safeString(r.position || ''),"
);
content = content.replace(
  /experience: String\(r\.experience \|\| ''\),/g,
  "experience: safeString(r.experience || ''),"
);
content = content.replace(
  /sender_phone: String\(r\.sender_phone \|\| ''\),/g,
  "sender_phone: safeString(r.sender_phone || ''),"
);
content = content.replace(
  /sender_email: String\(r\.sender_email \|\| r\.email \|\| ''\)/g,
  "sender_email: safeString(r.sender_email || r.email || '')"
);

fs.writeFileSync(filePath, content, 'utf8');
