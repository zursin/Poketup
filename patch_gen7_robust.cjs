const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'balance', 'species', 'generation-07.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace CRLF with LF to make matching easier
content = content.replace(/\r\n/g, '\n');

// PRIMARINA
const primarinaTarget = `        malePercent: 87.5,
        genderDiffs: false,
      }),`;
const primarinaNew = `        malePercent: 87.5,
        genderDiffs: false,
      }),
      starter: SpeciesId.PRIMARINA,
      starterCost: 3,`;
if (!content.includes('starter: SpeciesId.PRIMARINA')) {
    const pIdx = content.indexOf('id: SpeciesId.PRIMARINA,');
    const targetIdx = content.indexOf(primarinaTarget, pIdx);
    if (targetIdx !== -1) {
        content = content.substring(0, targetIdx) + primarinaNew + content.substring(targetIdx + primarinaTarget.length);
    } else {
        console.log('Could not find primarinaTarget');
    }
}

// DECIDUEYE
const decidueyeTarget = `        growthRate: GrowthRate.MEDIUM_SLOW,
        malePercent: 87.5,
        genderDiffs: false,
      }),`;
const decidueyeNew = `        growthRate: GrowthRate.MEDIUM_SLOW,
        malePercent: 87.5,
        genderDiffs: false,
      }),
      starter: SpeciesId.DECIDUEYE,
      starterCost: 3,`;
if (!content.includes('starter: SpeciesId.DECIDUEYE')) {
    const dIdx = content.indexOf('id: SpeciesId.DECIDUEYE,');
    const targetIdx = content.indexOf(decidueyeTarget, dIdx);
    if (targetIdx !== -1) {
        content = content.substring(0, targetIdx) + decidueyeNew + content.substring(targetIdx + decidueyeTarget.length);
    } else {
        console.log('Could not find decidueyeTarget');
    }
}

// Write it back with CRLF if needed (or just let git handle it)
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched generation-07.ts robustly');
