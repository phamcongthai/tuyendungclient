import React, { useState, useEffect } from 'react';
import {
  Modal,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Image,
  Spin,
  message,
  Space,
} from 'antd';
import {
  FileImageOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { fetchActiveCVSamples, type CVSampleData } from '../apis/cv-samples.api';

const { Title, Text } = Typography;

interface CVTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CVSampleData) => void;
}

const CVTemplateModal: React.FC<CVTemplateModalProps> = ({
  open,
  onClose,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<CVSampleData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CVSampleData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchActiveCVSamples();
      setTemplates(data);
    } catch (error) {
      message.error('Không thể tải danh sách mẫu CV');
      console.error('Error loading CV templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: CVSampleData) => {
    setSelectedTemplate(template);
  };

  const handleCreateCV = () => {
    if (!selectedTemplate) {
      message.warning('Vui lòng chọn một mẫu CV');
      return;
    }
    onSelectTemplate(selectedTemplate);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <FileImageOutlined style={{ color: '#1890ff' }} />
          <span>Chọn Mẫu CV</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<EditOutlined />}
          onClick={handleCreateCV}
          disabled={!selectedTemplate}
        >
          Tạo CV theo mẫu
        </Button>,
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Đang tải danh sách mẫu CV...</Text>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Text type="secondary">
                Chọn một mẫu CV phù hợp để bắt đầu tạo CV của bạn
              </Text>
            </div>

            <Row gutter={[16, 16]}>
              {templates.map((template) => (
                <Col xs={24} sm={12} md={8} key={template._id}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      border: selectedTemplate?._id === template._id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    bodyStyle={{ padding: '12px' }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Image
                          src={template.demoImage || '/placeholder-cv.svg'}
                          alt={template.name}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #f0f0f0',
                          }}
                          fallback="/placeholder-cv.svg"
                          preview={{
                            mask: <EyeOutlined style={{ fontSize: '16px' }} />,
                          }}
                        />
                      </div>
                      
                      <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                        {template.name}
                      </Title>
                      
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {template.title}
                      </Text>
                      
                      {template.description && (
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {template.description.length > 50 
                              ? `${template.description.substring(0, 50)}...` 
                              : template.description
                            }
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {templates.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <FileImageOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">Không có mẫu CV nào khả dụng</Text>
                </div>
              </div>
            )}

            {selectedTemplate && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f', 
                borderRadius: '6px' 
              }}>
                <Space>
                  <Text strong>Mẫu đã chọn: </Text>
                  <Text style={{ color: '#1890ff' }}>{selectedTemplate.name}</Text>
                </Space>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default CVTemplateModal;
