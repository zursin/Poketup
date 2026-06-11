const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'ui', 'handlers', 'starter-select-ui-handler.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Change the loop over starters
const loopOld = `const startersList = globalScene.gameMode.isClassic ? [SpeciesId.LITTEN, SpeciesId.POPPLIO, SpeciesId.ROWLET] : speciesDataRegistry.getAllStarters();
    for (const speciesId of startersList) {`;
const loopNew = `const startersList = globalScene.gameMode.isClassic ? [SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE] : speciesDataRegistry.getAllStarters();
    for (const speciesId of startersList) {`;

content = content.replace(loopOld, loopNew);

// 2. Safely mock dex and starter data
const getSpeciesDataOld = `getSpeciesData(
    speciesId: SpeciesId,
    applyChallenge = true,
  ): { dexEntry: DexEntry; starterDataEntry: StarterDataEntry } {
    let dexEntry = globalScene.gameData.dexData[speciesId];
    if (!dexEntry) {
      dexEntry = new DexEntry();
    }`;

const getSpeciesDataNew = `getSpeciesData(
    speciesId: SpeciesId,
    applyChallenge = true,
  ): { dexEntry: DexEntry; starterDataEntry: StarterDataEntry } {
    let dexEntry = globalScene.gameData.dexData[speciesId];
    if (!dexEntry) {
      dexEntry = new DexEntry();
    }
    
    if (globalScene.gameMode.isClassic && [SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE].includes(speciesId)) {
        dexEntry.caughtAttr = 1n; // Force them to be selectable
        dexEntry.seenAttr = 1n;
    }`;

content = content.replace(getSpeciesDataOld, getSpeciesDataNew);

const getSpeciesDataOldReturn = `const starterDataEntry = globalScene.gameData.starterData[speciesId];
    return { dexEntry, starterDataEntry };`;
const getSpeciesDataNewReturn = `let starterDataEntry = globalScene.gameData.starterData[speciesId];
    if (!starterDataEntry) starterDataEntry = new StarterDataEntry();
    return { dexEntry, starterDataEntry };`;

content = content.replace(getSpeciesDataOldReturn, getSpeciesDataNewReturn);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched starter-select-ui-handler.ts with proper UI logic');
