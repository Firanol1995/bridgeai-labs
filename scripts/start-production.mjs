import { spawnSync } from 'node:child_process'

const validate = spawnSync(process.execPath, ['scripts/validate-startup-env.mjs'], {
  stdio: 'inherit',
})

if (validate.status !== 0) {
  process.exit(validate.status ?? 1)
}

const nextArgs = ['node_modules/next/dist/bin/next', 'start', ...process.argv.slice(2)]
const start = spawnSync(process.execPath, nextArgs, {
  stdio: 'inherit',
})

process.exit(start.status ?? 1)
