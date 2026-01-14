import fs from 'fs';
const content = fs.readFileSync('src/data/mockData.js', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('": {')) {
        console.log(`${i + 1}: ${line.trim()}`);
    }
}
