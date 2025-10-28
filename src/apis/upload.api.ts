import { http } from './http'

export const uploadAPI = {
  async uploadCvPdf(file: File): Promise<{ url: string }> {
    const form = new FormData()
    form.append('file', file)
    // Do NOT set Content-Type manually; let the browser add the correct boundary
    const res = await http.post('/upload/cv-pdf', form)
    return res.data
  }
}


