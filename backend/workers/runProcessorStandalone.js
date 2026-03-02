#!/usr/bin/env node
// Standalone runner that generates a deterministic mock embedding for a text
// Does not import any project modules — safe for local environments without Redis
const fs = require('fs')
const path = require('path')

function makeDeterministicVector(text, dim = 1536) {
  let seed = 0
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0
  const out = new Array(dim)
  for (let i = 0; i < dim; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    out[i] = ((seed % 1000) - 500) / 500
  }
  return out
}

const args = process.argv.slice(2)
const text = process.env.TEST_TEXT || args.join(' ') || 'Standalone embedding test.'
const recordId = process.env.TEST_RECORD_ID || `standalone-${Date.now()}`
const projectId = process.env.TEST_PROJECT_ID || 'local'

console.log('Generating deterministic mock embedding for text:', text)
const vector = makeDeterministicVector(text)

const out = {
  recordId,
  projectId,
  text,
  vectorLength: vector.length,
  sampleVector: vector.slice(0, 8),
}

const outPath = path.resolve(__dirname, 'runProcessorStandalone.output.json')
fs.writeFileSync(outPath, JSON.stringify({ ...out, vector }, null, 2))
console.log('Wrote output to', outPath)
console.log('Summary:', JSON.stringify(out, null, 2))

process.exit(0)
