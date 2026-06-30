/**
 * Script to generate Tauri icons from SVG
 * Run: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Required icon sizes for Tauri
const sizes = [
    { name: 'icon.png', size: 512 },
    { name: 'icon-32.png', size: 32 },
    { name: 'icon-128.png', size: 128 },
    { name: 'icon-128@2x.png', size: 256 }
];

const svgContent = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');

// For now, create placeholder files
// In production, use sharp or canvas to convert SVG to PNG
sizes.forEach(({ name, size }) => {
    const placeholderPath = path.join(__dirname, name);
    // Create a simple placeholder
    fs.writeFileSync(placeholderPath, Buffer.alloc(0));
    console.log(`Created placeholder: ${name}`);
});

console.log('\nNote: For production, convert icon.svg to PNG files using:');
console.log('  npm install sharp');
console.log('  Then run this script again with sharp implementation');
