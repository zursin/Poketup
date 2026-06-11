/**
 * patch_encounter_4waves.cjs
 * Applies the 4-wave TUP quiz logic cleanly to encounter-phase.ts
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'phases', 'encounter-phase.ts');
let src = fs.readFileSync(filePath, 'utf8');

// ── 1. Add imports after the last existing import ────────────────────────────
const IMPORT_ANCHOR = `import { randSeedInt, randSeedItem } from "#utils/common";`;
const IMPORT_ADD = `import { randSeedInt, randSeedItem } from "#utils/common";
import { AbilityId } from "#enums/ability-id";
import { MoveId } from "#enums/move-id";
import { PokemonMove } from "#moves/pokemon-move";
import { getPokemonSpecies } from "#utils/pokemon-utils";`;
src = src.replace(IMPORT_ANCHOR, IMPORT_ADD);

// ── 2. Player moveset setup at wave 1 ────────────────────────────────────────
const TOTAL_BST_ANCHOR = `    let totalBst = 0;

    battle.enemyLevels?.every`;
const TOTAL_BST_NEW = `    let totalBst = 0;

    // TUP: Wave 1 → give Incineroar the 4 quiz-answer moves
    if (globalScene.gameMode.isClassic && battle.waveIndex === 1) {
      for (const p of globalScene.getPlayerParty()) {
        if (p.species.speciesId === SpeciesId.INCINEROAR) {
          p.moveset = [
            new PokemonMove(MoveId.FLAMETHROWER, 0, 0, 15), // ✅ W1 Diversidad  (Fire   > Exeggcute Grass)
            new PokemonMove(MoveId.SURF,          0, 0, 15), // ✅ W2 Integración (Water  > Incineroar Fire)
            new PokemonMove(MoveId.THUNDERBOLT,   0, 0, 15), // ✅ W3 Confianza   (Elec   > Pidgeot Flying)
            new PokemonMove(MoveId.CROSS_CHOP,    0, 0, 15), // ✅ W4 Luchar entre sí (Fight > Snorlax Normal)
          ];
          p.level = 10;
          p.hp = p.getMaxHp();
        }
      }
    }

    battle.enemyLevels?.every`;
src = src.replace(TOTAL_BST_ANCHOR, TOTAL_BST_NEW);

// ── 3. Force enemy species for waves 1-4 ─────────────────────────────────────
const ENEMY_SPECIES_ANCHOR = `          let enemySpecies = globalScene.randomSpecies(battle.waveIndex, level, true);
          // If player has golden bug net, rolls 10% chance to replace non-boss wave wild species from the golden bug net bug pool
          if (`;
const ENEMY_SPECIES_NEW = `          let enemySpecies = globalScene.randomSpecies(battle.waveIndex, level, true);
          let enemyLevel = level;
          // TUP: Force quiz boss for waves 1-4 (classic mode)
          if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 4) {
            enemyLevel = 10;
            switch (battle.waveIndex) {
              case 1: enemySpecies = getPokemonSpecies(SpeciesId.EXEGGCUTE);  break; // Grass/Psyc → Fire
              case 2: enemySpecies = getPokemonSpecies(SpeciesId.INCINEROAR); break; // Fire/Dark  → Water
              case 3: enemySpecies = getPokemonSpecies(SpeciesId.PIDGEOT);    break; // Nor/Flying → Electric
              case 4: enemySpecies = getPokemonSpecies(SpeciesId.SNORLAX);    break; // Normal     → Fighting
            }
          }
          // If player has golden bug net, rolls 10% chance to replace non-boss wave wild species from the golden bug net bug pool
          if (!(globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 4) && (`;
src = src.replace(ENEMY_SPECIES_ANCHOR, ENEMY_SPECIES_NEW);

// Fix the golden bug net closing: need to add extra closing paren
src = src.replace(
  `          if (!(globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 4) && (
            globalScene.findModifier(m => m instanceof BoostBugSpawnModifier)
            && !globalScene.gameMode.isBoss(battle.waveIndex)
            && globalScene.arena.biomeId !== BiomeId.END
            && randSeedInt(10) === 0
          ) {
            enemySpecies = getGoldenBugNetSpecies(level);
          }
          battle.enemyParty[e] = globalScene.addEnemyPokemon(
            enemySpecies,
            level,`,
  `          if (!(globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 4) && (
            globalScene.findModifier(m => m instanceof BoostBugSpawnModifier)
            && !globalScene.gameMode.isBoss(battle.waveIndex)
            && globalScene.arena.biomeId !== BiomeId.END
            && randSeedInt(10) === 0
          )) {
            enemySpecies = getGoldenBugNetSpecies(level);
          }
          battle.enemyParty[e] = globalScene.addEnemyPokemon(
            enemySpecies,
            enemyLevel,`
);

// ── 4. Wonder Guard + only Tackle for TUP bosses ─────────────────────────────
const FIELD_SETUP_ANCHOR = `      if (e < (battle.double ? 2 : 1)) {
        enemyPokemon.setX(-66 + enemyPokemon.getFieldPositionOffset()[0]);
        enemyPokemon.fieldSetup(true);
      }

      if (!this.loaded) {`;
const FIELD_SETUP_NEW = `      if (e < (battle.double ? 2 : 1)) {
        enemyPokemon.setX(-66 + enemyPokemon.getFieldPositionOffset()[0]);
        enemyPokemon.fieldSetup(true);
      }

      // TUP: Wonder Guard + only Tackle for quiz bosses waves 1-4
      if (globalScene.gameMode.isClassic && battle.waveIndex >= 1 && battle.waveIndex <= 4) {
        enemyPokemon.summonData.ability = AbilityId.WONDER_GUARD;
        enemyPokemon.moveset = [new PokemonMove(MoveId.TACKLE, 0, 0, 35)];
      }

      if (!this.loaded) {`;
src = src.replace(FIELD_SETUP_ANCHOR, FIELD_SETUP_NEW);

// ── 5. Quiz question dialogs (WILD branch of doEncounterCommon) ──────────────
const WILD_MSG_ANCHOR = `      globalScene.updateFieldScale();
      if (showEncounterMessage) {
        globalScene.ui.showText(this.getEncounterMessage(), null, () => this.end(), 1500);
      } else {
        this.end();
      }
    } else if (globalScene.currentBattle.battleType === BattleType.TRAINER) {`;
const WILD_MSG_NEW = `      globalScene.updateFieldScale();
      if (globalScene.gameMode.isClassic && globalScene.currentBattle.waveIndex >= 1 && globalScene.currentBattle.waveIndex <= 4) {
        // TUP: Show quiz question before the battle
        const wave = globalScene.currentBattle.waveIndex;
        const waveQuestions: Record<number, { q: string; hint: string }> = {
          1: {
            q: "¡Exeggcute aparece!\\n¿Qué pilar aprovecha las habilidades\\ndiferentes de cada integrante del equipo?",
            hint: "Elige el ataque con la respuesta correcta.",
          },
          2: {
            q: "¡Incineroar aparece!\\n¿Qué elemento ensambla las diferencias\\nindividuales como piezas de un rompecabezas?",
            hint: "Elige el ataque con la respuesta correcta.",
          },
          3: {
            q: "¡Pidgeot aparece!\\n¿Qué es indispensable para que el equipo\\ncumpla sus tareas sin depender de otros?",
            hint: "Elige el ataque con la respuesta correcta.",
          },
          4: {
            q: "¡Snorlax bloquea el camino!\\n¿Qué actitud destruye la sinergia y\\ndebe ser eliminada del equipo?",
            hint: "Derrota este obstáculo con el ataque correcto.",
          },
        };
        const wq = waveQuestions[wave];
        if (wq) {
          const startBattle = () => this.end();
          const showHint = () => globalScene.ui.showText(wq.hint, null, startBattle, 0, true);
          globalScene.ui.showText(wq.q, null, showHint, 0, true);
        } else {
          this.end();
        }
      } else if (showEncounterMessage) {
        globalScene.ui.showText(this.getEncounterMessage(), null, () => this.end(), 1500);
      } else {
        this.end();
      }
    } else if (globalScene.currentBattle.battleType === BattleType.TRAINER) {`;
src = src.replace(WILD_MSG_ANCHOR, WILD_MSG_NEW);

fs.writeFileSync(filePath, src, 'utf8');
console.log('Done. encounter-phase.ts patched with 4-wave TUP quiz logic.');
