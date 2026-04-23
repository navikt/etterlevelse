import { spawnSync } from 'node:child_process'
import path from 'node:path'

const run = (command, args, stdio = 'inherit') =>
  spawnSync(command, args, {
    stdio,
    encoding: 'utf8',
  })

const runYarn = (args) => {
  const corepackCommand = process.platform === 'win32' ? 'corepack.cmd' : 'corepack'
  const corepackResult = run(corepackCommand, ['yarn', ...args])

  if (!corepackResult.error) {
    return corepackResult
  }

  if (corepackResult.error.code !== 'ENOENT') {
    return corepackResult
  }

  const yarnCommand = process.platform === 'win32' ? 'yarn.cmd' : 'yarn'
  return run(yarnCommand, args)
}

const gitCommand = process.platform === 'win32' ? 'git.exe' : 'git'
const stagedFromHook = (process.env.PRECOMMIT_STAGED_FILES || '')
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)

const staged =
  stagedFromHook.length > 0
    ? { status: 0, stdout: stagedFromHook.join('\n') }
    : run(gitCommand, ['diff', '--cached', '--name-only'], 'pipe')

if (staged.error) {
  process.stderr.write(`${staged.error.message}\n`)
  process.exit(1)
}

if (staged.status !== 0) {
  process.exit(staged.status ?? 1)
}

const stagedFiles = (staged.stdout || '')
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)

const dependencyFiles = new Set([
  'package.json',
  'yarn.lock',
  'package-lock.json',
  'pnpm-lock.yaml',
])
const hasDependencyFileChanges = stagedFiles.some((file) =>
  dependencyFiles.has(path.posix.basename(file))
)

if (!hasDependencyFileChanges) {
  process.stdout.write(
    'No dependency manifest changes staged. Skipping deps-upgrade verification.\n'
  )
  process.exit(0)
}

process.stdout.write(
  'Dependency manifest changes detected. Running prettier, eslint, and build...\n'
)

const verification = runYarn(['run', 'verify:deps-upgrade'])

if (verification.error) {
  process.stderr.write(`${verification.error.message}\n`)
  process.exit(1)
}

process.exit(verification.status ?? 1)
