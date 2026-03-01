import { NextRequest } from 'next/server'

export function isAdminRequest(req: Request | NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY || ''
  if (!adminKey) return false

  // check header first
  try {
    // Request headers API differs between runtime; try both
    // @ts-ignore
    const hdr = (req as any).headers?.get ? (req as any).headers.get('x-admin-key') : undefined
    if (hdr && hdr === adminKey) return true
  } catch (e) {}

  try {
    const url = new URL((req as Request).url)
    const key = url.searchParams.get('admin_key') || ''
    if (key === adminKey) return true
  } catch (e) {}

  return false
}
