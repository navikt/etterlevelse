import { spawnSync } from 'node:child_process'

const stagedFiles = process.argv.slice(2).map((file) => file.replace(/\\/g, '/'))

const isSpecFile = (file) => /^playwright\/tests\/.*\.(js|jsx|ts|tsx)$/.test(file)

const affectsTillatGjenbrukFlow = (file) =>
  [
    /^app\/components\/etterlevelseDokumentasjon\/etterlevelseDokumentasjonPage\/gjenbruk\//,
    /^app\/provider\/user\/userProvider\.tsx$/,
    /^app\/components\/others\/layout\/header\//,
    /^app\/\(pages\)\/e2e\//,
  ].some((pattern) => pattern.test(file))

const testsToRun = new Set(stagedFiles.filter(isSpecFile))

if (stagedFiles.some(affectsTillatGjenbrukFlow)) {
  testsToRun.add('playwright/tests/tillat-gjenbruk-modal.spec.ts')
}

if (testsToRun.size === 0) {
  process.stdout.write('No staged Playwright-relevant files matched. Skipping Playwright.\n')
  process.exit(0)
}

const yarnCommand = process.platform === 'win32' ? 'yarn.cmd' : 'yarn'
const result = spawnSync(yarnCommand, ['run', 'e2e', ...Array.from(testsToRun), '--workers=1'], {
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
