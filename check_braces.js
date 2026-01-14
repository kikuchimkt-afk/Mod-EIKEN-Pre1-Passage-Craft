import fs from 'fs';
const content = fs.readFileSync('src/data/mockData.js', 'utf8');
let open = 0;
let close = 0;
let inString = false;
let inTemplate = false;
let stringChar = '';

for (let i = 0; i < content.length; i++) {
    const char = content[i];

    // Handle escaping (naive)
    if (i > 0 && content[i - 1] === '\\') continue;

    if (inString) {
        if (char === stringChar) inString = false;
        continue;
    }

    if (inTemplate) {
        if (char === '`') inTemplate = false;
        // Braces in template allowed, but we assume mockData structure uses braces ONLY for objects
        // Actually template literals might contain ${}.
        if (char === '$' && content[i + 1] === '{') {
            // This starts interpolation. 
            // We need to track depth. Complexity increases. 
        }
        continue;
    }

    if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
        continue;
    }

    if (char === '`') {
        inTemplate = true;
        continue;
    }

    if (char === '{') open++;
    if (char === '}') close++;
}

console.log(`Open: ${open}, Close: ${close}`);
console.log(`Diff: ${open - close}`);
