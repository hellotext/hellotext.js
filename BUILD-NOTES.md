# Hellotext.js Build Configuration

## Overview

Hellotext.js is a browser-only library that provides multiple build formats for maximum compatibility.

## Build Outputs

### 1. ES Modules (lib/\*.js)

- **For**: Modern bundlers (Vite, Webpack 5, Rollup, Parcel, esbuild)
- **Format**: Native ES modules with `import`/`export`
- **Benefits**: Tree-shaking, smaller bundles, faster builds

### 2. CommonJS (lib/\*.cjs)

- **For**: Node.js environments, SSR frameworks (Next.js, Nuxt), older bundlers
- **Format**: CommonJS with `require`/`module.exports`
- **Benefits**: Compatibility with Node-based tools and SSR

### 3. UMD Bundle (dist/hellotext.js)

- **For**: Script tags, CDNs, legacy environments
- **Format**: Universal Module Definition, creates `window.Hellotext`
- **Benefits**: Works everywhere, no build step required

## Why Include CommonJS for a Browser Library?b

Even though this library only runs in browsers, CommonJS is included for:

1. **SSR Frameworks**: Next.js, Nuxt, etc. import modules server-side first
2. **Build Tools**: Many tools still expect CommonJS
3. **Testing**: Jest and other test runners use Node.js
4. **Backward Compatibility**: Existing users might use `require()`

## Key Decisions

### Module Resolution

```json
{
  "main": "lib/index.cjs", // Fallback for old tools
  "module": "lib/index.js", // For modern bundlers
  "browser": "dist/hellotext.js", // For browsers
  "exports": {
    // Modern resolution
    "import": "./lib/index.js",
    "require": "./lib/index.cjs"
  }
}
```

### Private Fields

Using Babel's "loose" mode for smaller output and better performance, but this requires careful handling of circular dependencies.

### Fixed Issues

1. **Circular dependency** between Session and Query models (fixed by direct imports)
2. **ESM/CommonJS mismatch** causing Vite errors (fixed by proper dual packaging)

## Build Commands

```bash
npm run build    # Build all formats
npm test         # Run tests
npm publish      # Tests + builds automatically via prepublishOnly
```

## Version History

- v1.8.6: Added new models (introduced circular dependency)
- v1.8.7: Initial attempt to fix
- v1.8.8: Fixed circular dependencies and added proper ESM support
