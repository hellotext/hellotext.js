import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const mode = process.argv[2]

if (!['esm', 'cjs'].includes(mode)) {
  throw new Error('Usage: node scripts/prepare-build-output.mjs <esm|cjs>')
}

const outputRoot = path.join(root, 'lib', mode)
const extension = mode === 'esm' ? '.js' : '.cjs'
const fileExtension = mode === 'esm' ? '.js' : '.cjs'

async function walk(directory) {
  const entries = await readdir(directory)
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(directory, entry)
    const info = await stat(fullPath)

    if (info.isDirectory()) {
      files.push(...(await walk(fullPath)))
    } else if (fullPath.endsWith(fileExtension)) {
      files.push(fullPath)
    }
  }

  return files
}

async function resolveSpecifier(fromFile, specifier) {
  if (!specifier.startsWith('.')) return specifier
  if (path.extname(specifier)) return specifier

  const base = path.resolve(path.dirname(fromFile), specifier)
  const fileTarget = `${base}${extension}`
  const indexTarget = path.join(base, `index${extension}`)

  try {
    await stat(fileTarget)
    return `${specifier}${extension}`
  } catch {}

  try {
    await stat(indexTarget)
    return `${specifier}/index${extension}`
  } catch {}

  throw new Error(`Unable to resolve ${specifier} from ${path.relative(root, fromFile)}`)
}

async function rewriteFile(file) {
  let source = await readFile(file, 'utf8')

  if (mode === 'esm') {
    source = await replaceAsync(
      source,
      /(from\s+['"])(\.\.?\/[^'"]+)(['"])/g,
      async (_match, prefix, specifier, suffix) => `${prefix}${await resolveSpecifier(file, specifier)}${suffix}`,
    )

    source = await replaceAsync(
      source,
      /(import\s+['"])(\.\.?\/[^'"]+)(['"])/g,
      async (_match, prefix, specifier, suffix) => `${prefix}${await resolveSpecifier(file, specifier)}${suffix}`,
    )

    source = await replaceAsync(
      source,
      /(import\(['"])(\.\.?\/[^'"]+)(['"]\))/g,
      async (_match, prefix, specifier, suffix) => `${prefix}${await resolveSpecifier(file, specifier)}${suffix}`,
    )
  } else {
    source = await replaceAsync(
      source,
      /(require\(['"])(\.\.?\/[^'"]+)(['"]\))/g,
      async (_match, prefix, specifier, suffix) => `${prefix}${await resolveSpecifier(file, specifier)}${suffix}`,
    )
  }

  await writeFile(file, source)
}

async function replaceAsync(source, pattern, replacer) {
  const matches = [...source.matchAll(pattern)]
  const replacements = await Promise.all(matches.map((match) => replacer(...match)))
  let index = 0

  return source.replace(pattern, () => replacements[index++])
}

await mkdir(outputRoot, { recursive: true })

if (mode === 'esm') {
  await writeFile(path.join(outputRoot, 'package.json'), '{\n  "type": "module"\n}\n')
}

const files = await walk(outputRoot)
await Promise.all(files.map(rewriteFile))
