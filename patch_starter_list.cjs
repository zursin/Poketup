const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'ui', 'handlers', 'starter-select-ui-handler.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Update the list of starters
const loopOld = `[SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE]`;
const loopNew = `[SpeciesId.INCINEROAR, SpeciesId.POPPLIO, SpeciesId.ROWLET]`;

content = content.replace(new RegExp(loopOld.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), loopNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched starter-select-ui-handler.ts for Popplio and Rowlet');
