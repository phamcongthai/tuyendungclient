import React, { useEffect, useRef, useState } from 'react'
import { Layout, Card, Form, Input, DatePicker, Select, Upload, Button, Space, Typography, Divider, Tag, message, Modal } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { usersAPI } from '../apis/users.api'
import { fetchCVSampleById, type CVSampleData } from '../apis/cv-samples.api'
import { cvBuilderAPI } from '../apis/cv-builder.api'
import { uploadAPI } from '../apis/upload.api'
import dayjs from 'dayjs'
import GrapeJS from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import Header from '../components/Header'
import { useUser } from '../contexts/UserContext'
import Footer from '../components/Footer'
import CVTemplateModal from '../components/CVTemplateModal'
// import { applicationsAPI } from '../apis/applications.api'

const { Title, Text } = Typography

const Profile: React.FC = () => {
  const [form] = Form.useForm()
  const { user: accountUser } = useUser()
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [editor, setEditor] = useState<any>(null)
  const initRef = useRef(false)
  const [cvModalOpen, setCvModalOpen] = useState(false)
  const [cvViewOpen, setCvViewOpen] = useState(false)
  const [cvUploading, setCvUploading] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<CVSampleData | null>(null)
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const load = async () => {
    try {
      const me = await usersAPI.getMe()
      setProfile(me)
      form.setFieldsValue({
        dateOfBirth: me.dateOfBirth ? dayjs(me.dateOfBirth) : undefined,
        gender: me.gender,
        city: me.city,
        desiredPosition: me.desiredPosition,
        summaryExperience: me.summaryExperience,
        skills: (me.skills || []).join(', '),
      })
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Không tải được hồ sơ')
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!cvModalOpen || initRef.current) return
    
    try {
      console.log('[ProfileCV] Open builder modal, selectedTemplate', {
        id: selectedTemplate?._id,
        hasHtml: !!selectedTemplate?.html,
        hasCss: !!selectedTemplate?.css,
      })
      const ed = GrapeJS.init({
        container: '#gjs-modal',
        height: '700px',
        fromElement: false,
        storageManager: false,
        blockManager: { appendTo: '#gjs-modal-blocks' },
        styleManager: {
          sectors: [
            {
              name: 'Typography',
              open: false,
              buildProps: ['font-family', 'font-size', 'color', 'line-height', 'letter-spacing', 'text-align']
            },
          {
            name: 'Decorations',
            open: false,
            buildProps: ['background-color', 'border', 'border-radius', 'box-shadow']
          },
          {
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'padding', 'margin']
          }
        ]
      },
    })

    // Require selected template; no base fallback styles

    const bm = ed.BlockManager
    const cat = 'CV Components'

    bm.add('cv-header', {
      label: 'Header',
      category: cat,
      content: `
        <section class="cv-header">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:72px;height:72px;border-radius:50%;background:#e5e7eb"></div>
            <div>
              <h1 style="margin:0;font-size:24px">Họ và tên</h1>
              <div class="cv-muted">Vị trí mong muốn • Thành phố</div>
            </div>
          </div>
        </section>
      `
    })

    bm.add('cv-contact', {
      label: 'Liên hệ',
      category: cat,
      content: `
        <section class="cv-section">
          <div class="cv-title">Liên hệ</div>
          <div class="cv-muted">Email: your@email.com</div>
          <div class="cv-muted">Điện thoại: 0123 456 789</div>
          <div class="cv-muted">LinkedIn: linkedin.com/in/username</div>
        </section>
      `
    })

    bm.add('cv-summary', {
      label: 'Tóm tắt',
      category: cat,
      content: `
        <section class="cv-section">
          <div class="cv-title">Tóm tắt</div>
          <p class="cv-subtitle">Mô tả ngắn gọn về kinh nghiệm, thế mạnh nổi bật và mục tiêu nghề nghiệp.</p>
        </section>
      `
    })

    bm.add('cv-skill-tags', {
      label: 'Kỹ năng',
      category: cat,
      content: `
        <section class="cv-section">
          <div class="cv-title">Kỹ năng</div>
          <div>
            <span class="cv-chip">Java</span>
            <span class="cv-chip">Spring</span>
            <span class="cv-chip">SQL</span>
          </div>
        </section>
      `
    })

    bm.add('cv-experience-item', {
      label: 'Kinh nghiệm',
      category: cat,
      content: `
        <section class="cv-section">
          <div class="cv-title">Kinh nghiệm</div>
          <div>
            <div style="display:flex;justify-content:space-between">
              <div><b>Vị trí</b> • Công ty A</div>
              <div class="cv-muted">01/2022 - 12/2024 • Hà Nội</div>
            </div>
            <ul class="cv-list">
              <li>Thành tích nổi bật 1</li>
              <li>Thành tích nổi bật 2</li>
            </ul>
          </div>
        </section>
      `
    })

    bm.add('cv-education-item', {
      label: 'Học vấn',
      category: cat,
      content: `
        <section class="cv-section">
          <div class="cv-title">Học vấn</div>
          <div>
            <div style="display:flex;justify-content:space-between">
              <div><b>Đại học XYZ</b> • Công nghệ thông tin</div>
              <div class="cv-muted">2017 - 2021</div>
            </div>
            <div class="cv-subtitle">GPA: 3.5/4.0</div>
          </div>
        </section>
      `
    })

    bm.add('cv-project-item', {
      label: 'Dự án',
      category: cat,
      content: `
        <section class="cv-section">
          <div class="cv-title">Dự án</div>
          <div><b>Tên dự án</b> • Vai trò
            <ul class="cv-list">
              <li>Mô tả ngắn chức năng/chịu trách nhiệm</li>
              <li>Tech: React, Node, MongoDB</li>
            </ul>
          </div>
        </section>
      `
    })

    bm.add('cv-cert-item', {
      label: 'Chứng chỉ',
      category: cat,
      content: `
        <section class="cv-section">
          <div class="cv-title">Chứng chỉ</div>
          <div><b>Tên chứng chỉ</b> • Tổ chức • 2023</div>
        </section>
      `
    })

    bm.add('cv-language-item', {
      label: 'Ngôn ngữ',
      category: cat,
      content: `
        <section class="cv-section">
          <div class="cv-title">Ngôn ngữ</div>
          <div>Tiếng Anh • TOEIC 850</div>
        </section>
      `
    })

      setEditor(ed)
      initRef.current = true

      return () => {
        try { ed.destroy() } catch {}
        initRef.current = false
        setEditor(null)
      }
    } catch (error) {
      console.error('Error initializing CV editor:', error)
      message.error('Lỗi khi khởi tạo trình chỉnh sửa CV')
    }
  }, [cvModalOpen, selectedTemplate])

  // Load template when selectedTemplate changes and editor is ready
  useEffect(() => {
    if (!editor || !selectedTemplate || !cvModalOpen) return
    
    // Load template with a small delay to ensure editor is ready
    const loadTemplate = async () => {
      try {
        console.log('[ProfileCV] Loading template into editor', { id: selectedTemplate._id })
        // Ensure we have full template detail
        let html = selectedTemplate.html
        let css = selectedTemplate.css
        if (!html) {
          try {
            const full = await fetchCVSampleById(selectedTemplate._id)
            html = full?.html || ''
            css = full?.css || css
            console.log('[ProfileCV] Fetched full template by id', { id: selectedTemplate._id, htmlLength: html.length, cssLength: css?.length || 0 })
          } catch {}
        }

        // If full document, extract body content
        if (html && /<html[\s\S]*<\/html>/i.test(html)) {
          try {
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, 'text/html')
            html = doc.body?.innerHTML || html
          } catch {}
        }

        // Clear existing content first
        editor.setComponents('')
        editor.setStyle('')

        if (html) {
          editor.setComponents(html)
          console.log('[ProfileCV] setComponents applied', { id: selectedTemplate._id, htmlLength: html.length })
        }
        if (css) {
          editor.setStyle(css)
          console.log('[ProfileCV] setStyle applied', { id: selectedTemplate._id, cssLength: css.length })
        }

        // Auto-fill avatar from user profile
        const doc = getEditorDocument()
        if (doc) {
          const avatarEl = doc.querySelector('[data-field="avatar"]') as HTMLImageElement
          if (avatarEl && profile?.avatar) {
            avatarEl.src = profile.avatar
          }
        }
      } catch (error) {
        console.error('Error loading template in editor:', error)
        message.error('Không thể tải mẫu CV vào editor')
      }
    }
    
    // Use setTimeout to ensure editor is fully ready
    const timeoutId = setTimeout(loadTemplate, 200)
    
    return () => clearTimeout(timeoutId)
  }, [editor, selectedTemplate, cvModalOpen, profile])

  // Read-only CV viewer modal setup
  const viewerRef = useRef<any>(null)
  const viewerInitRef = useRef(false)
  useEffect(() => {
    if (!cvViewOpen || viewerInitRef.current) return
    
    try {
      const ed = GrapeJS.init({
        container: '#gjs-view',
        height: '700px',
        fromElement: false,
        storageManager: false,
        blockManager: { appendTo: undefined },
        layerManager: { appendTo: undefined },
        selectorManager: { appendTo: undefined },
        styleManager: { appendTo: undefined },
        panels: { defaults: [] },
      })
      
      // Check if editor was created successfully
      if (!ed) {
        console.error('Failed to initialize CV viewer');
        message.error('Không thể khởi tạo trình xem CV');
        return;
      }
      
      // Disable editing interactions
      try {
        ed.off('component:selected', () => {});
        ed.Panels.getPanels().reset([]);
        ed.BlockManager.getAll().reset([]);
      } catch {}
    // Basic styles consistent with builder
    ed.setStyle(`
      .cv-container { font-family: Inter, system-ui, Arial, sans-serif; color: #111827; background: #ffffff; }
      .cv-wrapper { display: grid; grid-template-columns: 280px 1fr; min-height: 1000px; }
      .cv-sidebar { background: #1f4e79; color: #ffffff; padding: 24px; }
      .cv-name { font-size: 20px; font-weight: 700; color: #ffffff; text-transform: uppercase; }
      .cv-subtitle { color: #dbeafe; font-size: 12px; }
      .cv-main { padding: 24px; background: #ffffff; }
      .cv-section { margin-bottom: 18px; }
      .cv-section-title { font-size: 16px; font-weight: 700; color: #1f4e79; }
      .cv-muted { color: #6B7280; font-size: 12px; }
      `)
      viewerRef.current = ed
      viewerInitRef.current = true
      return () => {
        try { ed.destroy() } catch {}
        viewerRef.current = null
        viewerInitRef.current = false
      }
    } catch (error) {
      console.error('Error initializing CV viewer:', error)
      message.error('Lỗi khi khởi tạo trình xem CV')
    }
  }, [cvViewOpen])

  // Apply CV data to viewer when opened
  useEffect(() => {
    if (!cvViewOpen || !viewerRef.current) return
    
    // Add a small delay to ensure viewer is fully ready
    const loadViewerData = async () => {
      try {
        // If using new CV structure (cvId + cvFields)
        if ((profile as any)?.cvId && (profile as any)?.cvFields) {
          await loadTemplateForViewer((profile as any).cvId, (profile as any).cvFields)
        }
        // No legacy fallback
      } catch (error) {
        console.error('Error loading CV for viewer:', error)
      }
    }
    
    const timeoutId = setTimeout(loadViewerData, 300)
    return () => clearTimeout(timeoutId)
  }, [cvViewOpen, profile])

  const loadTemplateForViewer = async (cvId: any, cvFields: Record<string, string>) => {
    try {
      const id = typeof cvId === 'string' ? cvId : (cvId && (cvId as any)._id) ? (cvId as any)._id : ''
      if (!id) throw new Error('Invalid cvId')
      const template = await fetchCVSampleById(id)
      
      // Simply set avatar src in the template
      let modifiedHtml = template.html
      if (profile?.avatar) {
        // Replace src="" with actual avatar URL
        modifiedHtml = modifiedHtml.replace(
          'src="" alt="Profile Photo" data-field="avatar"',
          `src="${profile.avatar}" alt="Profile Photo" data-field="avatar"`
        )
      }
      
      viewerRef.current.setComponents(modifiedHtml)
      viewerRef.current.setStyle(template.css)
      
      // Wait a bit for the DOM to be ready, then apply other fields
      setTimeout(() => {
        const doc = viewerRef.current.Canvas?.getDocument?.()
        if (doc) {
          // Apply user data to template (excluding avatar since it's already set)
          if (cvFields) {
            Object.keys(cvFields).forEach((k) => {
              if (k !== 'avatar') { // Skip avatar since it's handled above
                const el = doc.querySelector(`[data-field="${k}"]`)
                if (el) {
                  el.textContent = String(cvFields[k] ?? '')
                }
              }
            })
          }
        }
      }, 200)
      
    } catch (error) {
      console.error('Error loading template for viewer:', error)
    }
  }

  // Prefill editor from saved CV data when modal and editor are ready (only in edit-existing mode)
  useEffect(() => {
    if (!cvModalOpen || !editor || !selectedTemplate) return
    if (!isEditingExisting) return
    
    // Add a small delay to ensure editor is fully ready
    const loadEditorData = async () => {
      try {
        // If using new CV structure (cvId + cvFields)
        if ((profile as any)?.cvId && (profile as any)?.cvFields) {
          await loadTemplateAndApplyData((profile as any).cvId, (profile as any).cvFields)
        } 
        // No legacy fallback
      } catch (error) {
        console.error('Error loading CV for editor:', error)
      }
    }
    
    const timeoutId = setTimeout(loadEditorData, 300)
    return () => clearTimeout(timeoutId)
  }, [cvModalOpen, editor, selectedTemplate, profile, isEditingExisting])

  const loadTemplateAndApplyData = async (cvId: any, cvFields: Record<string, string>) => {
    try {
      const id = typeof cvId === 'string' ? cvId : (cvId && (cvId as any)._id) ? (cvId as any)._id : ''
      if (!id) throw new Error('Invalid cvId')
      const template = await fetchCVSampleById(id)
      
      // Clear existing content first
      editor.setComponents('')
      editor.setStyle('')
      
      // Simply set avatar src in the template (same as viewer)
      let modifiedHtml = template.html
      if (profile?.avatar) {
        // Replace src="" with actual avatar URL
        modifiedHtml = modifiedHtml.replace(
          'src="" alt="Profile Photo" data-field="avatar"',
          `src="${profile.avatar}" alt="Profile Photo" data-field="avatar"`
        )
      }
      
      // Load template content
      editor.setComponents(modifiedHtml)
      editor.setStyle(template.css)
      
      // Wait a bit for the DOM to be ready, then apply other fields
      setTimeout(() => {
        const doc = getEditorDocument()
        if (doc) {
          // Apply user data to template (excluding avatar since it's already set)
          if (cvFields) {
            Object.keys(cvFields).forEach((k) => {
              if (k !== 'avatar') { // Skip avatar since it's handled above
                const el = doc.querySelector(`[data-field="${k}"]`)
                if (el) {
                  el.textContent = String(cvFields[k] ?? '')
                }
              }
            })
          }
        }
      }, 200)
      
    } catch (error) {
      console.error('Error loading template:', error)
      message.error('Không thể tải mẫu CV')
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        skills: values.skills ? values.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toDate() : undefined,
      }
      await usersAPI.updateMe(payload)
      message.success('Cập nhật hồ sơ thành công')
      load()
    } catch (e: any) {
      if (e?.errorFields) return
      message.error(e?.response?.data?.message || e?.message || 'Cập nhật thất bại')
    }
  }

  const beforeAvatarUpload = async (file: File) => {
    const isAllowed = ['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isAllowed) { message.error('Chỉ hỗ trợ JPG/PNG/WebP/GIF'); return Upload.LIST_IGNORE }
    if (!isLt5M) { message.error('Dung lượng tối đa 5MB'); return Upload.LIST_IGNORE }
    try {
      setAvatarUploading(true)
      await usersAPI.uploadAvatar(file)
      message.success('Cập nhật ảnh đại diện thành công')
      load()
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Tải ảnh thất bại')
    } finally {
      setAvatarUploading(false)
    }
    return Upload.LIST_IGNORE
  }

  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await beforeAvatarUpload(file)
      // reset input value to allow re-uploading same file name
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleSelectTemplate = async (template: CVSampleData) => {
    try {
      console.log('[ProfileCV] Template selected from modal', { id: template._id, hasHtml: !!template.html, hasCss: !!template.css })
      setSelectedTemplate(template)
      setIsEditingExisting(false)
      setCvModalOpen(true)
      message.success(`Đã chọn mẫu CV: ${template.name}`)
    } catch (error) {
      message.error('Không thể tải mẫu CV')
      console.error('Error selecting template:', error)
    }
  }

  const handleEditExistingCV = async () => {
    try {
      if (!(profile as any)?.cvId) {
        message.error('Không tìm thấy CV để chỉnh sửa')
        return
      }
      setIsEditingExisting(true)
      
      // Load template from cvId
      const id = typeof (profile as any).cvId === 'string' 
        ? (profile as any).cvId 
        : ((profile as any).cvId && (profile as any).cvId._id) 
          ? (profile as any).cvId._id 
          : ''
      if (!id) throw new Error('Invalid cvId')
      const template = await fetchCVSampleById(id)
      setSelectedTemplate(template)
      setCvModalOpen(true)
      
      message.success(`Đã mở CV để chỉnh sửa: ${template.name}`)
    } catch (error) {
      message.error('Không thể tải CV để chỉnh sửa')
    }
  }

  const handleDeleteCV = async () => {
    try {
      Modal.confirm({
        title: 'Xóa CV',
        content: 'Bạn có chắc chắn muốn xóa CV hiện tại? Hành động này không thể hoàn tác.',
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
          try {
            await usersAPI.deleteCv()
            
            setProfile((prev: any) => ({
              ...(prev || {}),
              cvId: null,
              cvFields: null
            }))
            
            message.success('Đã xóa CV thành công')
          } catch (error) {
            message.error('Không thể xóa CV')
          }
        }
      })
    } catch (error) {
      // Handle error silently
    }
  }

  // Upload CV from file is no longer supported; users should use the builder

  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load ' + src))
    document.body.appendChild(s)
  })

  // Helpers for CV JSON extraction/apply
  const getEditorDocument = () => {
    try {
      return editor?.Canvas?.getDocument?.() as Document | null
    } catch {
      return null
    }
  }

  const buildCvJsonFromEditor = () => {
    if (!editor) return null
    const doc = getEditorDocument()
    const fields: Record<string, string> = {}
    if (doc) {
      const nodes = doc.querySelectorAll('[data-field]')
      nodes.forEach((el) => {
        const key = el.getAttribute('data-field') || ''
        if (key) {
          // Skip avatar field - it will always come from user profile
          if (key === 'avatar') {
            return
          } else {
            fields[key] = (el.textContent || '').trim()
          }
        }
      })
    }
    // Chỉ trả về fields, không lưu HTML/CSS và không lưu avatar
    return fields
  }

  const applyCvJsonToEditor = (fields: Record<string, string>) => {
    if (!editor || !fields) return
    const doc = getEditorDocument()
    if (doc) {
      Object.keys(fields).forEach((k) => {
        // Skip avatar since it's handled separately in loadTemplateAndApplyData
        if (k === 'avatar') return
        
        const el = doc.querySelector(`[data-field="${k}"]`)
        if (el) {
          el.textContent = String(fields[k] ?? '')
        }
      })
    }
  }

  const saveCvData = async () => {
    if (!editor) { 
      message.error('Trình tạo chưa sẵn sàng'); 
      return false 
    }
    
    if (!selectedTemplate) {
      message.error('Vui lòng chọn template CV trước khi lưu');
      return false
    }
    
    try {
      const cvFields = buildCvJsonFromEditor()
      await cvBuilderAPI.saveCv({ 
        cvId: selectedTemplate._id,
        cvFields: cvFields 
      })
      
      setProfile((prev: any) => ({ 
        ...(prev || {}), 
        cvId: selectedTemplate._id,
        cvFields: cvFields 
      }))
      
      message.success('Đã lưu CV thành công!')
      return true
    } catch (err: any) {
      message.error('Lưu CV thất bại: ' + (err?.response?.data?.message || err?.message || ''))
      return false
    }
  }

  const saveCvAndDownloadPdf = async () => {
    if (!editor) { message.error('Trình tạo chưa sẵn sàng'); return }
    try {
      setCvUploading(true)
      
      // Save CV data to profile first
      const saveSuccess = await saveCvData()
      if (!saveSuccess) {
        setCvUploading(false)
        return
      }
      
      // Generate PDF once, then upload to Supabase and also download locally
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

      // Upload to server (Supabase) and update user profile
      const { url } = await uploadAPI.uploadCvPdf(file)
      await usersAPI.updateMe({ cvPdfUrl: url })

      // Also download locally
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl
      a.download = 'cv.pdf'
      a.click()
      URL.revokeObjectURL(objUrl)
      
      message.success('Đã lưu CV và cập nhật PDF')
    } catch (e: any) {
      message.error(e?.message || 'Lưu CV và tải PDF thất bại')
    } finally {
      setCvUploading(false)
    }
  }

  const downloadPdf = async () => {
    if (!editor) { message.error('Trình tạo chưa sẵn sàng'); return }
    try {
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
      wrapper.style.width = '794px' // ~A4 width at 96dpi
      wrapper.innerHTML = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`
      document.body.appendChild(wrapper)
      const canvas = await (window as any).html2canvas(wrapper, { scale: 1, useCORS: true })
      document.body.removeChild(wrapper)
      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      const { jsPDF } = (window as any).jspdf
      const pdf = new jsPDF('p', 'pt', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      // Fit image to page width
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
      // Download locally
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl
      a.download = 'cv.pdf'
      a.click()
      URL.revokeObjectURL(objUrl)
      message.success('Đã tải PDF về máy')
    } catch (e: any) {
      message.error(e?.message || 'Tải PDF thất bại')
    }
  }

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#F3F5F7' }}>
        <div style={{ width: '80vw', margin: '0 auto', padding: '24px 0' }}>
          {/* Hero header */}
          <div style={{
            background: 'linear-gradient(180deg, #F0FFF7 0%, #FFFFFF 60%)',
            border: '1px solid #e8f5e8',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 8px 24px rgba(16,185,129,0.06)',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #e8f5e8', background: '#f5f5f5', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ color: '#00b14f', fontWeight: 700, fontSize: 24 }}>
                    {accountUser?.fullName ? String(accountUser.fullName).charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Title level={3} style={{ margin: 0 }}>{accountUser?.fullName || 'Hồ sơ cá nhân'}</Title>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {profile?.city && <Tag>{profile.city}</Tag>}
                  {profile?.desiredPosition && <Tag color="#d1fae5" style={{ color: '#065f46', borderColor: '#d1fae5' }}>{profile.desiredPosition}</Tag>}
                </div>
              </div>
              {/* Actions moved to form footer to avoid duplicate buttons */}
            </div>
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: 20 }}>
            {/* Sidebar summary */}
            <Card style={{ borderRadius: 16, position: 'sticky', top: 16, alignSelf: 'start' }}>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <Text strong>Ảnh đại diện</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        border: '4px solid #e8f5e8',
                        background: '#f5f5f5',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: avatarUploading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                      }}
                      aria-label="Thay đổi ảnh đại diện"
                    >
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ color: '#00b14f', fontWeight: 700, fontSize: 40 }}>
                          {accountUser?.fullName ? String(accountUser.fullName).charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div style={{
                        position: 'absolute', left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)',
                        color: 'white', textAlign: 'center', padding: '6px 8px', fontSize: 12,
                      }}>
                        {avatarUploading ? 'Đang tải...' : 'Bấm để thay đổi'}
                      </div>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={onAvatarFileChange}
                    />
                  </div>
                </div>
                <Divider />
                <div>
                  <Text strong>Kỹ năng chính</Text>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(profile?.skills || []).map((s: string) => <Tag key={s} color="green">{s}</Tag>)
                    }
                  </div>
                </div>
              </div>
            </Card>

            {/* Main form */}
            <Card style={{ borderRadius: 16 }}>
              <Form form={form} layout="vertical">
                <Title level={4} style={{ marginTop: 0 }}>Thông tin cá nhân</Title>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Form.Item name="dateOfBirth" label="Ngày sinh">
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                  <Form.Item name="gender" label="Giới tính">
                    <Select options={[{value:'male',label:'Nam'},{value:'female',label:'Nữ'},{value:'other',label:'Khác'}]} />
                  </Form.Item>
                  <Form.Item name="city" label="Tỉnh/Thành phố">
                    <Input placeholder="Tỉnh/Thành phố" />
                  </Form.Item>
                  <Form.Item name="desiredPosition" label="Vị trí mong muốn">
                    <Input placeholder="VD: Java Developer" />
                  </Form.Item>
                </div>

                <Divider />
                <Title level={4}>Kinh nghiệm & Tóm tắt</Title>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Form.Item name="summaryExperience" label="Kinh nghiệm tổng quát">
                    <Input placeholder="VD: 3 năm Java Developer" />
                  </Form.Item>
                  <Form.Item name="skills" label="Kỹ năng chính (phân tách bởi dấu phẩy)">
                    <Input placeholder="VD: Java, Spring, SQL" />
                  </Form.Item>
                </div>

                <Divider />
                <Title level={4}>CV</Title>
                <Form.Item>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Button type="primary" onClick={() => setTemplateModalOpen(true)}>Tạo CV mới</Button>
                    {(profile as any)?.cvId && (
                      <Button onClick={handleEditExistingCV}>Chỉnh sửa CV</Button>
                    )}
                    <Button onClick={() => setCvViewOpen(true)}>Xem CV</Button>
                    {(profile as any)?.cvId && (
                      <Button danger onClick={handleDeleteCV}>Xóa CV</Button>
                    )}
                  </div>
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={handleSave}>Lưu thay đổi</Button>
                    <Button onClick={() => form.resetFields()}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>

          {/* CV Builder Modal */}
          <Modal
            title={
              <Space>
                <EditOutlined />
                <span>Trình tạo CV</span>
                {selectedTemplate && (
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    - {selectedTemplate.name}
                  </Text>
                )}
              </Space>
            }
            open={cvModalOpen}
            onCancel={() => {
              setCvModalOpen(false)
              setSelectedTemplate(null)
            }}
            width={1000}
            footer={[
              
              <Button key="save" onClick={saveCvData}>Lưu CV</Button>,
              <Button key="saveAndDownload" type="primary" loading={cvUploading} onClick={saveCvAndDownloadPdf}>Lưu CV & Tải PDF</Button>,
              <Button key="download" onClick={downloadPdf}>Tải PDF</Button>,
              <Button key="cancel" onClick={() => setCvModalOpen(false)}>Hủy</Button>
            ]}
          >
            <div id="gjs-modal-blocks" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, marginBottom: 12, background: '#fafafa' }} />
            <div id="gjs-modal" style={{ border: '1px solid #e5e7eb', borderRadius: 8, height: 700, minHeight: 700 }} />
          </Modal>

          {/* CV Viewer Modal (read-only) */}
          <Modal
            title="Xem CV"
            open={cvViewOpen}
            onCancel={() => setCvViewOpen(false)}
            width={1000}
            footer={[
              <Button key="close" onClick={() => setCvViewOpen(false)}>Đóng</Button>,
            ]}
          >
            {(profile as any)?.cvId ? (
              <div id="gjs-view" style={{ border: '1px solid #e5e7eb', borderRadius: 8, height: 700, minHeight: 700 }} />
            ) : (
              <div style={{ padding: 16 }}>Chưa có CV. Hãy tạo CV trước.</div>
            )}
          </Modal>

          {/* CV Template Selection Modal */}
          <CVTemplateModal
            open={templateModalOpen}
            onClose={() => setTemplateModalOpen(false)}
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  )
}

export default Profile


