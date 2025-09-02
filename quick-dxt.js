#!/usr/bin/env node

// Quick DXT creation script with corrected manifest
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

async function createDXT() {
  console.log('🚆 Creating corrected DXT package...');
  
  // Read current version
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  
  // Bump patch version
  const versionParts = currentVersion.split('.').map(Number);
  versionParts[2] += 1;
  const newVersion = versionParts.join('.');
  
  console.log(`📋 Bumping version: ${currentVersion} → ${newVersion}`);
  
  // Update package.json
  packageJson.version = newVersion;
  await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  
  // Update manifest.json
  const manifest = JSON.parse(await fs.readFile('manifest.json', 'utf8'));
  manifest.version = newVersion;
  await fs.writeFile('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  
  const dxtFilename = `deutschbahn-navigator-${newVersion}.dxt`;
  
  // Create DXT archive
  const output = createWriteStream(dxtFilename);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    console.log(`✅ DXT package created: ${dxtFilename}`);
    console.log(`📦 Package size: ${archive.pointer()} bytes`);
    console.log('\n🚀 Test installation:');
    console.log(`   Double-click: ${dxtFilename}`);
  });
  
  archive.on('error', (err) => {
    throw err;
  });
  
  archive.pipe(output);
  
  // Add files to the archive
  console.log('📄 Adding manifest.json...');
  archive.file('manifest.json', { name: 'manifest.json' });
  
  console.log('📄 Adding package.json...');
  archive.file('package.json', { name: 'package.json' });
  
  console.log('📂 Adding dist/ directory...');
  archive.directory('dist/', 'dist/');
  
  console.log('📚 Adding documentation...');
  archive.file('README.md', { name: 'README.md' });
  archive.file('SETUP.md', { name: 'SETUP.md' });
  archive.file('PROJECT_SUMMARY.md', { name: 'PROJECT_SUMMARY.md' });
  
  console.log('⚙️ Adding configuration...');
  archive.file('.env.example', { name: '.env.example' });
  
  console.log('⚖️ Adding LICENSE...');
  archive.file('LICENSE', { name: 'LICENSE' });
  
  console.log('🔄 Finalizing package...');
  await archive.finalize();
}

createDXT().catch(console.error);
