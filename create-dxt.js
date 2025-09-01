#!/usr/bin/env node

/**
 * DXT Packager for Deutschbahn Navigator
 * Creates a .dxt package file for Claude Desktop Extension distribution
 * 
 * Usage:
 *   npm run pack                    # Create package with current version
 *   npm run pack -- --patch        # Bump patch version (1.0.0 -> 1.0.1)
 *   npm run pack -- --minor        # Bump minor version (1.0.0 -> 1.1.0)
 *   npm run pack -- --major        # Bump major version (1.0.0 -> 2.0.0)
 *   npm run pack -- --timestamp    # Add timestamp to version
 */

import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

const PACKAGE_NAME = 'deutschbahn-navigator';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    major: args.includes('--major'),
    minor: args.includes('--minor'), 
    patch: args.includes('--patch'),
    timestamp: args.includes('--timestamp'),
    help: args.includes('--help') || args.includes('-h')
  };
}

// Show help information
function showHelp() {
  console.log(`
🚆 Deutschbahn Navigator DXT Packager

Usage:
  npm run pack                    # Create package with current version
  npm run pack -- --patch        # Bump patch version (1.0.0 -> 1.0.1)
  npm run pack -- --minor        # Bump minor version (1.0.0 -> 1.1.0)  
  npm run pack -- --major        # Bump major version (1.0.0 -> 2.0.0)
  npm run pack -- --timestamp    # Add timestamp to version
  npm run pack -- --help         # Show this help

Examples:
  npm run pack -- --minor --timestamp    # Bump minor + add timestamp
  npm run pack -- --patch               # Simple patch bump

The package will be created as: ${PACKAGE_NAME}-{version}.dxt
`);
}

// Get current version from package.json
async function getCurrentVersion() {
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    console.warn('⚠️ Could not read package.json, using default version 1.0.0');
    return '1.0.0';
  }
}

// Bump version according to semantic versioning
function bumpVersion(currentVersion, type) {
  // Extract base version (remove timestamp if present)
  const baseVersion = currentVersion.split('-')[0];
  const parts = baseVersion.split('.').map(Number);
  let [major, minor, patch] = parts;

  // Ensure we have valid numbers
  if (isNaN(major)) major = 1;
  if (isNaN(minor)) minor = 0;
  if (isNaN(patch)) patch = 0;

  switch (type) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      break;
    case 'patch':
      patch += 1;
      break;
    default:
      return currentVersion;
  }

  return `${major}.${minor}.${patch}`;
}

// Add timestamp to version
function addTimestamp(version) {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '')
    .replace('T', '-');
  
  return `${version}-${timestamp}`;
}

// Update version in package.json and manifest.json
async function updateVersionFiles(newVersion) {
  try {
    // Update package.json
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    packageJson.version = newVersion;
    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`📝 Updated package.json version to ${newVersion}`);

    // Update manifest.json
    const manifestJson = JSON.parse(await fs.readFile('manifest.json', 'utf8'));
    manifestJson.version = newVersion;
    await fs.writeFile('manifest.json', JSON.stringify(manifestJson, null, 2) + '\n');
    console.log(`📝 Updated manifest.json version to ${newVersion}`);

    return true;
  } catch (error) {
    console.error('❌ Error updating version files:', error.message);
    return false;
  }
}

// Determine new version based on arguments
async function determineVersion(args) {
  const currentVersion = await getCurrentVersion();
  console.log(`📋 Current version: ${currentVersion}`);

  let newVersion = currentVersion;

  // Apply version bump
  if (args.major) {
    newVersion = bumpVersion(newVersion, 'major');
    console.log(`⬆️ Bumped to major version: ${newVersion}`);
  } else if (args.minor) {
    newVersion = bumpVersion(newVersion, 'minor');
    console.log(`⬆️ Bumped to minor version: ${newVersion}`);
  } else if (args.patch) {
    newVersion = bumpVersion(newVersion, 'patch');
    console.log(`⬆️ Bumped to patch version: ${newVersion}`);
  }

  // Add timestamp if requested
  if (args.timestamp) {
    newVersion = addTimestamp(newVersion);
    console.log(`🕒 Added timestamp: ${newVersion}`);
  }

  return { currentVersion, newVersion };
}

