export type Role = 'admin' | 'org_owner' | 'user'

export function hasRole(userRole: string | undefined, required: Role | Role[]) {
  if (!userRole) return false
  const arr = Array.isArray(required) ? required : [required]
  return arr.includes(userRole as Role)
}

export function requireRole(userRole: string | undefined, required: Role | Role[]) {
  if (!hasRole(userRole, required)) {
    const expected = Array.isArray(required) ? required.join(',') : required
    throw new Error(`Insufficient role: need ${expected}`)
  }
}
