const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Boss configuration for waves 1-8
const randomSpeciesStr = `          let enemySpecies = globalScene.randomSpecies(battle.waveIndex, level, true);
          let enemyLevel = level;`;

const randomSpeciesRepl = `          let enemySpecies = globalScene.randomSpecies(battle.waveIndex, level, true);
          let enemyLevel = level;
          if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 8) {
            enemyLevel = 10;
            switch (battle.waveIndex) {
              case 1: enemySpecies = globalScene.gameData.speciesData[SpeciesId.EXEGGCUTE]; break;
              case 2: enemySpecies = globalScene.gameData.speciesData[SpeciesId.SLOWBRO]; break;
              case 3: enemySpecies = globalScene.gameData.speciesData[SpeciesId.MACHAMP]; break;
              case 4: enemySpecies = globalScene.gameData.speciesData[SpeciesId.ALAKAZAM]; break;
              case 5: enemySpecies = globalScene.gameData.speciesData[SpeciesId.BLISSEY]; break;
              case 6: enemySpecies = globalScene.gameData.speciesData[SpeciesId.GENGAR]; break;
              case 7: enemySpecies = globalScene.gameData.speciesData[SpeciesId.SNORLAX]; break;
              case 8: enemySpecies = globalScene.gameData.speciesData[SpeciesId.DRAGONITE]; break;
            }
          }`;
content = content.replace(randomSpeciesStr, randomSpeciesRepl);

// 2. Add Wonder Guard and basic moveset to enemyPokemon
const enemySetupStr = `        enemyPokemon.fieldSetup(true);
      }`;
const enemySetupRepl = `        enemyPokemon.fieldSetup(true);
      }
      if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 8) {
        enemyPokemon.summonData.ability = AbilityId.WONDER_GUARD;
        enemyPokemon.moveset = [new PokemonMove(MoveId.DRAGON_RAGE, 0, 0, 35)];
      }`;
content = content.replace(enemySetupStr, enemySetupRepl);

// 3. Inject dialogs, player movesets, and logic inside start()
const doTrainerSummonStr = `        } else {
          doTrainerSummon();
        }`;
const waveLogic = `        } else {
          if (globalScene.gameMode.isClassic) {
            const wave = globalScene.currentBattle.waveIndex;
            const playerParty = globalScene.getPlayerParty();

            if (wave === 1) {
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

            if (wave === 9) {
              (globalScene as any).correctMoveForWave = undefined;
              const playTime = getPlayTimeString(globalScene.sessionPlayTime || 0);
              const showDialog2 = () => globalScene.ui.showText(\`Completaste el recorrido en: \${playTime}.\\n¡Felicidades!\`, null, () => { globalScene.phaseManager.unshiftNew("GameOverPhase", true); this.end(); }, 0, true);
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

          doTrainerSummon();
        }`;
content = content.replace(doTrainerSummonStr, waveLogic);

// 4. Add import for getPlayTimeString
if (!content.includes('getPlayTimeString')) {
    const importCommon = `import { getPlayTimeString } from "#utils/common";`;
    content = content.replace(`import { getPokemonNameWithAffix } from "#utils/pokemon";`, `import { getPokemonNameWithAffix } from "#utils/pokemon";\n${importCommon}`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched encounter-phase.ts cleanly');
