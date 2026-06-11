const fs = require('fs');
const path = require('path');

// 1. Revert starter-select-ui-handler.ts
const starterPath = path.join(__dirname, 'src', 'ui', 'handlers', 'starter-select-ui-handler.ts');
let starterContent = fs.readFileSync(starterPath, 'utf8');

const loopOld = `const startersList = globalScene.gameMode.isClassic ? [SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE] : speciesDataRegistry.getAllStarters();
    for (const speciesId of startersList) {`;
const loopNew = `const startersList = globalScene.gameMode.isClassic ? [SpeciesId.LITTEN, SpeciesId.POPPLIO, SpeciesId.ROWLET] : speciesDataRegistry.getAllStarters();
    for (const speciesId of startersList) {`;
starterContent = starterContent.replace(loopOld, loopNew);

const getSpeciesDataOld = `getSpeciesData(
    speciesId: SpeciesId,
    applyChallenge = true,
  ): { dexEntry: DexEntry; starterDataEntry: StarterDataEntry } {
    if (globalScene.gameMode.isClassic && [SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE].includes(speciesId)) {
        return {
            dexEntry: { caughtAttr: 1n, seenAttr: 1n } as any,
            starterDataEntry: { eggMoves: 0, abilityAttr: 1, passiveAttr: 0, valueReduction: 0, candyCount: 0, friendship: 0 } as any
        };
    }
    let dexEntry = globalScene.gameData.dexData[speciesId];`;
const getSpeciesDataNew = `getSpeciesData(
    speciesId: SpeciesId,
    applyChallenge = true,
  ): { dexEntry: DexEntry; starterDataEntry: StarterDataEntry } {
    let dexEntry = globalScene.gameData.dexData[speciesId];`;
starterContent = starterContent.replace(getSpeciesDataOld, getSpeciesDataNew);

fs.writeFileSync(starterPath, starterContent, 'utf8');
console.log('Successfully reverted starter-select-ui-handler.ts');

// 2. Revert game-data.ts
const gameDataPath = path.join(__dirname, 'src', 'system', 'game-data.ts');
let gameDataContent = fs.readFileSync(gameDataPath, 'utf8');

const getSpeciesStarterValueOld = `getSpeciesStarterValue(speciesId: SpeciesId, valueReduction?: number): number {
    if (globalScene?.gameMode?.isClassic && [SpeciesId.INCINEROAR, SpeciesId.PRIMARINA, SpeciesId.DECIDUEYE].includes(speciesId)) {
        return 3;
    }
    const baseValue = speciesDataRegistry.getStarterCost(speciesId);`;
const getSpeciesStarterValueNew = `getSpeciesStarterValue(speciesId: SpeciesId, valueReduction?: number): number {
    const baseValue = speciesDataRegistry.getStarterCost(speciesId);`;
gameDataContent = gameDataContent.replace(getSpeciesStarterValueOld, getSpeciesStarterValueNew);

fs.writeFileSync(gameDataPath, gameDataContent, 'utf8');
console.log('Successfully reverted game-data.ts');

// 3. Patch encounter-phase.ts to transform Litten to Incineroar, etc.
const encounterPath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let encounterContent = fs.readFileSync(encounterPath, 'utf8');

const wave1Old = `          if (wave === 1) {
            for (const p of playerParty) {
              if (p.species.speciesId === SpeciesId.INCINEROAR) {`;
const wave1New = `          if (wave === 1) {
            for (let i = 0; i < playerParty.length; i++) {
              let p = playerParty[i];
              let targetSpeciesId = null;
              if (p.species.speciesId === SpeciesId.LITTEN || p.species.speciesId === SpeciesId.TORRACAT || p.species.speciesId === SpeciesId.INCINEROAR) targetSpeciesId = SpeciesId.INCINEROAR;
              else if (p.species.speciesId === SpeciesId.POPPLIO || p.species.speciesId === SpeciesId.BRIONNE || p.species.speciesId === SpeciesId.PRIMARINA) targetSpeciesId = SpeciesId.PRIMARINA;
              else if (p.species.speciesId === SpeciesId.ROWLET || p.species.speciesId === SpeciesId.DARTRIX || p.species.speciesId === SpeciesId.DECIDUEYE) targetSpeciesId = SpeciesId.DECIDUEYE;

              if (targetSpeciesId && p.species.speciesId !== targetSpeciesId) {
                const newP = globalScene.addPlayerPokemon(
                  getPokemonSpecies(targetSpeciesId),
                  10, 0, 0, p.gender, p.isShiny(), p.variant,
                  [31, 31, 31, 31, 31, 31], 0
                );
                playerParty[i] = newP;
                p = newP;
                newP.loadAssets();
              }

              if (p.species.speciesId === SpeciesId.INCINEROAR) {`;

encounterContent = encounterContent.replace(wave1Old, wave1New);

// Fix the closing bracket of the loop to match
const wave1OldEnd = `                  new PokemonMove(MoveId.GUST, 0, 0, 35)
                ];
              }
            }
          }`;
const wave1NewEnd = `                  new PokemonMove(MoveId.GUST, 0, 0, 35)
                ];
              }
              p.level = 10;
              p.hp = p.getMaxHp();
            }
          }`;

encounterContent = encounterContent.replace(wave1OldEnd, wave1NewEnd);

fs.writeFileSync(encounterPath, encounterContent, 'utf8');
console.log('Successfully patched encounter-phase.ts for evolution');
