#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

async function packageDxt() {
  try {
    console.log('📦 Creating .dxt package...');
    
    // Read package.json and manifest.json
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const manifestJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
    
    const name = manifestJson.name || packageJson.name.split('/').pop();
    const version = manifestJson.version || packageJson.version;
    const outputName = `${name}-${version}.dxt`;
    const outputPath = path.join(rootDir, 'dist', outputName);
    
    // Ensure dist directory exists
    if (!fs.existsSync(path.join(rootDir, 'dist'))) {
      fs.mkdirSync(path.join(rootDir, 'dist'), { recursive: true });
    }
    
    // Create temporary directory for packaging
    const tempDir = path.join(rootDir, '.temp-dxt');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Copy required files to temp directory
    const filesToCopy = [
      'manifest.json',
      'package.json',
      'dist/index.js',
      'dist/index.d.ts',
      'dist/index.js.map',
      'README.md',
      'LICENSE'
    ];
    
    for (const file of filesToCopy) {
      const srcPath = path.join(rootDir, file);
      const destPath = path.join(tempDir, file);
      
      if (fs.existsSync(srcPath)) {
        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ Copied ${file}`);
      } else {
        console.warn(`⚠️  File not found: ${file}`);
      }
    }
    
    // Create the .dxt file (ZIP format)
    process.chdir(tempDir);
    execSync(`zip -r "${outputPath}" .`, { stdio: 'inherit' });
    
    // Clean up temp directory
    process.chdir(rootDir);
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    console.log(`✅ Created ${outputName} in dist/`);
    
    // Get file size
    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`📊 Package size: ${sizeKB} KB`);
    
  } catch (error) {
    console.error('❌ Failed to create .dxt package:', error.message);
    process.exit(1);
  }
}

packageDxt();
