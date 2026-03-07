import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function runCommand(command, args) {
  if (process.platform === 'win32') {
    return spawnSync('cmd.exe', ['/d', '/s', '/c', `${command} ${args.join(' ')}`], {
      cwd: root,
      encoding: 'utf8',
    })
  }

  return spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
  })
}

function runNpx(args) {
  const result = runCommand('npx', args)

  if (result.error) {
    console.error(result.error)
  }

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  return result
}

const generatedPrismaClientPath = path.join(root, 'node_modules', '.prisma', 'client', 'index.js')

const prismaGenerate = runNpx(['prisma', 'generate'])

if (prismaGenerate.status !== 0) {
  const output = `${prismaGenerate.stdout || ''}\n${prismaGenerate.stderr || ''}`
  const isWindowsPrismaLock = process.platform === 'win32' && output.includes('query_engine-windows.dll.node')
  const hasGeneratedClient = fs.existsSync(generatedPrismaClientPath)

  if (!isWindowsPrismaLock || !hasGeneratedClient) {
    process.exit(prismaGenerate.status ?? 1)
  }

  console.warn('[build] Prisma generate hit a locked Windows engine file; reusing existing generated client')
}

const nextBuild = runNpx(['next', 'build', '--webpack'])

process.exit(nextBuild.status ?? 1)
