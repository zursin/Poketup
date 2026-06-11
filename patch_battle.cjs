const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'battle-scene.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newBattleOld = `        // NB: Type assertion is fine as resolved should always be populated at this point
        this.currentBattle = new Battle(this.gameMode, resolved as NewBattleResolvedProps);`;

const newBattleNew = `        // NB: Type assertion is fine as resolved should always be populated at this point
        if (this.gameMode.isClassic) {
            (resolved as any).double = false;
        }
        this.currentBattle = new Battle(this.gameMode, resolved as NewBattleResolvedProps);`;

content = content.replace(newBattleOld, newBattleNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched battle-scene.ts');
