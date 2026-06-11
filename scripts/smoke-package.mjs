import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify(execFileCallback)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function run(command, args, options = {}) {
  try {
    return await execFile(command, args, {
      cwd: options.cwd ?? root,
      env: { ...process.env, ...options.env },
      maxBuffer: 1024 * 1024 * 10,
    })
  } catch (error) {
    const details = [error.stdout, error.stderr].filter(Boolean).join('\n')
    throw new Error(`${command} ${args.join(' ')} failed\n${details}`)
  }
}

async function createConsumer(name, tarball) {
  const directory = await mkdtemp(path.join(tmpdir(), `${name}-`))
  await writeFile(path.join(directory, 'package.json'), '{"private":true,"type":"module"}\n')
  await run('npm', ['install', '--silent', tarball], { cwd: directory })
  return directory
}

async function main() {
  const { stdout } = await run('npm', ['pack', '--ignore-scripts'])
  const tarball = path.join(root, stdout.trim().split('\n').at(-1))
  const tempDirectories = []

  try {
    const nodeConsumer = await createConsumer('hellotext-node-smoke', tarball)
    tempDirectories.push(nodeConsumer)

    await run('node', ['--input-type=module', '-e', "import('@hellotext/hellotext/vanilla').then((m) => { if (!m.default) throw new Error('missing default export') })"], { cwd: nodeConsumer })
    await run('node', ['-e', "const mod = require('@hellotext/hellotext/vanilla'); if (!(mod.default || mod)) throw new Error('missing vanilla export')"], { cwd: nodeConsumer })
    await run('node', ['-e', "const packageJson = require('@hellotext/hellotext/package.json'); if (packageJson.name !== '@hellotext/hellotext') throw new Error('bad package export')"], { cwd: nodeConsumer })

    const browserConsumer = await createConsumer('hellotext-browser-smoke', tarball)
    tempDirectories.push(browserConsumer)

    const webpackConfig = path.join(browserConsumer, 'webpack.config.cjs')
    const entry = path.join(browserConsumer, 'entry.js')
    const bundle = path.join(browserConsumer, 'bundle.js')

    await writeFile(
      entry,
      "import Hellotext from '@hellotext/hellotext'\nimport '@hellotext/hellotext/styles/index.css'\nif (!Hellotext) throw new Error('missing root export')\n",
    )

    await writeFile(
      webpackConfig,
      `module.exports = {\n  mode: 'production',\n  entry: ${JSON.stringify(entry)},\n  output: { path: ${JSON.stringify(browserConsumer)}, filename: 'bundle.js' },\n  module: { rules: [{ test: /\\.css$/i, use: [${JSON.stringify(requireResolve('style-loader'))}, ${JSON.stringify(requireResolve('css-loader'))}] }] },\n}\n`,
    )

    await run(requireResolveBin('webpack'), ['--config', webpackConfig], { cwd: browserConsumer })

    if (!existsSync(bundle)) {
      throw new Error('Webpack smoke test did not produce a bundle')
    }

    const packageRoot = path.join(nodeConsumer, 'node_modules/@hellotext/hellotext')
    const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'))
    const umdPath = path.join(packageRoot, packageJson.unpkg)
    const explicitUmdPath = path.join(packageRoot, 'dist/hellotext.umd.js')

    if (!existsSync(umdPath)) {
      throw new Error(`UMD artifact is missing at ${packageJson.unpkg}`)
    }

    if (!existsSync(explicitUmdPath)) {
      throw new Error('Explicit UMD artifact is missing at dist/hellotext.umd.js')
    }

    const [legacyUmdStats, explicitUmdStats] = await Promise.all([stat(umdPath), stat(explicitUmdPath)])

    if (legacyUmdStats.size === 0 || explicitUmdStats.size === 0) {
      throw new Error('UMD artifacts must not be empty')
    }

    const [legacyUmd, explicitUmd] = await Promise.all([readFile(umdPath, 'utf8'), readFile(explicitUmdPath, 'utf8')])

    if (legacyUmd !== explicitUmd) {
      throw new Error('Legacy UMD alias dist/hellotext.js differs from dist/hellotext.umd.js')
    }
  } finally {
    await rm(tarball, { force: true })
    await Promise.all(tempDirectories.map((directory) => rm(directory, { recursive: true, force: true })))
  }
}

function requireResolve(specifier) {
  return fileURLToPath(import.meta.resolve(specifier))
}

function requireResolveBin(binary) {
  return path.join(root, 'node_modules', '.bin', binary)
}

await main()
