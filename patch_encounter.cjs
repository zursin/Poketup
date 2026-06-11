const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace enemy spawning logic
const spawnOld = `          if (globalScene.gameMode.isClassic && battle.waveIndex === 1) {
            enemySpecies = getPokemonSpecies(SpeciesId.EXEGGCUTE);
            enemyLevel = 6;
          } else if (globalScene.gameMode.isClassic && battle.waveIndex === 2) {
            enemySpecies = getPokemonSpecies(SpeciesId.SLOWBRO);
            enemyLevel = 8;
          }`;

const spawnNew = `          if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 8) {
            const bossSpecies = [
              null,
              SpeciesId.EXEGGCUTE,
              SpeciesId.SLOWBRO,
              SpeciesId.MACHAMP,
              SpeciesId.ALAKAZAM,
              SpeciesId.BLISSEY,
              SpeciesId.GENGAR,
              SpeciesId.SNORLAX,
              SpeciesId.DRAGONITE
            ];
            enemySpecies = getPokemonSpecies(bossSpecies[battle.waveIndex]);
            enemyLevel = 10 + battle.waveIndex;
          }`;

content = content.replace(spawnOld, spawnNew);

// Replace wonder guard assignment
const wonderGuardOld = `      if (globalScene.gameMode.isClassic && (battle.waveIndex === 1 || battle.waveIndex === 2)) {
        enemyPokemon.summonData.ability = AbilityId.WONDER_GUARD;
      }`;
const wonderGuardNew = `      if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 8) {
        enemyPokemon.summonData.ability = AbilityId.WONDER_GUARD;
      }`;
content = content.replace(wonderGuardOld, wonderGuardNew);

// Replace the dialogue block
// Finding the block between `if (globalScene.gameMode.isClassic && globalScene.currentBattle.waveIndex === 1) {`
// and `if (showEncounterMessage) {`

const blockStart = content.indexOf('      if (globalScene.gameMode.isClassic && globalScene.currentBattle.waveIndex === 1) {');
const blockEnd = content.indexOf('      if (showEncounterMessage) {');

if (blockStart === -1 || blockEnd === -1) {
  console.log("Could not find the dialogue block boundaries.");
  process.exit(1);
}

