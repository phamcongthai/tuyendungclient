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
  const [hasCv, setHasCv] = useState<boolean>(false);
  const [cvId, setCvId] = useState<string | null>(null);
  const [cvFields, setCvFields] = useState<Record<string, string> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Prefill CV data from user's saved profile
  useEffect(() => {
    let mounted = true;
    const prefill = async () => {
      if (!open) return;
      try {
        const me = await usersAPI.getMe();
        
        // Check if user has CV (cvId and cvFields)
        if (me?.cvId && me?.cvFields) {
          if (mounted) {
            setHasCv(true);
            setCvId(me.cvId);
            setCvFields(me.cvFields);
          }
        } else {
          if (mounted) {
            setHasCv(false);
            setCvId(null);
            setCvFields(null);
          }
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
    if (!hasCv || !cvId || !cvFields) {
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
        coverLetter: values.intro,
      });
      message.success('Ứng tuyển thành công');
      onClose();
      form.resetFields();
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
          {hasCv ? (
            <Alert
              type="success"
              message="Đang sử dụng CV từ hồ sơ của bạn. CV sẽ được hiển thị cho nhà tuyển dụng."
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


