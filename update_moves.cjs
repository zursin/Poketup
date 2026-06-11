const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'locales', 'es-ES', 'move.json'),
  path.join(__dirname, 'locales', 'es-419', 'move.json')
];

const nameUpdates = {
  "tackle": "Luchar entre sí",
  "flamethrower": "Confianza",
  "thunderbolt": "Diversidad",
  "psychic": "Comunicación Abierta",
  "surf": "Integración",
  "leafBlade": "Propósito Compartido",
  "shadowBall": "Responsabilidad",
  "darkPulse": "Resolución de Conflictos",
  "iceBeam": "Liderazgo",
  "waterGun": "Trabajo Individual",
  "peck": "Desconfianza",
  "gust": "Dependencia"
};

for (const file of files) {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const moveId in nameUpdates) {
      if (!data[moveId]) {
        data[moveId] = {};
      }
      data[moveId].name = nameUpdates[moveId];
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.warn(`File not found: ${file}`);
  }
}
