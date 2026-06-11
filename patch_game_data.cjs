const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'system', 'game-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

const getSpeciesStarterValueOld = `getSpeciesStarterValue(speciesId: SpeciesId, valueReduction?: number): number {
    const baseValue = speciesDataRegistry.getStarterCost(speciesId);`;

const getSpeciesStarterValueNew = `getSpeciesStarterValue(speciesId: SpeciesId, valueReduction?: number): number {
    if (globalScene?.gameMode?.isClassic && [SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE].includes(speciesId)) {
        return 3;
    }
    const baseValue = speciesDataRegistry.getStarterCost(speciesId);`;

content = content.replace(getSpeciesStarterValueOld, getSpeciesStarterValueNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched game-data.ts');
