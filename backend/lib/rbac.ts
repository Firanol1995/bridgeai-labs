export type Role = 'admin' | 'org_owner' | 'user' | 'engineer' | 'client'

function normalize(r?: string) {
  return (r || '').toString().toLowerCase()
}

export function hasRole(userRole: string | undefined, required: Role | Role[]) {
  if (!userRole) return false
  const arr = Array.isArray(required) ? required : [required]
  const norm = normalize(userRole)
  return arr.map((a) => a.toString().toLowerCase()).includes(norm)
}

export function requireRole(userRole: string | undefined, required: Role | Role[]) {
  if (!hasRole(userRole, required)) {
    const expected = Array.isArray(required) ? required.join(',') : required
    throw new Error(`Insufficient role: need ${expected}`)
  }
}
