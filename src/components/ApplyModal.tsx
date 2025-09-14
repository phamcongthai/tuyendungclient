import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Button, Alert } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
// import { uploadToCloudinary } from '../utils/cloudinary';
import { applicationsAPI } from '../apis/applications.api';
import { useUser } from '../contexts/UserContext';
import { usersAPI } from '../apis/users.api';
import { useNavigate } from 'react-router-dom';

type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onApplicationSuccess?: () => void;
};

const ApplyModal: React.FC<ApplyModalProps> = ({ open, onClose, jobId, onApplicationSuccess }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [hasCv, setHasCv] = useState<boolean>(false);
  const [cvId, setCvId] = useState<string | null>(null);
  const [cvFields, setCvFields] = useState<Record<string, string> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Prefill CV data from user's saved profile and check application status
  useEffect(() => {
    let mounted = true;
    const prefill = async () => {
      if (!open || !jobId) return;
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
        
        // Check if user has already applied for this job
        try {
          const applicationStatus = await applicationsAPI.checkApplication(jobId);
          if (mounted) {
            setHasApplied(applicationStatus.hasApplied || false);
          }
        } catch (error) {
          console.error('Error checking application status:', error);
          if (mounted) {
            setHasApplied(false);
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
  }, [open, jobId]);

  const handleSubmit = async () => {
    if (!user) {
      message.error('Vui lòng đăng nhập để ứng tuyển');
      return;
    }
    if (!jobId) {
      message.error('Không xác định được công việc. Vui lòng tải lại trang.');
      return;
    }
    if (hasApplied) {
      message.warning('Bạn đã ứng tuyển công việc này rồi!');
      onClose();
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
      
      // Gọi callback để cập nhật trạng thái
      if (onApplicationSuccess) {
        onApplicationSuccess();
      }
      
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
      onOk={hasApplied ? undefined : handleSubmit}
      okText={hasApplied ? "Đã ứng tuyển" : "Gửi ứng tuyển"}
      confirmLoading={submitting}
      okButtonProps={{ disabled: hasApplied }}
    >
      <div style={{ display: 'grid', gap: 16 }}>
        {hasApplied ? (
          <Alert
            type="success"
            message="Bạn đã ứng tuyển công việc này"
            description="Bạn đã gửi đơn ứng tuyển cho công việc này. Vui lòng chờ phản hồi từ nhà tuyển dụng."
            icon={<CheckCircleOutlined />}
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <>
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
          </>
        )}

        {!hasApplied && (
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
        )}
      </div>
    </Modal>
  );
};

export default ApplyModal;


