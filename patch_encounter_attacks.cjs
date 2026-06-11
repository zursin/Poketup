const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove enemy Wonder Guard / specific moves in wave generation and move it properly
// Wait, I shouldn't remove Wonder Guard, the user wants Wonder Guard!
// But I should force enemy moves to TACKLE.
const enemyMoveIndex = content.indexOf('if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 8) {');
if (enemyMoveIndex !== -1) {
    const blockEnd = content.indexOf('}', enemyMoveIndex) + 1;
    const oldBlock = content.substring(enemyMoveIndex, blockEnd);
    const newBlock = `if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 8) {
          enemyPokemon.summonData.ability = AbilityId.WONDER_GUARD;
          enemyPokemon.moveset = [new PokemonMove(MoveId.TACKLE, 0, 0, 35)];
        }`;
    content = content.replace(oldBlock, newBlock);
}

// 2. Update player's team logic in wave 1 to use Incineroar, Popplio, Rowlet
const wave1Start = content.indexOf('          if (wave === 1) {');
const wave1End = content.indexOf('          if (wave === 9) {');
if (wave1Start !== -1 && wave1End !== -1) {
    const newWave1 = `          if (wave === 1) {
            for (let i = 0; i < playerParty.length; i++) {
              let p = playerParty[i];
              if (p.species.speciesId === SpeciesId.INCINEROAR) {
                p.moveset = [
                  new PokemonMove(MoveId.THUNDERBOLT, 0, 0, 15),
                  new PokemonMove(MoveId.FLAMETHROWER, 0, 0, 15),
                  new PokemonMove(MoveId.DARK_PULSE, 0, 0, 15),
                  new PokemonMove(MoveId.TACKLE, 0, 0, 35)
                ];
              } else if (p.species.speciesId === SpeciesId.POPPLIO) {
                p.moveset = [
                  new PokemonMove(MoveId.SURF, 0, 0, 15),
                  new PokemonMove(MoveId.PSYCHIC, 0, 0, 15),
                  new PokemonMove(MoveId.ICE_BEAM, 0, 0, 15),
                  new PokemonMove(MoveId.WATER_GUN, 0, 0, 25)
                ];
              } else if (p.species.speciesId === SpeciesId.ROWLET) {
                p.moveset = [
                  new PokemonMove(MoveId.LEAF_BLADE, 0, 0, 15),
                  new PokemonMove(MoveId.SHADOW_BALL, 0, 0, 15),
                  new PokemonMove(MoveId.PECK, 0, 0, 35),
                  new PokemonMove(MoveId.GUST, 0, 0, 35)
                ];
              }
              p.level = 10;
              p.hp = p.getMaxHp();
            }
          }

`;
    content = content.substring(0, wave1Start) + newWave1 + content.substring(wave1End);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched encounter-phase.ts');
