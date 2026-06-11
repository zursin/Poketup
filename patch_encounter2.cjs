const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace enemy spawning logic
const spawnOld = `          let enemySpecies = globalScene.randomSpecies(battle.waveIndex, level, true);
          // If player has golden bug net, rolls 10% chance to replace non-boss wave wild species from the golden bug net bug pool
          if (
            globalScene.findModifier(m => m instanceof BoostBugSpawnModifier)
            && !globalScene.gameMode.isBoss(battle.waveIndex)
            && globalScene.arena.biomeId !== BiomeId.END
            && randSeedInt(10) === 0
          ) {
            enemySpecies = getGoldenBugNetSpecies(level);
          }
          battle.enemyParty[e] = globalScene.addEnemyPokemon(
            enemySpecies,
            level,
            TrainerSlot.NONE,
            !!globalScene.getEncounterBossSegments(battle.waveIndex, level, enemySpecies),
          );`;

const spawnNew = `          let enemySpecies = globalScene.randomSpecies(battle.waveIndex, level, true);
          let enemyLevel = level;
          if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 8) {
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
            enemySpecies = getPokemonSpecies(bossSpecies[battle.waveIndex] as SpeciesId);
            enemyLevel = 10 + battle.waveIndex;
          }
          // If player has golden bug net, rolls 10% chance to replace non-boss wave wild species from the golden bug net bug pool
          if (
            globalScene.findModifier(m => m instanceof BoostBugSpawnModifier)
            && !globalScene.gameMode.isBoss(battle.waveIndex)
            && globalScene.arena.biomeId !== BiomeId.END
            && randSeedInt(10) === 0
          ) {
            enemySpecies = getGoldenBugNetSpecies(enemyLevel);
          }
          battle.enemyParty[e] = globalScene.addEnemyPokemon(
            enemySpecies,
            enemyLevel,
            TrainerSlot.NONE,
            !!globalScene.getEncounterBossSegments(battle.waveIndex, enemyLevel, enemySpecies),
          );`;

content = content.replace(spawnOld, spawnNew);

// 2. Add wonder guard assignment
const wonderGuardLocation = `      const enemyPokemon = globalScene.getEnemyParty()[e];
      if (e < (battle.double ? 2 : 1)) {
        enemyPokemon.setX(-66 + enemyPokemon.getFieldPositionOffset()[0]);
        enemyPokemon.fieldSetup(true);
      }`;

const wonderGuardNew = `      const enemyPokemon = globalScene.getEnemyParty()[e];
      if (e < (battle.double ? 2 : 1)) {
        enemyPokemon.setX(-66 + enemyPokemon.getFieldPositionOffset()[0]);
        enemyPokemon.fieldSetup(true);
      }
      if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 8) {
        enemyPokemon.summonData.ability = AbilityId.WONDER_GUARD;
      }`;

content = content.replace(wonderGuardLocation, wonderGuardNew);

// 3. Add dialogue logic
const doTrainerSummonBlock = `        const doTrainerSummon = () => {
          this.hideEnemyTrainer();
          const availablePartyMembers = globalScene.getEnemyParty().filter(p => !p.isFainted()).length;
          globalScene.phaseManager.unshiftNew("SummonPhase", 0, false);
          if (globalScene.currentBattle.double && availablePartyMembers > 1) {
            globalScene.phaseManager.unshiftNew("SummonPhase", 1, false);
          }
          this.end();
        };
        if (showEncounterMessage) {
          globalScene.ui.showText(this.getEncounterMessage(), null, doTrainerSummon, 1500, true);
        } else {
          doTrainerSummon();
        }`;

const dialogueNew = `        const doTrainerSummon = () => {
          this.hideEnemyTrainer();
          const availablePartyMembers = globalScene.getEnemyParty().filter(p => !p.isFainted()).length;
          globalScene.phaseManager.unshiftNew("SummonPhase", 0, false);
          if (globalScene.currentBattle.double && availablePartyMembers > 1) {
            globalScene.phaseManager.unshiftNew("SummonPhase", 1, false);
          }
          this.end();
        };
        if (globalScene.gameMode.isClassic && globalScene.currentBattle.waveIndex >= 1 && globalScene.currentBattle.waveIndex <= 9) {
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
              globalScene.ui.updateParty();
            }
          }

          if (wave === 9) {
            (globalScene as any).correctMoveForWave = undefined;
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
          if (currentData) {
            (globalScene as any).correctMoveForWave = currentData.correct;
            const showDialog2 = () => globalScene.ui.showText(currentData.answerText, null, doTrainerSummon, 0, true);
            const showDialog1 = () => globalScene.ui.showText(currentData.question, null, showDialog2, 0, true);
            globalScene.ui.showText(this.getEncounterMessage(), null, showDialog1, 1500, true);
            return;
          }
        }

        if (showEncounterMessage) {
          globalScene.ui.showText(this.getEncounterMessage(), null, doTrainerSummon, 1500, true);
        } else {
          doTrainerSummon();
        }`;

content = content.replace(doTrainerSummonBlock, dialogueNew);

// Add imports if missing
if (!content.includes('import { MoveId }')) {
  content = content.replace('import { SpeciesId } from "#enums/species-id";', 'import { SpeciesId } from "#enums/species-id";\nimport { MoveId } from "#enums/move-id";');
}
if (!content.includes('PokemonMove')) {
  content = content.replace('import { Pokemon } from "#field/pokemon";', 'import { Pokemon } from "#field/pokemon";\nimport { PokemonMove } from "#moves/pokemon-move";');
}
if (!content.includes('getPlayTimeString')) {
  content = content.replace('import { getPokemonSpecies } from "#utils/pokemon-utils";', 'import { getPokemonSpecies } from "#utils/pokemon-utils";\nimport { getPlayTimeString } from "#utils/common";');
}
if (!content.includes('import { AbilityId }')) {
  content = content.replace('import { SpeciesId } from "#enums/species-id";', 'import { SpeciesId } from "#enums/species-id";\nimport { AbilityId } from "#enums/ability-id";');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched encounter-phase.ts');