const dialogueNew = `      if (globalScene.gameMode.isClassic && globalScene.currentBattle.waveIndex >= 1 && globalScene.currentBattle.waveIndex <= 9) {
        const wave = globalScene.currentBattle.waveIndex;
        const playerParty = globalScene.getPlayerParty();
        
        if (wave === 1) {
          const playerPokemon = globalScene.getPlayerPokemon();
          if (playerPokemon) {
            playerPokemon.moveset = [
              new PokemonMove(MoveId.THUNDERBOLT, 0, 0, 15),
              new PokemonMove(MoveId.FLAMETHROWER, 0, 0, 15),
              new PokemonMove(MoveId.DARK_PULSE, 0, 0, 15),
              new PokemonMove(MoveId.TACKLE, 0, 0, 35)
            ];
          }

          if (playerParty.length === 1) {
            const primarina = globalScene.addPlayerPokemon(
              getPokemonSpecies(SpeciesId.PRIMARINA),
              10, 0, 0, 1, false, 0,
              [31, 31, 31, 31, 31, 31], 0
            );
            primarina.moveset = [
              new PokemonMove(MoveId.SURF, 0, 0, 15),
              new PokemonMove(MoveId.PSYCHIC, 0, 0, 15),
              new PokemonMove(MoveId.ICE_BEAM, 0, 0, 15),
              new PokemonMove(MoveId.WATER_GUN, 0, 0, 25)
            ];
            playerParty.push(primarina);
            primarina.loadAssets();

            const decidueye = globalScene.addPlayerPokemon(
              getPokemonSpecies(SpeciesId.DECIDUEYE),
              10, 0, 0, 0, false, 0,
              [31, 31, 31, 31, 31, 31], 0
            );
            decidueye.moveset = [
              new PokemonMove(MoveId.LEAF_BLADE, 0, 0, 15),
              new PokemonMove(MoveId.SHADOW_BALL, 0, 0, 15),
              new PokemonMove(MoveId.PECK, 0, 0, 35),
              new PokemonMove(MoveId.GUST, 0, 0, 35)
            ];
            playerParty.push(decidueye);
            decidueye.loadAssets();
          }
        }

        if (wave === 9) {
          // Finish the game
          (globalScene as any).correctMoveForWave = undefined;
          const { getPlayTimeString } = require("#utils/common");
          const playTime = getPlayTimeString(globalScene.sessionPlayTime);
          const showDialog2 = () => globalScene.ui.showText(\`Completaste el recorrido en: \${playTime}.\\n¡Felicidades!\`, null, () => globalScene.gameMode.endGame(), 0, true);
          const showDialog1 = () => globalScene.ui.showText("¡Has demostrado que sabes cómo\\ntrabajar en equipo de forma sinérgica!", null, showDialog2, 0, true);
          globalScene.ui.showText("¡Recorrido Tup Completado!", null, showDialog1, 1500, true);
          return;
        }
        
        const waveData = [
          null,
          { question: "Imagina que Exeggcute representa a unos\\nestudiantes. ¿Qué pilar suma sus diferencias?", correct: MoveId.THUNDERBOLT, answerText: "Usa la respuesta correcta de tus ataques." },
          { question: "Slowbro representa la unión para apoyarse.\\n¿Qué elemento ensambla piezas sin que el ego compita?", correct: MoveId.SURF, answerText: "Encuentra la respuesta correcta." },
          { question: "Machamp tiene mucha fuerza, pero necesita\\ndirección. ¿Qué pone los egos en 2do plano?", correct: MoveId.LEAF_BLADE, answerText: "Selecciona el ataque con la respuesta." },
          { question: "Alakazam es inteligente. ¿Qué fomenta un\\nambiente seguro para dar ideas sin ser juzgado?", correct: MoveId.FLAMETHROWER, answerText: "Busca la respuesta en tu equipo." },
          { question: "Blissey ayuda a los demás. ¿Qué elemento\\npermite que hablen de forma abierta y sincera?", correct: MoveId.PSYCHIC, answerText: "Usa el movimiento exacto." },
          { question: "Gengar trabaja en las sombras. ¿Qué se necesita\\npara cumplir tareas propias sin depender de otros?", correct: MoveId.SHADOW_BALL, answerText: "Revisa los ataques." },
          { question: "Snorlax a veces es un obstáculo. Cuando hay\\nproblemas, ¿qué habilidad los soluciona?", correct: MoveId.DARK_PULSE, answerText: "Casi terminamos. ¡Elige bien!" },
          { question: "Dragonite es un poderoso aliado. ¿Qué\\ncualidad guía motivadora y coordinadamente al equipo?", correct: MoveId.ICE_BEAM, answerText: "¡Última pregunta! Da el golpe final." }
        ];

        const currentData = waveData[wave];
        (globalScene as any).correctMoveForWave = currentData.correct;

        const showDialog2 = () => globalScene.ui.showText(currentData.answerText, null, () => this.end(), 0, true);
        const showDialog1 = () => globalScene.ui.showText(currentData.question, null, showDialog2, 0, true);

        globalScene.ui.showText(this.getEncounterMessage(), null, showDialog1, 1500, true);
        return;
      }

`;

content = content.substring(0, blockStart) + dialogueNew + content.substring(blockEnd);

// Need to make sure import for getPlayTimeString is correct. It's likely already in encounter-phase or we can import it.
// Let's add the import to the top if it's missing.
if (!content.includes('getPlayTimeString')) {
  content = content.replace('import { getPokemonSpecies', 'import { getPlayTimeString } from "#utils/common";\nimport { getPokemonSpecies');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched encounter-phase.ts');
