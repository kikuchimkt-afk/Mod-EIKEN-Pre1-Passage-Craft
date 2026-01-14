import fs from 'fs';
const content = fs.readFileSync('src/data/mockData.js', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('{') || line.includes('}')) {
        // Naive check: ignore content strings
        // If line has BOTH { and } and starts with " { en:", it's a translation line. Skip it.
        if (line.trim().startsWith('{ en:') && line.trim().endsWith('},')) continue;

        // Skip lines with only HTML tags if they contain braces? 
        // HTML tags <h3 style="..."> contain { if I use style={{ }}? 
        // No, the file uses style="...".

        // Skip template literal internals? 
        // If line starts with "Wait" and has no brace, skip.

        console.log(`${i + 1}: ${line}`);
    }
}
