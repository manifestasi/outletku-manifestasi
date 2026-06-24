const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('resources/js/pages');

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/<Button([^>]*)disabled=\{processing\}([^>]*)>/g, '<Button$1isLoading={processing}$2>');
    content = content.replace(/<Button([^>]*)disabled=\{(processing[^}]*)\}([^>]*)>/g, '<Button$1isLoading={processing} disabled={$2}$3>');
    content = content.replace(/\{processing\s*&&\s*<Spinner\s*\/?>(?:\s*\}|)/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files.`);
