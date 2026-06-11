const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'ui', 'handlers', 'starter-select-ui-handler.ts');
let content = fs.readFileSync(filePath, 'utf8');

const getSpeciesDataOldReturn = `let starterDataEntry = globalScene.gameData.starterData[speciesId];
    if (!starterDataEntry) starterDataEntry = new StarterDataEntry();`;

const getSpeciesDataNewReturn = `let starterDataEntry = globalScene.gameData.starterData[speciesId];
    if (!starterDataEntry) starterDataEntry = { eggMoves: 0, abilityAttr: 1, passiveAttr: 0, valueReduction: 0, candyCount: 0, friendship: 0, classicWinCount: 0 } as any;`;

content = content.replace(getSpeciesDataOldReturn, getSpeciesDataNewReturn);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched starter-select-ui-handler.ts with mock object');
