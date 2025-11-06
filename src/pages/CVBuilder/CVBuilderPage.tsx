import React, { useState, useEffect } from 'react';
import { Card, Typography, Steps, message, Spin } from 'antd';
import { FileImageOutlined, EditOutlined } from '@ant-design/icons';
import CVTemplateSelector from '../../components/CVBuilder/CVTemplateSelector';
import CVBuilder from '../../components/CVBuilder/CVBuilder';
import { type CVSampleData } from '../../apis/cv-samples.api';
import { cvBuilderAPI } from '../../apis/cv-builder.api';

const { Title } = Typography;

const CVBuilderPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<CVSampleData | null>(null);
  const [existingCvData, setExistingCvData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Load existing CV on mount
  useEffect(() => {
    loadExistingCv();
  }, []);

  const loadExistingCv = async () => {
    try {
      setLoading(true);
      const userCvData = await cvBuilderAPI.getUserCv();
      
      // If user has an existing CV
      if (userCvData && userCvData.cvId) {
        setIsEditMode(true);
        setExistingCvData(userCvData);
        
        // Load the template details
        const templateId = typeof userCvData.cvId === 'string' 
          ? userCvData.cvId 
          : userCvData.cvId._id;
        
        const template = await cvBuilderAPI.getTemplate(templateId);
        setSelectedTemplate(template);
        
        // Skip template selection, go directly to editor
        setCurrentStep(1);
        
        message.info('Đang chỉnh sửa CV của bạn');
      } else {
        // No existing CV, start fresh
        setIsEditMode(false);
      }
    } catch (error: any) {
      console.error('Error loading existing CV:', error);
      // If no CV exists or error, just start fresh
      setIsEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: CVSampleData) => {
    console.log('[CVBuilderPage] Template selected', {
      templateId: template?._id,
      hasHtml: !!template?.html,
      hasCss: !!template?.css,
    });
    setSelectedTemplate(template);
    // Auto-advance to editor when a template is selected
    setCurrentStep(1);
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
      // Try update if creation failed (e.g., CV exists)
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error?.message || '';
      try {
        if (status === 409 || /exists|tồn tại|duplicate/i.test(msg || '')) {
          await cvBuilderAPI.updateCv(cvData);
          message.success('CV đã được cập nhật thành công!');
          return;
        }
      } catch (e) {
        console.error('Error updating CV:', e);
        message.error('Lỗi khi cập nhật CV: ' + (e as any)?.response?.data?.message || (e as any)?.message || '');
        return;
      }
      console.error('Error saving CV:', error);
      message.error('Lỗi khi lưu CV: ' + msg);
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
            existingCvData={existingCvData}
            isEditMode={isEditMode}
            onBack={handleBack}
            onSave={handleSave}
          />
        ) : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Typography.Text>Đang tải dữ liệu CV...</Typography.Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0 }}>
              {isEditMode ? 'Chỉnh Sửa CV' : 'Tạo CV Chuyên Nghiệp'}
            </Title>
          </div>
          
          {!isEditMode && (
            <Steps
              current={currentStep}
              items={steps}
              style={{ maxWidth: '600px', margin: '0 auto' }}
            />
          )}
        </Card>

        <Card style={{ borderRadius: '12px', minHeight: '600px' }}>
          {renderStepContent()}
        </Card>
      </div>
    </div>
  );
};

export default CVBuilderPage;
