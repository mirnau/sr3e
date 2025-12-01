#!/usr/bin/env node

/**
 * Script to convert all Svelte files from JavaScript to TypeScript
 * Updates <script> tags to <script lang="ts">
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Find all .svelte files recursively
function findSvelteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, build, dist
      if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
        findSvelteFiles(filePath, fileList);
      }
    } else if (file.endsWith('.svelte')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Convert a single Svelte file
function convertSvelteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace <script> with <script lang="ts">
  // Handle variations: <script>, <script >, <script\n>
  const scriptRegex = /<script(\s*)>/g;
  if (scriptRegex.test(content)) {
    content = content.replace(scriptRegex, '<script$1 lang="ts">');
    modified = true;
  }

  // Also handle <script context="module"> -> <script context="module" lang="ts">
  const moduleRegex = /<script(\s+)context="module"(\s*)>/g;
  if (moduleRegex.test(content)) {
    content = content.replace(moduleRegex, '<script$1context="module"$2 lang="ts">');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

// Main execution
console.log('🔍 Finding all Svelte files...');
const svelteFiles = findSvelteFiles(projectRoot);
console.log(`📝 Found ${svelteFiles.length} Svelte files\n`);

let convertedCount = 0;
let skippedCount = 0;

svelteFiles.forEach(filePath => {
  const relativePath = path.relative(projectRoot, filePath);

  if (convertSvelteFile(filePath)) {
    console.log(`✅ Converted: ${relativePath}`);
    convertedCount++;
  } else {
    console.log(`⏭️  Skipped (already TS): ${relativePath}`);
    skippedCount++;
  }
});

console.log(`\n✨ Conversion complete!`);
console.log(`   Converted: ${convertedCount} files`);
console.log(`   Skipped: ${skippedCount} files`);
console.log(`   Total: ${svelteFiles.length} files`);
