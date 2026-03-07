import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getStartupEnvValidationErrors } from './env-validation.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const envFiles = [
  path.join(root, '.env.production.local'),
  path.join(root, '.env.local'),
  path.join(root, '.env.production'),
  path.join(root, '.env'),
]

for (const envFile of envFiles) {
  loadEnvFile(envFile)
}

const errors = getStartupEnvValidationErrors(process.env)

if (errors.length > 0) {
  console.error('Startup env validation failed:')
  for (const error of errors) {
    console.error(` - ${error}`)
  }
  process.exit(1)
}

console.log('Startup env validation passed.')
