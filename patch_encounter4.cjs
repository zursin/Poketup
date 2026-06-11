const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let content = fs.readFileSync(filePath, 'utf8');

const wave1OldStart = `          if (wave === 1) {
            const playerPokemon = globalScene.getPlayerPokemon();`;

const wave1OldEnd = `              playerParty.push(decidueye);
              decidueye.loadAssets();
              globalScene.ui.updateParty();
            }
          }`;

const startIndex = content.indexOf('          if (wave === 1) {');
const endIndex = content.indexOf('          if (wave === 9) {');

if (startIndex !== -1 && endIndex !== -1) {
  const newWave1 = `          if (wave === 1) {
            for (const p of playerParty) {
              if (p.species.speciesId === SpeciesId.INCINEROAR) {
                p.moveset = [
                  new PokemonMove(MoveId.THUNDERBOLT, 0, 0, 15),
                  new PokemonMove(MoveId.FLAMETHROWER, 0, 0, 15),
                  new PokemonMove(MoveId.DARK_PULSE, 0, 0, 15),
                  new PokemonMove(MoveId.TACKLE, 0, 0, 35)
                ];
              } else if (p.species.speciesId === SpeciesId.PRIMARINA) {
                p.moveset = [
                  new PokemonMove(MoveId.SURF, 0, 0, 15),
                  new PokemonMove(MoveId.PSYCHIC, 0, 0, 15),
                  new PokemonMove(MoveId.ICE_BEAM, 0, 0, 15),
                  new PokemonMove(MoveId.WATER_GUN, 0, 0, 25)
                ];
              } else if (p.species.speciesId === SpeciesId.DECIDUEYE) {
                p.moveset = [
                  new PokemonMove(MoveId.LEAF_BLADE, 0, 0, 15),
                  new PokemonMove(MoveId.SHADOW_BALL, 0, 0, 15),
                  new PokemonMove(MoveId.PECK, 0, 0, 35),
                  new PokemonMove(MoveId.GUST, 0, 0, 35)
                ];
              }
            }
          }

`;
  content = content.substring(0, startIndex) + newWave1 + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched encounter-phase.ts');
} else {
  console.log('Could not find wave 1 block');
}
