# 📦 Version Management Guide

## 🎯 Automatic Version Bumping

The Deutschbahn Navigator extension now includes intelligent version management that automatically handles semantic versioning and timestamps.

## 🚀 Quick Commands

### Basic Packaging
```bash
npm run pack              # Use current version
npm run pack:patch        # 1.0.0 → 1.0.1 (bug fixes)
npm run pack:minor        # 1.0.0 → 1.1.0 (new features)
npm run pack:major        # 1.0.0 → 2.0.0 (breaking changes)
npm run pack:timestamp    # Add build timestamp
```

### Advanced Usage
```bash
# Combine version bump with timestamp
npm run pack -- --minor --timestamp    # 1.0.0 → 1.1.0-20250901-150906
npm run pack -- --patch --timestamp    # 1.1.0 → 1.1.1-20250901-150906

# Show help
npm run pack -- --help
```

## 📋 Version Types

### 🔧 Patch Version (X.Y.Z → X.Y.Z+1)
**Use for**: Bug fixes, security patches, minor improvements
```bash
npm run pack:patch
```
**Example**: `1.0.0 → 1.0.1`

### ✨ Minor Version (X.Y.Z → X.Y+1.0) 
**Use for**: New features, API additions, backwards-compatible changes
```bash
npm run pack:minor
```
**Example**: `1.0.0 → 1.1.0`

### 🚀 Major Version (X.Y.Z → X+1.0.0)
**Use for**: Breaking changes, API modifications, major rewrites
```bash
npm run pack:major
```
**Example**: `1.0.0 → 2.0.0`

### 🕒 Timestamp Versions
**Use for**: Development builds, nightly releases, testing
```bash
npm run pack:timestamp
```
**Example**: `1.0.0 → 1.0.0-20250901-150906`

## 🔄 Automatic Updates

When you run a version command, the system automatically:

1. **Reads current version** from `package.json`
2. **Calculates new version** based on semantic versioning rules
3. **Updates both files**:
   - `package.json` → Node.js package version
   - `manifest.json` → DXT extension version
4. **Creates .dxt package** with new version number
5. **Shows summary** of version changes

## 📁 File Management

### Generated Files
Each version creates a new `.dxt` file:
```
deutschbahn-navigator-1.0.0.dxt                    # Original
deutschbahn-navigator-1.0.1.dxt                    # Patch bump
deutschbahn-navigator-1.1.0.dxt                    # Minor bump  
deutschbahn-navigator-1.0.1-20250901-150906.dxt    # Timestamp
```

### Version Tracking
- **package.json**: NPM package version (for dependencies)
- **manifest.json**: DXT extension version (for Claude Desktop)
- **File name**: Clear identification of package version

## 🎯 Best Practices

### Development Workflow
```bash
# During development
npm run pack:timestamp     # Create test builds

# Bug fixes
npm run pack:patch         # 1.0.0 → 1.0.1

# New features  
npm run pack:minor         # 1.0.0 → 1.1.0

# Breaking changes
npm run pack:major         # 1.0.0 → 2.0.0
```

### Release Strategy
1. **Development**: Use timestamps for daily builds
2. **Bug Fixes**: Use patch versions
3. **Features**: Use minor versions  
4. **Major Updates**: Use major versions

### Version History
Keep multiple versions for:
- **Rollback capability**: Previous stable versions
- **Testing**: Compare different builds
- **Distribution**: Different user groups

## 🛠️ Technical Details

### Timestamp Format
```
YYYYMMDD-HHMMSS
20250901-150906  # Sept 1, 2025 at 15:09:06
```

### Version Parsing
The system handles complex versions:
- `1.0.0` → Standard semantic version
- `1.0.1-20250901-150906` → Version with timestamp
- `2.0.0-beta.1` → Pre-release versions

### File Updates
Both configuration files are synchronized:
```json
// package.json
{
  "version": "1.1.0"
}

// manifest.json  
{
  "dxt_version": "1.0",
  "version": "1.1.0"
}
```

## 🎉 Benefits

### 🚀 **Faster Releases**
- One command creates versioned packages
- No manual version editing required
- Automatic file synchronization

### 📋 **Clear History**
- Semantic versioning for change types
- Timestamp builds for development tracking
- File names show exact versions

### 🔒 **Consistency**
- Both package.json and manifest.json updated
- No version mismatches between files
- Standard semantic versioning rules

### 🛡️ **Safety**
- Previous versions preserved
- Easy rollback capability
- Clear version progression

---

**🎯 Ready to create your next version!**

Choose the appropriate version type based on your changes, and the system will handle all the details automatically.

**🚆 Happy versioning with Deutschbahn Navigator! ✨**
