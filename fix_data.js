const fs = require('fs');
const path = 'src/data/mockData.js';

try {
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split(/\r?\n/);

    if (lines.length < 2000) {
        console.error('File appears too short, aborting to prevent damage.');
        process.exit(1);
    }

    // Lines 1595 to 1806 (1-based) corresponds to indices 1594 to 1805 (0-based)
    const startLine = 1595;
    const endLine = 1806;
    const startIndex = startLine - 1;
    const deleteCount = endLine - startLine + 1;

    console.log(`Deleting ${deleteCount} lines starting from line ${startLine}`);
    console.log(`Line ${startLine}: ${lines[startIndex].substring(0, 20)}...`);
    console.log(`Line ${endLine}: ${lines[startIndex + deleteCount - 1].substring(0, 20)}...`);

    lines.splice(startIndex, deleteCount);

    const newContent = lines.join('\n');
    fs.writeFileSync(path, newContent, 'utf8');
    console.log('File updated successfully.');
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
