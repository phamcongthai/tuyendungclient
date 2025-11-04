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
  EyeOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { type CVSampleData } from '../../apis/cv-samples.api';
import { uploadAPI } from '../../apis/upload.api';
import { usersAPI } from '../../apis/users.api';

const { Title} = Typography;

interface CVBuilderProps {
  template: CVSampleData;
  onBack: () => void;
  onSave: (cvData: { cvId: string; cvFields: any }) => void;
}

const CVBuilder: React.FC<CVBuilderProps> = ({
  template,
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
      // Initialize GrapesJS editor
      const editorInstance = grapesjs.init({
        container: editorRef.current,
        height: '100vh',
        width: '100%',
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

      // Load template HTML and CSS with null checks
      if (template.html) {
        editorInstance.setComponents(template.html);
      }
      if (template.css) {
        editorInstance.setStyle(template.css);
      }

      // Add custom commands for CV fields
      editorInstance.Commands.add('save-cv', {
        run: (editor: any) => {
          const html = editor.getHtml();
          
          // Extract form data from the editor
          const cvFields = extractCVFields(html);
          
          onSave({
            cvId: template._id,
            cvFields: cvFields,
          });
        },
      });

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
  }, [template]);

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
        // Save JSON to server via parent callback
        await Promise.resolve(editor.runCommand('save-cv'));

        // Export to PDF, upload to Supabase, update user profile
        setUploading(true);
        const pdfBlob = await exportEditorToPdfBlob();
        const file = new File([pdfBlob], 'cv.pdf', { type: 'application/pdf' });
        const { url } = await uploadAPI.uploadCvPdf(file);
        await usersAPI.updateMe({ cvPdfUrl: url });

        // Also trigger a local download for user convenience
        const objUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = 'cv.pdf';
        a.click();
        URL.revokeObjectURL(objUrl);

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

  const handlePreview = () => {
    if (!editor) {
      message.error('Trình chỉnh sửa chưa sẵn sàng');
      return;
    }
    
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      
      // Open preview in new window
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>CV Preview</title>
            <style>${css}</style>
          </head>
          <body>
            ${html}
          </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      message.error('Lỗi khi tạo xem trước');
    }
  };

  const handleDownload = () => {
    if (!editor) {
      message.error('Trình chỉnh sửa chưa sẵn sàng');
      return;
    }
    
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>CV - ${template.name}</title>
          <style>${css}</style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `;
      
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv-${template.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
      message.error('Lỗi khi tải xuống CV');
    }
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
                Tạo CV: {template.name}
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<EyeOutlined />} onClick={handlePreview}>
                Xem trước
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                Tải xuống
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving || uploading}
              >
                Lưu CV
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
