import { http } from './http'
import { uploadPdfToSupabase } from '../utils/supabase'

export const uploadAPI = {
  async uploadCvPdf(file: File): Promise<{ url: string }> {
    try {
      const form = new FormData()
      form.append('file', file)
      // Do NOT set Content-Type manually; let the browser add the correct boundary
      const res = await http.post('/upload/cv-pdf', form)
      return res.data
    } catch (err) {
      // Fallback: upload directly to Supabase from client using anon key
      const url = await uploadPdfToSupabase(file, 'users')
      return { url }
    }
  }
}


