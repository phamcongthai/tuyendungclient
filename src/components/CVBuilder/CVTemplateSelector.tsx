import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Image,
  Spin,
  message,
  Space,
} from 'antd';
import {
  ArrowRightOutlined,
  EyeOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { fetchActiveCVSamples, type CVSampleData } from '../../apis/cv-samples.api';

const { Title, Text } = Typography;

interface CVTemplateSelectorProps {
  onSelectTemplate: (template: CVSampleData) => void;
  onNext: () => void;
}

const CVTemplateSelector: React.FC<CVTemplateSelectorProps> = ({
  onSelectTemplate,
  onNext,
}) => {
  const [templates, setTemplates] = useState<CVSampleData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CVSampleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

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
    onSelectTemplate(template);
  };

  const handleNext = () => {
    if (!selectedTemplate) {
      message.warning('Vui lòng chọn một mẫu CV');
      return;
    }
    onNext();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải danh sách mẫu CV...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2}>
          <FileImageOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Chọn Mẫu CV
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Chọn một mẫu CV phù hợp để bắt đầu tạo CV của bạn
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {templates.map((template) => (
          <Col xs={24} sm={12} md={8} lg={6} key={template._id}>
            <Card
              hoverable
              style={{
                height: '100%',
                border: selectedTemplate?._id === template._id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '16px' }}
              onClick={() => handleSelectTemplate(template)}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '12px' }}>
                  <Image
                    src={template.demoImage || '/placeholder-cv.svg'}
                    alt={template.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                    }}
                    fallback="/placeholder-cv.svg"
                    preview={{
                      mask: <EyeOutlined style={{ fontSize: '20px' }} />,
                    }}
                  />
                </div>
                
                <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  {template.name}
                </Title>
                
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {template.title}
                </Text>
                
                {template.description && (
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {template.description.length > 60 
                        ? `${template.description.substring(0, 60)}...` 
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
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Card style={{ display: 'inline-block', borderRadius: '12px' }}>
            <Space direction="vertical" size="middle">
              <div>
                <Text strong>Mẫu đã chọn: </Text>
                <Text style={{ color: '#1890ff' }}>{selectedTemplate.name}</Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleNext}
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  fontSize: '16px',
                }}
              >
                Tiếp tục tạo CV
              </Button>
            </Space>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CVTemplateSelector;
