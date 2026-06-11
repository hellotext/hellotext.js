# Packaging

This document explains the package layout and compatibility decisions made while implementing issue #51.

## Goals

- Keep the public browser pixel stable for current production users.
- Fix ESM and CommonJS package resolution.
- Preserve CDN, GTM, and script-tag compatibility.
- Keep Node/SSR usage available through the vanilla entrypoint.
- Verify the packed npm artifact before publishing.

## Public Entrypoints

Supported public imports are:

```js
import Hellotext from '@hellotext/hellotext'
import Hellotext from '@hellotext/hellotext/vanilla'
import '@hellotext/hellotext/styles/index.css'
```

The package also exposes:

```js
require('@hellotext/hellotext/package.json')
```

Internal paths under `src` or `lib` are not public API. They may remain in the package for compatibility and debugging, but consumers should not rely on them.

## Root Browser Entry

`@hellotext/hellotext` is the browser-oriented entrypoint.

It intentionally:

- Starts Stimulus controllers.
- Registers Hellotext form, webchat, emoji, and message controllers.
- Assigns `window.Hellotext`.

This behavior is preserved because the primary use case is dropping Hellotext.js into a browser environment and having everything set up automatically.

## Vanilla Entry

`@hellotext/hellotext/vanilla` is the Node, SSR, test, and sandbox-safe entrypoint.

It imports the core Hellotext class without starting browser integrations or touching `window` at import time. This path is kept for environments such as Shopify Pixel sandboxes and other non-browser runtimes.

## Build Output

The package now separates ESM and CommonJS outputs:

```text
lib/
  esm/
    package.json
    index.js
    vanilla.js
    ...
  cjs/
    index.cjs
    vanilla.cjs
    ...
dist/
  hellotext.js
  hellotext.umd.js
styles/
  index.css
index.d.ts
```

`lib/esm/package.json` declares `"type": "module"`, allowing ESM `.js` files to load correctly without changing the package-level module type.

Generated ESM imports use explicit file extensions, for example:

```js
import Hellotext from './hellotext.js'
import { Configuration } from './core/index.js'
```

Generated CommonJS requires use explicit `.cjs` paths, for example:

```js
require('./hellotext.cjs')
require('./core/index.cjs')
```

This avoids ambiguous resolution when `.js` and `.cjs` builds exist in the package.

## UMD Artifacts

The explicit UMD artifact is:

```text
dist/hellotext.umd.js
```

The legacy CDN/GTM/script-tag artifact remains:

```text
dist/hellotext.js
```

`dist/hellotext.js` is a compatibility alias of `dist/hellotext.umd.js`. Package metadata continues to point to `dist/hellotext.js` to avoid breaking existing integrations.

Current metadata intentionally remains:

```json
{
  "browser": "./dist/hellotext.js",
  "unpkg": "./dist/hellotext.js"
}
```

The release smoke test verifies both UMD files exist, are non-empty, and are identical.

## Exports Map

The package exports are intentionally limited to documented public paths:

```json
{
  ".": {
    "types": "./index.d.ts",
    "browser": "./dist/hellotext.js",
    "import": "./lib/esm/index.js",
    "require": "./lib/cjs/index.cjs",
    "default": "./dist/hellotext.js"
  },
  "./vanilla": {
    "types": "./index.d.ts",
    "import": "./lib/esm/vanilla.js",
    "require": "./lib/cjs/vanilla.cjs"
  },
  "./styles/index.css": "./styles/index.css",
  "./package.json": "./package.json"
}
```

The broad `./styles/*` export is currently preserved for compatibility, but `./styles/index.css` is the documented CSS entrypoint.

## CSS Side Effects

CSS is side-effectful and must not be tree-shaken away. The root browser entries are also side-effectful because they start browser integrations.

The `sideEffects` field includes CSS, browser root entries, and the UMD bundle.

## Node Support

The supported Node floor is Node 20:

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

CI verifies Node 20 and Node 22.

## Release Verification

Publishing is guarded by:

```sh
npm run release:check
```

This runs:

- Unit tests.
- Clean build.
- Packed-package smoke tests.

The smoke test creates the npm tarball, installs it into temporary consumer projects, and verifies:

- `import '@hellotext/hellotext/vanilla'`
- `require('@hellotext/hellotext/vanilla')`
- `require('@hellotext/hellotext/package.json')`
- Bundling the root browser entry with `@hellotext/hellotext/styles/index.css`
- `dist/hellotext.js`
- `dist/hellotext.umd.js`
- UMD alias consistency

## Deferred Work

The following were intentionally left for future changes:

- Add source maps for `lib` and UMD bundles.
- Decide whether `dist/hellotext.js` should remain forever or become a documented legacy alias in a future major release.
- Revisit whether `src` should remain in the published package.
- Align Babel targets with the Node 20 support floor.
- Modernize ESM output for smaller bundles.
- Add stricter TypeScript declaration tests if TypeScript becomes part of CI.
