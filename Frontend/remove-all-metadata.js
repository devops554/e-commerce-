const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

let fixedCount = 0;
let skippedCount = 0;

console.log('Starting metadata cleanup in src/app...');

walk(srcDir, (filePath) => {
  const fileName = path.basename(filePath);
  
  // Skip layout.tsx and not-found.tsx
  if (fileName === 'layout.tsx' || fileName === 'not-found.tsx') {
    return;
  }

  // Only process page.tsx
  if (fileName !== 'page.tsx') {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const hasUseClient = content.includes('"use client"') || content.includes("'use client'");
  const hasMetadata = content.includes('export const metadata') || content.includes('export async function generateMetadata');

  if (hasUseClient && hasMetadata) {
    let newContent = content;

    // 1. Remove metadata imports from 'next'
    newContent = newContent.replace(/^import type\s*{\s*Metadata\s*}\s*from\s*["']next["'];?\r?\n?/gm, '');

    // 2. Remove any imports from '@/seo'
    newContent = newContent.replace(/^import\s*{[^}]*}\s*from\s*["']@\/seo["'];?\r?\n?/gm, '');

    // 3. Remove export const metadata (supports single and multiline until semi-colon or next export)
    // This regex looks for 'export const metadata' and greedily consumes until the next ';' followed by whitespace/newline
    newContent = newContent.replace(/export const metadata: Metadata\s*=\s*[\s\S]*?;(?:\r?\n|$)/g, '');
    newContent = newContent.replace(/export const metadata\s*=\s*[\s\S]*?;(?:\r?\n|$)/g, '');

    // 4. Remove export async function generateMetadata() { ... }
    // We handle the function block by matching open and close braces (simplified)
    newContent = newContent.replace(/export async function generateMetadata[\s\S]*?\([\s\S]*?\)\s*:\s*Promise<Metadata>\s*{[\s\S]*?}\r?\n?/g, '');
    newContent = newContent.replace(/export async function generateMetadata[\s\S]*?\([\s\S]*?\)\s*{[\s\S]*?}\r?\n?/g, '');

    // 5. Ensure "use client" is at the very top
    const useClientRegex = /^["']use client["'];?\r?\n?/m;
    if (useClientRegex.test(newContent)) {
      newContent = newContent.replace(useClientRegex, '');
      newContent = '"use client";\n\n' + newContent.trimStart();
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed: ${filePath}`);
    fixedCount++;
  } else {
    skippedCount++;
  }
});

console.log(`\nSummary: fixed ${fixedCount} files, skipped ${skippedCount} files`);
