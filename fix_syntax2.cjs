const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { PokemonMove }')) {
  content = content.replace('import type { Pokemon } from "#field/pokemon";', 'import type { Pokemon } from "#field/pokemon";\nimport { PokemonMove } from "#moves/pokemon-move";');
}
if (!content.includes('import { getPlayTimeString }')) {
  content = content.replace('import { randSeedInt, randSeedItem } from "#utils/common";', 'import { randSeedInt, randSeedItem, getPlayTimeString } from "#utils/common";');
}

const getSpeciesOld = `enemySpecies = getPokemonSpecies(bossSpecies[battle.waveIndex]);`;
const getSpeciesNew = `enemySpecies = getPokemonSpecies(bossSpecies[battle.waveIndex] as SpeciesId);`;
content = content.replace(getSpeciesOld, getSpeciesNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax again');
