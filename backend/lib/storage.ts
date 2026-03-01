import { supabaseAdmin } from './supabaseServer'

const BUCKET = process.env.SUPABASE_BUCKET_NAME ?? 'datasets'

export async function uploadFile(path: string, buffer: Buffer, contentType?: string) {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  })

  if (error) throw error
  return data
}

export function getPublicUrl(path: string) {
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