async function createDxtPackage(version) {
  console.log(`🚆 Creating DXT package for Deutschbahn Navigator v${version}...`);
  
  const outputPath = `${PACKAGE_NAME}-${version}.dxt`;
  
  // Create output stream
  const output = createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Listen for archive events
  output.on('close', () => {
    console.log(`✅ DXT package created: ${outputPath}`);
    console.log(`📦 Package size: ${archive.pointer()} bytes`);
    console.log('');
    console.log('🚀 Installation instructions:');
    console.log('1. Double-click the .dxt file to install');
    console.log('2. Or copy to Claude Desktop extensions folder');
    console.log('3. Configure your DB_API_KEY in Claude Desktop settings');
  });

  output.on('end', () => {
    console.log('Data has been drained');
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('Warning:', err);
    } else {
      throw err;
    }
  });

  archive.on('error', (err) => {
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  try {
    // Add manifest.json (required for DXT)
    console.log('📄 Adding manifest.json...');
    const manifestPath = path.resolve('manifest.json');
    archive.file(manifestPath, { name: 'manifest.json' });

    // Add package.json
    console.log('📄 Adding package.json...');
    const packagePath = path.resolve('package.json');
    archive.file(packagePath, { name: 'package.json' });

    // Add compiled JavaScript files
    console.log('📂 Adding dist/ directory...');
    archive.directory('dist/', 'dist/');

    // Add documentation
    console.log('📚 Adding documentation...');
    const docs = ['README.md', 'SETUP.md', 'PROJECT_SUMMARY.md'];
    for (const doc of docs) {
      try {
        await fs.access(doc);
        archive.file(doc, { name: doc });
        console.log(`   ✓ ${doc}`);
      } catch (err) {
        console.log(`   ⚠ ${doc} not found, skipping`);
      }
    }

    // Add configuration templates
    console.log('⚙️ Adding configuration files...');
    const configs = ['.env.example'];
    for (const config of configs) {
      try {
        await fs.access(config);
        archive.file(config, { name: config });
        console.log(`   ✓ ${config}`);
      } catch (err) {
        console.log(`   ⚠ ${config} not found, skipping`);
      }
    }

    // Add license if it exists
    try {
      await fs.access('LICENSE');
      archive.file('LICENSE', { name: 'LICENSE' });
      console.log('⚖️ Adding LICENSE...');
    } catch (err) {
      console.log('⚠ LICENSE not found, skipping');
    }

    // Create installation script
    console.log('📜 Creating installation script...');
    const installScript = `#!/bin/bash
# Deutschbahn Navigator Installation Script

echo "🚆 Installing Deutschbahn Navigator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "❌ package.json not found"
    exit 1
fi

echo ""
echo "🎉 Deutschbahn Navigator installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Get your Deutsche Bahn API key from https://developers.deutschebahn.com/"
echo "2. Add this extension to your Claude Desktop configuration:"
echo ""
echo '{
  "mcpServers": {
    "deutschbahn-navigator": {
      "command": "node",
      "args": ["'$(pwd)'/dist/index.js"],
      "env": {
        "DB_API_KEY": "your_api_key_here"
      }
    }
  }
}'
echo ""
echo "3. Restart Claude Desktop"
echo "4. Ask Claude: 'Search for train stations in Berlin'"
`;

    archive.append(installScript, { name: 'install.sh' });

    // Create Windows installation script
    const installBat = `@echo off
REM Deutschbahn Navigator Installation Script for Windows

echo 🚆 Installing Deutschbahn Navigator...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install dependencies
if exist package.json (
    echo 📦 Installing dependencies...
    npm install --production
    if %errorlevel% equ 0 (
        echo ✅ Dependencies installed successfully
    ) else (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ❌ package.json not found
    pause
    exit /b 1
)

echo.
echo 🎉 Deutschbahn Navigator installed successfully!
echo.
echo 📋 Next steps:
echo 1. Get your Deutsche Bahn API key from https://developers.deutschebahn.com/
echo 2. Add this extension to your Claude Desktop configuration
echo 3. Restart Claude Desktop
echo 4. Ask Claude: "Search for train stations in Berlin"
echo.
pause
`;

    archive.append(installBat, { name: 'install.bat' });

    // Finalize the archive
    console.log('🔄 Finalizing package...');
    await archive.finalize();

  } catch (error) {
    console.error('❌ Error creating DXT package:', error);
    process.exit(1);
  }
}

// Check if dist directory exists
async function checkBuild() {
  try {
    await fs.access('dist');
    await fs.access('dist/index.js');
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  const args = parseArgs();
  
  // Show help if requested
  if (args.help) {
    showHelp();
    return;
  }

  console.log('🔍 Checking build status...');
  
  const buildExists = await checkBuild();
  if (!buildExists) {
    console.log('⚠️ Build not found. Running build first...');
    const { spawn } = await import('child_process');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true
    });

    buildProcess.on('close', async (code) => {
      if (code === 0) {
        console.log('✅ Build completed successfully');
        await packageWithVersion(args);
      } else {
        console.error('❌ Build failed');
        process.exit(1);
      }
    });
  } else {
    console.log('✅ Build found');
    await packageWithVersion(args);
  }
}

async function packageWithVersion(args) {
  try {
    // Determine version
    const { currentVersion, newVersion } = await determineVersion(args);
    
    // Update version files if version changed
    if (newVersion !== currentVersion) {
      const updated = await updateVersionFiles(newVersion);
      if (!updated) {
        console.error('❌ Failed to update version files');
        process.exit(1);
      }
    }

    // Create the package
    await createDxtPackage(newVersion);
    
    // Show completion summary
    console.log('\n🎉 Package created successfully!');
    console.log(`📋 Version: ${currentVersion} → ${newVersion}`);
    console.log(`📦 File: ${PACKAGE_NAME}-${newVersion}.dxt`);
    
    if (args.timestamp) {
      console.log('🕒 Build timestamp included in version');
    }
    
  } catch (error) {
    console.error('❌ Error during packaging:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
