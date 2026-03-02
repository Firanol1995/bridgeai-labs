const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const CLIENT_DIR = path.join(ROOT, 'src')

function searchFiles(dir, pattern, results = []) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      searchFiles(full, pattern, results)
    } else if (pattern.test(full)) {
      results.push(full)
    }
  }
  return results
}

function scan() {
  const files = searchFiles(CLIENT_DIR, /\.(js|ts|tsx|jsx)$/)
  const leaked = []
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    if (content.includes('SUPABASE_KEY') || content.includes('SUPABASE_SERVICE_ROLE') || content.includes('OPENAI_API_KEY')) {
      leaked.push(file)
    }
  }
  if (leaked.length) {
    console.error('Potential leak of server secrets in client files:')
    leaked.forEach(x => console.error(' -', x))
    process.exitCode = 2
  } else {
    console.log('No obvious server-secret leaks found in', CLIENT_DIR)
  }
}

scan()
