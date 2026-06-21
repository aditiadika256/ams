const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'components', 'admin', 'views');
const layoutFile = path.join(__dirname, 'src', 'components', 'admin', 'layout', 'AdminLayout.tsx');

const files = fs.readdirSync(viewsDir);

let layoutContent = fs.readFileSync(layoutFile, 'utf8');

files.forEach(file => {
  if (file.endsWith('View.tsx')) {
    const baseName = file.replace('View.tsx', '');
    const folderPath = path.join(viewsDir, baseName);
    const newFilePath = path.join(folderPath, 'view.tsx');

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const oldFilePath = path.join(viewsDir, file);
    fs.renameSync(oldFilePath, newFilePath);
    console.log(`Moved ${file} to ${baseName}/view.tsx`);

    // Update AdminLayout.tsx import
    const regex = new RegExp(`from '\\.\\./views/${baseName}View';`, 'g');
    layoutContent = layoutContent.replace(regex, `from '../views/${baseName}/view';`);
  }
});

fs.writeFileSync(layoutFile, layoutContent, 'utf8');
console.log('Updated AdminLayout.tsx imports.');
