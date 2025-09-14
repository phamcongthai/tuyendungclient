import React, { useState } from 'react';
import { Card, Typography, Steps, message } from 'antd';
import { FileImageOutlined, EditOutlined } from '@ant-design/icons';
import CVTemplateSelector from '../../components/CVBuilder/CVTemplateSelector';
import CVBuilder from '../../components/CVBuilder/CVBuilder';
import { type CVSampleData } from '../../apis/cv-samples.api';
import { cvBuilderAPI } from '../../apis/cv-builder.api';

const { Title } = Typography;

const CVBuilderPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<CVSampleData | null>(null);

  const steps = [
    {
      title: 'Chọn mẫu CV',
      icon: <FileImageOutlined />,
    },
    {
      title: 'Tạo CV',
      icon: <EditOutlined />,
    },
  ];

  const handleSelectTemplate = (template: CVSampleData) => {
    setSelectedTemplate(template);
  };

  const handleNext = () => {
    setCurrentStep(1);
  };

  const handleBack = () => {
    setCurrentStep(0);
  };

  const handleSave = async (cvData: { cvId: string; cvFields: any }) => {
    try {
      await cvBuilderAPI.saveCv(cvData);
      message.success('CV đã được lưu thành công!');
    } catch (error: any) {
      console.error('Error saving CV:', error);
      message.error('Lỗi khi lưu CV: ' + (error?.response?.data?.message || error?.message || ''));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CVTemplateSelector
            onSelectTemplate={handleSelectTemplate}
            onNext={handleNext}
          />
        );
      case 1:
        return selectedTemplate ? (
          <CVBuilder
            template={selectedTemplate}
            onBack={handleBack}
            onSave={handleSave}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0 }}>
              Tạo CV Chuyên Nghiệp
            </Title>
          </div>
          
          <Steps
            current={currentStep}
            items={steps}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          />
        </Card>

        <Card style={{ borderRadius: '12px', minHeight: '600px' }}>
          {renderStepContent()}
        </Card>
      </div>
    </div>
  );
};

export default CVBuilderPage;
