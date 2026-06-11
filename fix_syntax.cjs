const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { getPokemonSpecies }')) {
  content = content.replace('import { getPokemonNameWithAffix }', 'import { getPokemonSpecies } from "#utils/pokemon-utils";\nimport { getPokemonNameWithAffix }');
}
if (!content.includes('import { MoveId }')) {
  content = content.replace('import { SpeciesId }', 'import { MoveId } from "#enums/move-id";\nimport { SpeciesId }');
}
if (!content.includes('PokemonMove')) {
  content = content.replace('import type { Pokemon }', 'import { PokemonMove } from "#moves/pokemon-move";\nimport type { Pokemon }');
}
if (!content.includes('getPlayTimeString')) {
  content = content.replace('import { randSeedInt', 'import { getPlayTimeString } from "#utils/common";\nimport { randSeedInt');
}

// Fix the endGame issue
const oldEndGame = `() => globalScene.gameMode.endGame()`;
const newEndGame = `() => { globalScene.phaseManager.unshiftNew("GameOverPhase", true); this.end(); }`;
content = content.replace(oldEndGame, newEndGame);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax issues');
