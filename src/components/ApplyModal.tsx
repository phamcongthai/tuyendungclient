import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Button, Alert } from 'antd';
// import { uploadToCloudinary } from '../utils/cloudinary';
import { applicationsAPI } from '../apis/applications.api';
import { useUser } from '../contexts/UserContext';
import { usersAPI } from '../apis/users.api';
import { useNavigate } from 'react-router-dom';

type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  jobId: string;
};

const ApplyModal: React.FC<ApplyModalProps> = ({ open, onClose, jobId }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(undefined);
  const [cvDataJson, setCvDataJson] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Prefill default CV from user's saved profile (cvUrl)
  useEffect(() => {
    let mounted = true;
    const prefill = async () => {
      if (!open) return;
      try {
        const me = await usersAPI.getMe();
        // Prefer stored cvUrl if available
        const defaultUrl: string | undefined = me?.cvUrl || undefined;
        if (mounted && defaultUrl) {
          setResumeUrl(defaultUrl);
        }
        // If there is cvData but no cvUrl, keep it for auto-generation
        if (!defaultUrl && me?.cvData && mounted) {
          try {
            const parsed = typeof me.cvData === 'string' ? JSON.parse(me.cvData) : me.cvData;
            setCvDataJson(parsed || null);
          } catch {
            setCvDataJson(null);
          }
        } else if (mounted) {
          setCvDataJson(null);
        }
        // Also prefill basic contact info if empty
        try {
          const current = form.getFieldsValue();
          const next: any = { ...current };
          if (!current.fullName && me?.fullName) next.fullName = me.fullName;
          if (!current.email && me?.email) next.email = me.email;
          if (!current.phone && me?.phone) next.phone = me.phone;
          form.setFieldsValue(next);
        } catch {}
      } catch {}
    };
    prefill();
    return () => { mounted = false };
  }, [open]);

  const handleSubmit = async () => {
    if (!user) {
      message.error('Vui lòng đăng nhập để ứng tuyển');
      return;
    }
    if (!jobId) {
      message.error('Không xác định được công việc. Vui lòng tải lại trang.');
      return;
    }
    // If no direct resumeUrl but we have cvData, auto-generate PDF and upload
    let finalResumeUrl = resumeUrl;
    if (!finalResumeUrl && cvDataJson) {
      try {
        setSubmitting(true);
        // Ensure libs
        const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src; s.async = true; s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load ' + src));
          document.body.appendChild(s);
        });
        if (!(window as any).html2canvas) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        if (!(window as any).jspdf) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        const html = cvDataJson.html || '<div />';
        const css = cvDataJson.css || '';
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
          if (heightLeft > 0) { pdf.addPage(); position = 0; }
        }
        const blob = pdf.output('blob') as Blob;
        const file = new File([blob], 'cv.pdf', { type: 'application/pdf' });
        const { url, downloadUrl } = await applicationsAPI.uploadResume(file);
        finalResumeUrl = downloadUrl || url;
        setResumeUrl(finalResumeUrl);
      } catch (err: any) {
        message.warning('Tạo CV từ hồ sơ thất bại. Vui lòng tạo CV PDF trong trang Hồ sơ.');
        onClose();
        navigate('/profile');
        setSubmitting(false);
        return;
      } finally {
        setSubmitting(false);
      }
    }
    if (!finalResumeUrl) {
      message.warning('Bạn chưa có CV trong hồ sơ. Vui lòng tạo CV trước.');
      onClose();
      navigate('/profile');
      return;
    }
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      await applicationsAPI.apply({
        jobId,
        note: values.intro,
        resumeUrl: finalResumeUrl,
      });
      message.success('Ứng tuyển thành công');
      onClose();
      form.resetFields();
      setResumeUrl(undefined);
    } catch (e: any) {
      if (e?.errorFields) return; // validation error
      const serverMsg = e?.response?.data?.message || e?.message;
      message.error(serverMsg || 'Ứng tuyển thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Ứng tuyển công việc
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Gửi ứng tuyển"
      confirmLoading={submitting}
    >
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>CV sẽ sử dụng</div>
          {resumeUrl || cvDataJson ? (
            <Alert
              type="success"
              message={
                <div>
                  {resumeUrl ? (
                    <>
                      Đang sử dụng CV mặc định từ hồ sơ.{' '}
                      <a href={resumeUrl} target="_blank" rel="noreferrer">Xem CV</a>
                    </>
                  ) : (
                    'Sẽ tự động sử dụng CV từ hồ sơ (cvData) khi gửi ứng tuyển.'
                  )}
                </div>
              }
              showIcon
            />
          ) : (
            <Alert
              type="warning"
              message="Bạn chưa có CV trong hồ sơ. Vui lòng tạo CV trước khi ứng tuyển."
              action={<Button size="small" onClick={() => { onClose(); navigate('/profile'); }}>Tạo CV ngay</Button>}
              showIcon
            />
          )}
        </div>

        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Họ tên hiển thị với NTD" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
            <Input placeholder="Email hiển thị với NTD" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input placeholder="Số điện thoại hiển thị với NTD" />
          </Form.Item>
          <Form.Item name="intro" label="Thư giới thiệu">
            <Input.TextArea rows={5} placeholder="Một thư giới thiệu ngắn gọn, chỉnh chu..." />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ApplyModal;


