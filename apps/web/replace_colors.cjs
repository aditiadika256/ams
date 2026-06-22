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

const replaceMap = [
  // Primary gradients
  {
    regex: /bg-linear-to-r from-(blue|purple|orange)-[56]00 to-(cyan|pink|red)-[56]00 hover:from-[a-z]+-[67]00 hover:to-[a-z]+-[67]00/g,
    replace: 'bg-primary hover:bg-primary/90 text-primary-foreground'
  },
  {
    regex: /bg-linear-to-r from-(blue|purple|orange)-[56]00 to-(cyan|pink|red)-[56]00/g,
    replace: 'bg-primary text-primary-foreground'
  },
  // Subdued backgrounds
  {
    regex: /bg-linear-to-br from-[a-z]+-500\/5 to-[a-z]+-500\/5/g,
    replace: 'bg-primary/5'
  },
  {
    regex: /bg-linear-to-br from-[a-z]+-500\/20 to-[a-z]+-500\/20/g,
    replace: 'bg-primary/10'
  },
  // Text colors
  {
    regex: /text-(purple|blue|indigo|orange|cyan)-([4567]00)/g,
    replace: 'text-primary'
  },
  {
    regex: /text-(purple|blue|indigo|orange|cyan)-100/g,
    replace: 'text-primary-foreground'
  },
  {
    regex: /text-(purple|blue|indigo|orange|cyan)-300/g,
    replace: 'text-primary/80'
  },
  // Background colors
  {
    regex: /bg-(purple|blue|indigo|orange|cyan)-100/g,
    replace: 'bg-primary/10'
  },
  {
    regex: /bg-(purple|blue|indigo|orange|cyan)-([456]00)\/20/g,
    replace: 'bg-primary/20'
  },
  {
    regex: /bg-(purple|blue|indigo|orange|cyan)-([456]00)\/30/g,
    replace: 'bg-primary/30'
  },
  {
    regex: /bg-(purple|blue|indigo|orange|cyan)-([456]00)\/40/g,
    replace: 'bg-primary/40'
  },
  {
    regex: /bg-(purple|blue|indigo|orange|cyan)-([456]00)\/50/g,
    replace: 'bg-primary/50'
  },
  {
    regex: /bg-(purple|blue|indigo|orange|cyan)-500/g,
    replace: 'bg-primary'
  },
  // Borders
  {
    regex: /border-(purple|blue|indigo|orange|cyan)-300/g,
    replace: 'border-primary/30'
  },
  {
    regex: /border-(purple|blue|indigo|orange|cyan)-500\/30/g,
    replace: 'border-primary/30'
  },
  {
    regex: /border-(purple|blue|indigo|orange|cyan)-500\/50/g,
    replace: 'border-primary/50'
  },
  {
    regex: /border-(purple|blue|indigo|orange|cyan)-500\/20/g,
    replace: 'border-primary/20'
  },
  {
    regex: /border-(purple|blue|indigo|orange|cyan)-500/g,
    replace: 'border-primary'
  },
  // Accents / Rings
  {
    regex: /accent-(purple|blue|indigo|orange|cyan)-500/g,
    replace: 'accent-primary'
  },
  {
    regex: /focus:border-(purple|blue|indigo|orange|cyan)-500\/50/g,
    replace: 'focus:border-primary/50'
  },
];

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  replaceMap.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated: ${path.relative(targetDir, file)}`);
  }
});

console.log(`Total files updated: ${changedFiles}`);
