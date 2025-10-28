import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadPdfToSupabase(file: File, pathPrefix?: string): Promise<string> {
  const bucket = (import.meta.env.VITE_SUPABASE_BUCKET as string) || 'cvs'
  const cleanPrefix = (pathPrefix || 'cvs').replace(/^\/+|\/+$/g, '')
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.pdf`
  const filePath = `${cleanPrefix}/${fileName}`

  const { error: uploadError } = await supabase
    .storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  // Try to create a signed URL (works for both public and private buckets)
  const { data: signed, error: signError } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

  if (!signError && signed?.signedUrl) {
    return signed.signedUrl
  }

  // Fallback: use public URL (requires public bucket)
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  if (!data?.publicUrl) {
    throw new Error('Không lấy được URL từ Supabase')
  }
  return data.publicUrl
}


