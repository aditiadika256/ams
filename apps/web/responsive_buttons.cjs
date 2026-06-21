const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'components');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') {
        if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
          filelist.push(dirFile);
        }
      }
    }
  });
  return filelist;
};

const files = walkSync(targetDir);

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace text-white inside Button className when it already has text-primary-foreground
  content = content.replace(/(<Button[^>]*className="[^"]*)(text-primary-foreground)([^"]*)(text-white)([^"]*")/g, '$1$2$3$5');
  content = content.replace(/(<Button[^>]*className="[^"]*)(text-white)([^"]*)(text-primary-foreground)([^"]*")/g, '$1$3$4$5');
  
  // Make icons responsive and text hidden on small screens for common header action buttons
  // Match `<Plus className="mr-2 h-4 w-4" /> Add Something\n</Button>`
  // Or match any lucide-react icon like `<Plus `, `<Edit `, etc.
  content = content.replace(/(<(Plus|UserPlus|FilePlus|Edit|Trash2|Save|Search|RotateCcw) className=")(?:mr-2 )([^"]+)(" \/>)\s*([A-Za-z0-9\s]+?)\s*<\/Button>/g, 
    '$1$3 sm:mr-2$4 <span className="hidden sm:inline">$5</span></Button>');

  // Some instances might have `mr-2` at the end or somewhere else:
  content = content.replace(/(<(Plus|UserPlus|FilePlus|Edit|Trash2|Save|Search|RotateCcw) className=")([^"]+?)(?: mr-2)(" \/>)\s*([A-Za-z0-9\s]+?)\s*<\/Button>/g, 
    '$1$3 sm:mr-2$4 <span className="hidden sm:inline">$5</span></Button>');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated: ${path.relative(targetDir, file)}`);
  }
});

console.log(`Total files updated for responsive buttons: ${changedFiles}`);
