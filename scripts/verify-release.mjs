import { spawnSync } from 'node:child_process'

function runNpm(script) {
  if (process.platform === 'win32') {
    return spawnSync('cmd.exe', ['/d', '/s', '/c', `npm run ${script}`], {
      stdio: 'inherit',
    })
  }

  return spawnSync('npm', ['run', script], {
    stdio: 'inherit',
  })
}

for (const script of ['lint', 'typecheck', 'build']) {
  const result = runNpm(script)

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
