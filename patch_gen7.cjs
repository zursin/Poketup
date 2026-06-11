const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'balance', 'species', 'generation-07.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Update INCINEROAR starterCost
content = content.replace(`starter: SpeciesId.INCINEROAR,
    starterCost: 5,`, `starter: SpeciesId.INCINEROAR,
    starterCost: 3,`);

// Add starter/starterCost to PRIMARINA
const primarinaTarget = `        malePercent: 87.5,
        genderDiffs: false,
      }),`;
const primarinaNew = `        malePercent: 87.5,
        genderDiffs: false,
      }),
      starter: SpeciesId.PRIMARINA,
      starterCost: 3,`;
if (content.indexOf(`starter: SpeciesId.PRIMARINA`) === -1) {
    const pIdx = content.indexOf(`id: SpeciesId.PRIMARINA,`);
    const targetIdx = content.indexOf(primarinaTarget, pIdx);
    if (targetIdx !== -1) {
        content = content.substring(0, targetIdx) + primarinaNew + content.substring(targetIdx + primarinaTarget.length);
    }
}

// Add starter/starterCost to DECIDUEYE
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
if (content.indexOf(`starter: SpeciesId.DECIDUEYE`) === -1) {
    const dIdx = content.indexOf(`id: SpeciesId.DECIDUEYE,`);
    const targetIdx = content.indexOf(decidueyeTarget, dIdx);
    if (targetIdx !== -1) {
        content = content.substring(0, targetIdx) + decidueyeNew + content.substring(targetIdx + decidueyeTarget.length);
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched generation-07.ts starters');
