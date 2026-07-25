const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'candidates', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix cedula=undefined in fetchPipeline
content = content.replace(
  /const res = await fetch\(\/api\/candidate-tracking\?company_slug=\\$\{user\.company_slug\}&cedula=\\$\{user\.cedula\}\)/g,
  "const cedulaParam = user.cedula ? &cedula=\\ : '';\n    const res = await fetch(/api/candidate-tracking?company_slug=\\\\)"
);

// Fix cedula=undefined in fetchTracking
content = content.replace(
  /const res = await fetch\(\/api\/candidate-tracking\?cargo=\\$\{cargo\}&company_slug=\\$\{user\.company_slug\}&cedula=\\$\{user\.cedula\}\)/g,
  "const cedulaParam = user.cedula ? &cedula=\\ : '';\n    const res = await fetch(/api/candidate-tracking?cargo=\\&company_slug=\\\\)"
);

// Also let's log the error in updateTracking directly to UI
content = content.replace(
  /alert\("Error al actualizar estado: " \+ \(data\.error \|\| "Desconocido"\)\);/g,
  "alert(\"Error de BD al actualizar: \" + (data.error || \"\"));"
);

fs.writeFileSync(filePath, content, 'utf8');
