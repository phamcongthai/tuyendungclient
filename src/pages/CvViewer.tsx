import React, { useEffect, useRef, useState } from 'react'
import { Button, Empty, Layout, Modal, Spin, Typography, message } from 'antd'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { usersAPI } from '../apis/users.api'
import { useNavigate } from 'react-router-dom'
import GrapeJS from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import { applicationsAPI } from '../apis/applications.api'
import { Document, Page, pdfjs } from 'react-pdf'
// Use Vite-compatible worker import to avoid dynamic import issues
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite will resolve this to an URL string
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min?url'
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc as string

const { Title, Text } = Typography

const CvViewer: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const navigate = useNavigate()
  const [cvModalOpen, setCvModalOpen] = useState(false)
  const [cvUploading, setCvUploading] = useState(false)
  const [editor, setEditor] = useState<any>(null)
  const initRef = useRef(false)
  const [pdfPages, setPdfPages] = useState<number>(0)
  const [pdfPageNumber, setPdfPageNumber] = useState<number>(1)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await usersAPI.getMe()
        setCvUrl(me?.cvUrl || null)
      } catch (e) {
        setCvUrl(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!cvModalOpen || initRef.current) return
    const ed = GrapeJS.init({
      container: '#gjs-viewer',
      height: '700px',
      fromElement: false,
      storageManager: false,
      blockManager: { appendTo: '#gjs-viewer-blocks' },
    })

    // Basic styles to make CV look structured
    ed.setStyle(`
      body { font-family: Inter, system-ui, Arial, sans-serif; }
      .cv-wrap { display: grid; grid-template-columns: 280px 1fr; min-height: 1000px; }
      .cv-side { background: #1f4e79; color: #fff; padding: 24px; }
      .cv-avatar { width: 120px; height: 120px; border-radius: 50%; background: #e5e7eb; border: 4px solid #fff; margin: 0 auto 12px; }
      .cv-name { font-size: 20px; font-weight: 700; color: #fff; text-transform: uppercase; text-align:center }
      .cv-subtitle { color: #dbeafe; font-size: 12px; text-align:center }
      .cv-main { padding: 24px; background: #fff; }
      .cv-sec { margin-bottom: 18px; }
      .cv-sec-title { font-size: 16px; font-weight: 700; color: #1f4e79; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
      .cv-muted { color: #6B7280; font-size: 12px; }
    `)

    const bm = ed.BlockManager
    const cat = 'CV'
    bm.add('cv-layout', {
      label: 'Mẫu layout',
      category: cat,
      content: `
        <div class="cv-wrap">
          <aside class="cv-side">
            <div class="cv-avatar"></div>
            <div class="cv-name">Họ và tên</div>
            <div class="cv-subtitle">Vị trí mong muốn</div>
          </aside>
          <main class="cv-main">
            <section class="cv-sec">
              <div class="cv-sec-title">Tóm tắt</div>
              <p class="cv-muted">Mô tả ngắn gọn kinh nghiệm và thế mạnh.</p>
            </section>
            <section class="cv-sec">
              <div class="cv-sec-title">Kinh nghiệm</div>
              <div><b>Vị trí</b> • Công ty</div>
              <div class="cv-muted">01/2023 - Hiện tại</div>
              <ul><li>Thành tích nổi bật 1</li><li>Thành tích nổi bật 2</li></ul>
            </section>
          </main>
        </div>
      `,
    })

    setEditor(ed)
    initRef.current = true
    return () => {
      try { ed.destroy() } catch {}
      initRef.current = false
      setEditor(null)
    }
  }, [cvModalOpen])

  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load ' + src))
    document.body.appendChild(s)
  })

  const exportEditorToPdfAndUpload = async () => {
    if (!editor) { message.error('Trình tạo chưa sẵn sàng'); return }
    try {
      setCvUploading(true)
      if (!(window as any).html2canvas) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      }
      if (!(window as any).jspdf) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      }
      const html = editor.getHtml()
      const css = editor.getCss()
      const wrapper = document.createElement('div')
      wrapper.style.position = 'fixed'
      wrapper.style.left = '-99999px'
      wrapper.style.top = '0'
      wrapper.style.width = '794px'
      wrapper.innerHTML = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`
      document.body.appendChild(wrapper)
      const canvas = await (window as any).html2canvas(wrapper, { scale: 1, useCORS: true })
      document.body.removeChild(wrapper)
      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      const { jsPDF } = (window as any).jspdf
      const pdf = new jsPDF('p', 'pt', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = canvas.height * (imgWidth / canvas.width)
      let position = 0
      let heightLeft = imgHeight
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        if (heightLeft > 0) {
          pdf.addPage()
          position = 0
        }
      }
      const blob = pdf.output('blob') as Blob
      const file = new File([blob], 'cv.pdf', { type: 'application/pdf' })
      const { url, downloadUrl } = await applicationsAPI.uploadResume(file)
      const finalUrl = downloadUrl || url
      await usersAPI.updateMe({ cvUrl: finalUrl })
      setCvUrl(finalUrl)
      setCvModalOpen(false)
      message.success('Đã cập nhật CV')
    } catch (e: any) {
      message.error(e?.message || 'Xuất PDF thất bại')
    } finally {
      setCvUploading(false)
    }
  }

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#F3F5F7' }}>
        <div style={{ width: '90vw', margin: '0 auto', padding: '24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Title level={3} style={{ margin: 0 }}>CV của tôi</Title>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setCvModalOpen(true)} type="primary">Chỉnh sửa CV</Button>
              <Button onClick={() => navigate('/profile')}>Quay lại hồ sơ</Button>
            </div>
          </div>
          {loading ? (
            <div style={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
              <Spin size="large" />
            </div>
          ) : cvUrl ? (
            <div style={{ height: '80vh', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}>
              {(() => {
                const urlRaw = cvUrl!
                const url = urlRaw.split('?')[0]
                const isOffice = /\.(doc|docx|ppt|pptx)$/i.test(url)
                const isPdf = /\.(pdf)$/i.test(url)
                if (isOffice) {
                  const officeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(urlRaw)}`
                  return <iframe title="CV (Office)" src={officeSrc} style={{ width: '100%', height: '100%', border: 'none' }} />
                }
                if (isPdf) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ padding: 8, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 500 }}>Trang {pdfPageNumber}/{pdfPages || '?'}</span>
                        <div style={{ flex: 1 }} />
                        <Button size="small" disabled={pdfPageNumber <= 1} onClick={() => setPdfPageNumber(n => Math.max(1, n - 1))}>Trước</Button>
                        <Button size="small" disabled={pdfPages > 0 && pdfPageNumber >= pdfPages} onClick={() => setPdfPageNumber(n => (pdfPages ? Math.min(pdfPages, n + 1) : n + 1))}>Sau</Button>
                      </div>
                      <div style={{ flex: 1, overflow: 'auto', display: 'grid', placeItems: 'center', background: '#f8fafc' }}>
                        <Document 
                          file={url}
                          onLoadSuccess={(info) => { setPdfPages(info.numPages); setPdfPageNumber(1) }}
                          onLoadError={(e) => message.error('Không tải được PDF: ' + (e as any)?.message)}
                          loading={<div style={{ padding: 20 }}><Spin /></div>}
                        >
                          <Page pageNumber={pdfPageNumber} width={900} />
                        </Document>
                      </div>
                    </div>
                  )
                }
                return <iframe title="CV" src={url} style={{ width: '100%', height: '100%', border: 'none' }} />
              })()}
              <div style={{ padding: 8, background: '#fafafa', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
                <Button onClick={() => window.open(cvUrl!, '_blank')}>Mở tab mới</Button>
                <Button type="link" onClick={() => window.open(cvUrl!, '_blank')}>Tải về nếu không hiển thị</Button>
              </div>
            </div>
          ) : (
            <Empty description={<Text>Chưa có CV. Hãy tải lên hoặc tạo CV trong trang Hồ sơ.</Text>} />
          )}
          <Modal
            title="Chỉnh sửa CV"
            open={cvModalOpen}
            onCancel={() => setCvModalOpen(false)}
            width={1000}
            footer={[
              <Button key="template" onClick={() => {
                if (!editor) return
                editor.setComponents(`
                  <div class=\"cv-wrap\">\
                    <aside class=\"cv-side\">\
                      <div class=\"cv-avatar\"></div>\
                      <div class=\"cv-name\">Họ và tên</div>\
                      <div class=\"cv-subtitle\">Vị trí mong muốn</div>\
                    </aside>\
                    <main class=\"cv-main\">\
                      <section class=\"cv-sec\">\
                        <div class=\"cv-sec-title\">Tóm tắt</div>\
                        <p class=\"cv-muted\">Mô tả ngắn gọn về kinh nghiệm và mục tiêu.</p>\
                      </section>\
                      <section class=\"cv-sec\">\
                        <div class=\"cv-sec-title\">Kinh nghiệm</div>\
                        <div><b>Vị trí</b> • Công ty</div>\
                        <div class=\"cv-muted\">01/2023 - Hiện tại</div>\
                        <ul><li>Thành tích 1</li><li>Thành tích 2</li></ul>\
                      </section>\
                    </main>\
                  </div>
                `)
              }}>Chèn mẫu</Button>,
              <Button key="cancel" onClick={() => setCvModalOpen(false)}>Hủy</Button>,
              <Button key="ok" type="primary" loading={cvUploading} onClick={exportEditorToPdfAndUpload}>Xuất PDF & Lưu</Button>
            ]}
          >
            <div id="gjs-viewer-blocks" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, marginBottom: 12, background: '#fafafa' }} />
            <div id="gjs-viewer" style={{ border: '1px solid #e5e7eb', borderRadius: 8, height: 700, minHeight: 700 }} />
          </Modal>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  )
}

export default CvViewer


