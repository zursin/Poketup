const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'ui', 'handlers', 'starter-select-ui-handler.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Change the loop over starters
const loopOld = `for (const speciesId of speciesDataRegistry.getAllStarters()) {`;
const loopNew = `const startersList = globalScene.gameMode.isClassic ? [SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE] : speciesDataRegistry.getAllStarters();
    for (const speciesId of startersList) {`;

content = content.replace(loopOld, loopNew);

// 2. Mock getSpeciesData
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
    if (globalScene.gameMode.isClassic && [SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE].includes(speciesId)) {
        return {
            dexEntry: { caughtAttr: 1n, seenAttr: 1n } as any,
            starterDataEntry: { eggMoves: 0, abilityAttr: 1, passiveAttr: 0, valueReduction: 0, candyCount: 0, friendship: 0 } as any
        };
    }
    let dexEntry = globalScene.gameData.dexData[speciesId];
    if (!dexEntry) {
      dexEntry = new DexEntry();
    }`;

content = content.replace(getSpeciesDataOld, getSpeciesDataNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched starter-select-ui-handler.ts');
