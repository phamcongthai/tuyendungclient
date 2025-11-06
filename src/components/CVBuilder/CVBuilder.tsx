import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  message,
  Row,
  Col
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { type CVSampleData, fetchCVSampleById } from '../../apis/cv-samples.api';
import { uploadAPI } from '../../apis/upload.api';
import { usersAPI } from '../../apis/users.api';

const { Title} = Typography;

interface CVBuilderProps {
  template: CVSampleData;
  existingCvData?: any;
  isEditMode?: boolean;
  onBack: () => void;
  onSave: (cvData: { cvId: string; cvFields: any }) => void;
}

const CVBuilder: React.FC<CVBuilderProps> = ({
  template,
  existingCvData,
  isEditMode = false,
  onBack,
  onSave,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!editorRef.current || !template) return;

    try {
      console.log('[CVBuilder] Initializing editor with template', {
        templateId: template._id,
        hasHtml: !!template.html,
        hasCss: !!template.css,
      });
      // Initialize GrapesJS editor
      const editorInstance = grapesjs.init({
        container: editorRef.current,
        height: '100vh',
        width: '100%',
        fromElement: false,
        storageManager: false,
        plugins: [],
        pluginsOpts: {},
        canvas: {
          styles: [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css',
          ],
        },
        blockManager: {
          appendTo: '.blocks-container',
        },
        layerManager: {
          appendTo: '.layers-container',
        },
        traitManager: {
          appendTo: '.traits-container',
        },
        selectorManager: {
          appendTo: '.styles-container',
        },
        panels: {
          defaults: [
            {
              id: 'basic-actions',
              el: '.panel__basic-actions',
              buttons: [
                {
                  id: 'visibility',
                  active: true,
                  className: 'btn-toggle-borders',
                  label: '<i class="fa fa-clone"></i>',
                  command: 'sw-visibility',
                },
              ],
            },
            {
              id: 'panel-devices',
              el: '.panel__devices',
              buttons: [
                {
                  id: 'device-desktop',
                  label: '<i class="fa fa-television"></i>',
                  command: 'set-device-desktop',
                  active: true,
                  togglable: false,
                },
                {
                  id: 'device-tablet',
                  label: '<i class="fa fa-tablet"></i>',
                  command: 'set-device-tablet',
                  togglable: false,
                },
                {
                  id: 'device-mobile',
                  label: '<i class="fa fa-mobile"></i>',
                  command: 'set-device-mobile',
                  togglable: false,
                },
              ],
            },
          ],
        },
        deviceManager: {
          devices: [
            {
              name: 'Desktop',
              width: '',
            },
            {
              name: 'Tablet',
              width: '768px',
              widthMedia: '992px',
            },
            {
              name: 'Mobile',
              width: '320px',
              widthMedia: '768px',
            },
          ],
        },
      });

      // Check if editor instance was created successfully
      if (!editorInstance) {
        console.error('Failed to initialize GrapesJS editor');
        message.error('Không thể khởi tạo trình chỉnh sửa CV');
        return;
      }

      const loadTemplateIntoEditor = async () => {
        try {
          // Clear any previous/default content
          try {
            editorInstance.setComponents('');
            editorInstance.setStyle('');
          } catch {}

          // Ensure we have full template content
          let htmlContent = template.html || '';
          let cssContent = template.css || '';

          if (!htmlContent) {
            try {
              const full = await fetchCVSampleById(template._id);
              htmlContent = full?.html || '';
              cssContent = full?.css || cssContent;
              console.log('[CVBuilder] Fetched full template by id', {
                templateId: template._id,
                htmlLength: htmlContent.length,
                cssLength: cssContent?.length || 0,
              });
            } catch (e) {
              // Fallback: leave empty if cannot fetch
              console.error('[CVBuilder] Failed to fetch full template by id', e);
            }
          }

          // Sanitize: if full document provided, extract body innerHTML
          if (htmlContent && /<html[\s\S]*<\/html>/i.test(htmlContent)) {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlContent, 'text/html');
              htmlContent = doc.body?.innerHTML || htmlContent;
              console.log('[CVBuilder] Sanitized full HTML document to body.innerHTML', {
                templateId: template._id,
                sanitizedHtmlLength: htmlContent.length,
              });
            } catch {}
          }

          // If editing existing CV, populate template with saved data
          if (isEditMode && existingCvData && existingCvData.cvFields) {
            htmlContent = populateTemplateWithData(htmlContent, existingCvData.cvFields);
          }

          // Small delay to ensure canvas is fully ready
          await new Promise((r) => setTimeout(r, 50));

          if (htmlContent) {
            editorInstance.setComponents(htmlContent);
            console.log('[CVBuilder] setComponents applied', {
              templateId: template._id,
              appliedHtmlLength: htmlContent.length,
            });
          } else {
            console.warn('Template HTML is empty');
          }
          if (cssContent) {
            editorInstance.setStyle(cssContent);
            console.log('[CVBuilder] setStyle applied', {
              templateId: template._id,
              appliedCssLength: cssContent.length,
            });
          }
          try {
            const currentHtml = editorInstance.getHtml();
            console.log('[CVBuilder] Editor HTML length after apply', currentHtml?.length || 0);
          } catch {}
        } catch (e) {
          console.error('Error loading template into editor:', e);
          message.error('Không thể tải mẫu CV vào editor');
        }
      };

      // Load when editor is ready
      let loadedOnce = false;
      editorInstance.on('load', () => {
        if (loadedOnce) return;
        loadedOnce = true;
        console.log('[CVBuilder] Editor load event fired');
        loadTemplateIntoEditor();
      });
      // Safety: fallback load after short delay
      setTimeout(() => {
        if (!loadedOnce) {
          console.log('[CVBuilder] Fallback load after timeout');
          loadedOnce = true;
          loadTemplateIntoEditor();
        }
      }, 200);

      setEditor(editorInstance);

      return () => {
        if (editorInstance) {
          editorInstance.destroy();
        }
      };
    } catch (error) {
      console.error('Error initializing CV builder:', error);
      message.error('Lỗi khi khởi tạo trình chỉnh sửa CV');
    }
  }, [template, existingCvData, isEditMode]);

  // Ensure re-apply when template id changes while editor persists
  useEffect(() => {
    const current = editor;
    if (!current || !template) return;
    (async () => {
      try {
        console.log('[CVBuilder] Re-apply template on id change', { templateId: template._id });
        try {
          current.setComponents('');
          current.setStyle('');
        } catch {}

        let htmlContent = template.html || '';
        let cssContent = template.css || '';
        if (!htmlContent) {
          try {
            const full = await fetchCVSampleById(template._id);
            htmlContent = full?.html || '';
            cssContent = full?.css || cssContent;
          } catch {}
        }
        if (htmlContent && /<html[\s\S]*<\/html>/i.test(htmlContent)) {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            htmlContent = doc.body?.innerHTML || htmlContent;
          } catch {}
        }
        if (isEditMode && existingCvData && existingCvData.cvFields) {
          htmlContent = populateTemplateWithData(htmlContent, existingCvData.cvFields);
        }
        if (htmlContent) current.setComponents(htmlContent);
        if (cssContent) current.setStyle(cssContent);
      } catch (e) {
        console.error('[CVBuilder] Re-apply failed', e);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?._id]);

  // Helper function to populate template with saved data
  const populateTemplateWithData = (html: string, cvFields: any): string => {
    if (!cvFields || typeof cvFields !== 'object') {
      return html;
    }

    let populatedHtml = html;

    // Replace placeholders or populate input fields
    Object.keys(cvFields).forEach(key => {
      const value = cvFields[key];
      if (value) {
        // Replace data attributes
        const dataAttrRegex = new RegExp(`data-field="${key}"[^>]*>([^<]*)`, 'g');
        populatedHtml = populatedHtml.replace(dataAttrRegex, `data-field="${key}">${value}`);
        
        // Replace input/textarea values
        const inputRegex = new RegExp(`(<input[^>]*name="${key}"[^>]*value=")[^"]*"`, 'g');
        populatedHtml = populatedHtml.replace(inputRegex, `$1${value}"`);
        
        const textareaRegex = new RegExp(`(<textarea[^>]*name="${key}"[^>]*>)[^<]*(<\\/textarea>)`, 'g');
        populatedHtml = populatedHtml.replace(textareaRegex, `$1${value}$2`);
        
        // Replace placeholder text for common fields
        if (key === 'fullName' || key === 'name') {
          populatedHtml = populatedHtml.replace(/\[Tên của bạn\]/gi, value);
          populatedHtml = populatedHtml.replace(/\[Your Name\]/gi, value);
        }
        if (key === 'email') {
          populatedHtml = populatedHtml.replace(/\[Email của bạn\]/gi, value);
          populatedHtml = populatedHtml.replace(/\[Your Email\]/gi, value);
        }
        if (key === 'phone') {
          populatedHtml = populatedHtml.replace(/\[Số điện thoại\]/gi, value);
          populatedHtml = populatedHtml.replace(/\[Your Phone\]/gi, value);
        }
        if (key === 'address') {
          populatedHtml = populatedHtml.replace(/\[Địa chỉ\]/gi, value);
          populatedHtml = populatedHtml.replace(/\[Your Address\]/gi, value);
        }
      }
    });

    return populatedHtml;
  };

  const extractCVFields = (html: string) => {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extract form data from input fields and text areas
    const inputs = tempDiv.querySelectorAll('input, textarea, select');
    const extractedData: any = {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        website: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };
    
    // Extract values from form elements
    inputs.forEach((input: any) => {
      const name = input.name || input.id;
      const value = input.value || input.textContent || '';
      
      if (name) {
        // Map common field names to our structure
        if (name.includes('name') || name.includes('fullName')) {
          extractedData.personalInfo.fullName = value;
        } else if (name.includes('email')) {
          extractedData.personalInfo.email = value;
        } else if (name.includes('phone')) {
          extractedData.personalInfo.phone = value;
        } else if (name.includes('address')) {
          extractedData.personalInfo.address = value;
        } else if (name.includes('birth') || name.includes('dob')) {
          extractedData.personalInfo.dateOfBirth = value;
        } else if (name.includes('website') || name.includes('url')) {
          extractedData.personalInfo.website = value;
        } else if (name.includes('summary') || name.includes('objective')) {
          extractedData.summary = value;
        }
      }
    });
    
    return extractedData;
  };

  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.body.appendChild(s);
  });

  const exportEditorToPdfBlob = async () => {
    if (!editor) throw new Error('Editor not ready');
    if (!(window as any).html2canvas) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }
    if (!(window as any).jspdf) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    const html = editor.getHtml();
    const css = editor.getCss();
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-99999px';
    wrapper.style.top = '0';
    wrapper.style.width = '794px';
    wrapper.innerHTML = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`;
    document.body.appendChild(wrapper);
    const canvas = await (window as any).html2canvas(wrapper, { scale: 1, useCORS: true });
    document.body.removeChild(wrapper);
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    const { jsPDF } = (window as any).jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    let position = 0;
    let heightLeft = imgHeight;
    while (heightLeft > 0) {
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      if (heightLeft > 0) {
        pdf.addPage();
        position = 0;
      }
    }
    const blob = pdf.output('blob') as Blob;
    return blob;
  };

  const handleSave = () => {
    if (!editor) {
      message.error('Trình chỉnh sửa chưa sẵn sàng');
      return;
    }
    
    setSaving(true);
    (async () => {
      try {
        // Export edited content to PDF first to guarantee the current state is captured
        setUploading(true);
        const pdfBlob = await exportEditorToPdfBlob();
        const file = new File([pdfBlob], 'cv.pdf', { type: 'application/pdf' });
        const { url } = await uploadAPI.uploadCvPdf(file);

        // Extract current editor state and save JSON to server
        const html = editor.getHtml();
        const cvFields = extractCVFields(html);
        await Promise.resolve(onSave({ cvId: template._id, cvFields }));

        // Update user profile with edited PDF URL
        await usersAPI.updateMe({ cvPdfUrl: url });

        message.success('Đã lưu CV và cập nhật PDF thành công');
      } catch (error) {
        console.error('Error saving/uploading CV:', error);
        message.error('Lỗi khi lưu hoặc cập nhật PDF CV');
      } finally {
        setUploading(false);
        setSaving(false);
      }
    })();
  };

  const handleDownload = () => {
    if (!editor) {
      message.error('Trình chỉnh sửa chưa sẵn sàng');
      return;
    }
    
    (async () => {
      try {
        const pdfBlob = await exportEditorToPdfBlob();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${template.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading CV as PDF:', error);
        message.error('Lỗi khi tải PDF CV');
      }
    })();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card style={{ margin: '16px', borderRadius: '8px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                Quay lại
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                {isEditMode ? 'Chỉnh sửa CV' : 'Tạo CV'}: {template.name}
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                Tải PDF
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving || uploading}
              >
                Lưu
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* GrapesJS Editor */}
      <div style={{ flex: 1, margin: '0 16px 16px 16px' }}>
        <div
          ref={editorRef}
          style={{
            height: '100%',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
      </div>
    </div>
  );
};

export default CVBuilder;
