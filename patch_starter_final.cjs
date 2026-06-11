const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'ui', 'handlers', 'starter-select-ui-handler.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Restrict startersList
const loopOld = `const startersList = speciesDataRegistry.getAllStarters();
    for (const speciesId of startersList) {`;
const loopNew = `const startersList = globalScene.gameMode.isClassic ? [SpeciesId.INCINEROAR, SpeciesId.POPPLIO, SpeciesId.ROWLET] : speciesDataRegistry.getAllStarters();
    for (const speciesId of startersList) {`;
content = content.replace(loopOld, loopNew);

// 2. Force dexEntry caughtAttr
const dexOld = `let dexEntry = globalScene.gameData.dexData[speciesId];`;
const dexNew = `let dexEntry = globalScene.gameData.dexData[speciesId];
    if (!dexEntry) {
        dexEntry = { caughtAttr: 0n, seenAttr: 0n, natureAttr: 0, shinyAttr: 0, formAttr: 0n, genderAttr: 0, abilityAttr: 0, ivs: [0,0,0,0,0,0], ribbons: new Set() } as any;
    }
    if (globalScene.gameMode.isClassic && [SpeciesId.INCINEROAR, SpeciesId.POPPLIO, SpeciesId.ROWLET].includes(speciesId)) {
        dexEntry.caughtAttr = 1n;
        dexEntry.seenAttr = 1n;
    }`;
content = content.replace(dexOld, dexNew);

// 3. Force starterDataEntry
const sDataOld = `let starterDataEntry = globalScene.gameData.starterData[speciesId];`;
const sDataNew = `let starterDataEntry = globalScene.gameData.starterData[speciesId];
    if (!starterDataEntry) {
        starterDataEntry = { eggMoves: 0, abilityAttr: 1, passiveAttr: 0, valueReduction: 0, candyCount: 0, friendship: 0, classicWinCount: 0, moveset: null } as any;
    }`;
content = content.replace(sDataOld, sDataNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully applied patch_starter_final.cjs');
