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

    // Replace <Button ... disabled={processing} ...>
    // with <Button ... isLoading={processing} ...>
    content = content.replace(/<Button([^>]*)disabled=\{processing\}([^>]*)>/g, '<Button$1isLoading={processing}$2>');
    
    // Replace <Button ... disabled={processing || ...} ...>
    // Note: It's harder with regex to match arbitrary JS inside disabled, we can replace disabled={processing || something} with isLoading={processing} disabled={something} if we want, but let's just use isLoading={processing} disabled={processing || something} and the Button component already does disabled={isLoading || disabled}.
    content = content.replace(/<Button([^>]*)disabled=\{(processing[^}]*)\}([^>]*)>/g, '<Button$1isLoading={processing} disabled={$2}$3>');

    // Remove {processing && <Spinner />}
    content = content.replace(/\{processing\s*&&\s*<Spinner\s*\/?>(?:\s*\}|)/g, '');

    // Remove {processing ? 'Memproses...' : 'Text'}
    // It's a bit complex, let's keep the text, just the Button will show spinner + text.

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files.`);
