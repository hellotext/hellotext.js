import { copyFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const explicitUmdBundle = path.join(root, 'dist', 'hellotext.umd.js')
const legacyUmdBundle = path.join(root, 'dist', 'hellotext.js')

await stat(explicitUmdBundle)
await copyFile(explicitUmdBundle, legacyUmdBundle)
