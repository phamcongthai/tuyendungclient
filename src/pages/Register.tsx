import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  Space,
  Row,
  Col,
  Checkbox,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  SafetyOutlined,
  BankOutlined,
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import { authAPI } from '../apis/auth.api';
import type { RegisterData } from '../apis/auth.api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Title, Text, Paragraph } = Typography;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [showCompanyField, setShowCompanyField] = useState(false);

  const onFinish = async (values: RegisterData & { companyName?: string }) => {
    setLoading(true);
    try {
      let response;
      
      if (isRecruiter) {
        response = await authAPI.registerRecruiter(values);
      } else {
        response = await authAPI.register(values);
      }

      console.log('API Response:', response); // Debug log

      // Backend returns { message: "Đăng ký thành công...", user: {...} }
      // Check if the response has a success message
      const isSuccess = response && 
                       response.message && 
                       (response.message.toLowerCase().includes('thành công') || 
                        response.message.toLowerCase().includes('success'));

      if (isSuccess) {
        // Show success message with SweetAlert
        await Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Vui lòng kiểm tra email để xác thực tài khoản.',
          confirmButtonText: 'Đăng nhập ngay',
          confirmButtonColor: '#00b14f',
          allowOutsideClick: false,
          allowEscapeKey: false
        });
        
        // Redirect to login page
        navigate('/login');
      } else {
        // Show error message with SweetAlert
        const errorMessage = response?.message || 'Có lỗi xảy ra trong quá trình đăng ký';
        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: errorMessage,
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#ff4d4f'
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error); // Debug log
      
      // Show error message with SweetAlert
      let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Lỗi hệ thống',
        text: errorMessage,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#ff4d4f'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecruiterToggle = (checked: boolean) => {
    setIsRecruiter(checked);
    setShowCompanyField(checked);
    if (!checked) {
      form.setFieldsValue({ companyName: undefined });
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập mật khẩu'));
    }
    
    if (value.length < 8) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự'));
    }
    
    if (!/(?=.*[a-z])/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 chữ thường'));
    }
    
    if (!/(?=.*[A-Z])/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 chữ hoa'));
    }
    
    if (!/(?=.*\d)/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 số'));
    }
    
    return Promise.resolve();
  };

  const validateConfirmPassword = ({ getFieldValue }: any) => ({
    validator(_: any, value: string) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Mật khẩu không khớp'));
    },
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      
      <div style={{ 
        padding: '0', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'stretch',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <Row gutter={0} style={{ width: '100%', height: '100%' }}>
          {/* Left Column - Registration Form */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                width: '100%',
                borderRadius: '0',
                boxShadow: 'none',
                border: 'none',
                height: '100%',
                background: '#ffffff'
              }}
              bodyStyle={{ 
                padding: '60px 80px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/')}
                  style={{ 
                    position: 'absolute', 
                    left: '40px', 
                    top: '40px',
                    color: '#666',
                    fontSize: '16px'
                  }}
                >
                  Trang chủ
                </Button>
                
                <Title level={1} style={{ margin: '0 0 16px 0', color: '#00b14f', fontSize: '32px', fontWeight: '700' }}>
                  Chào mừng bạn đến với TopJobs
                </Title>
                <Paragraph style={{ color: '#666', margin: 0, fontSize: '18px', lineHeight: '1.6' }}>
                  Tạo tài khoản để khám phá cơ hội việc làm hấp dẫn
                </Paragraph>
              </div>

              {/* Recruiter Toggle */}
              <div style={{ marginBottom: '32px' }}>
                <Checkbox 
                  checked={isRecruiter}
                  onChange={(e) => handleRecruiterToggle(e.target.checked)}
                  style={{ fontSize: '16px' }}
                >
                  <Text strong>Đăng ký dành cho nhà tuyển dụng</Text>
                </Checkbox>
                {isRecruiter && (
                  <Alert
                    message="Tài khoản nhà tuyển dụng"
                    description="Bạn sẽ có thể đăng tin tuyển dụng, quản lý ứng viên và sử dụng các tính năng dành riêng cho doanh nghiệp."
                    type="info"
                    showIcon
                    style={{ marginTop: '16px' }}
                  />
                )}
              </div>

              {/* Form */}
              <Form
                form={form}
                name="register"
                onFinish={onFinish}
                layout="vertical"
                requiredMark={false}
                size="large"
              >
                <Form.Item
                  name="fullName"
                  label={<Text strong style={{ fontSize: '15px', color: '#1a1a1a' }}>Họ và tên</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên' },
                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: '#00b14f' }} />}
                    placeholder="Nhập họ và tên đầy đủ"
                    style={{ borderRadius: '8px', height: '52px', fontSize: '16px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<Text strong style={{ fontSize: '15px', color: '#1a1a1a' }}>Email</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined style={{ color: '#00b14f' }} />}
                    placeholder="example@email.com"
                    style={{ borderRadius: '8px', height: '52px', fontSize: '16px' }}
                  />
                </Form.Item>

                {showCompanyField && (
                  <Form.Item
                    name="companyName"
                    label={<Text strong style={{ fontSize: '15px', color: '#1a1a1a' }}>Tên công ty</Text>}
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên công ty' },
                      { min: 2, message: 'Tên công ty phải có ít nhất 2 ký tự' }
                    ]}
                  >
                    <Input 
                      prefix={<BankOutlined style={{ color: '#00b14f' }} />}
                      placeholder="Nhập tên công ty của bạn"
                      style={{ borderRadius: '8px', height: '52px', fontSize: '16px' }}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  name="password"
                  label={<Text strong style={{ fontSize: '15px', color: '#1a1a1a' }}>Mật khẩu</Text>}
                  rules={[
                    { validator: validatePassword }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: '#00b14f' }} />}
                    placeholder="Tạo mật khẩu mạnh"
                    style={{ borderRadius: '8px', height: '52px', fontSize: '16px' }}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label={<Text strong style={{ fontSize: '15px', color: '#1a1a1a' }}>Xác nhận mật khẩu</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                    validateConfirmPassword
                  ]}
                >
                  <Input.Password 
                    prefix={<SafetyOutlined style={{ color: '#00b14f' }} />}
                    placeholder="Nhập lại mật khẩu"
                    style={{ borderRadius: '8px', height: '52px', fontSize: '16px' }}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  name="agreement"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản sử dụng')),
                    },
                  ]}
                >
                  <Checkbox>
                    Tôi đã đọc và đồng ý với{' '}
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#00b14f' }}>
                      Điều khoản sử dụng
                    </a>
                    {' '}và{' '}
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#00b14f' }}>
                      Chính sách bảo mật
                    </a>
                  </Checkbox>
                </Form.Item>

                <Form.Item style={{ marginBottom: '32px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      background: '#00b14f',
                      border: 'none'
                    }}
                  >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                </Form.Item>
              </Form>

              {/* Divider */}
              <Divider>
                <Text type="secondary" style={{ fontSize: '16px' }}>Hoặc đăng ký bằng</Text>
              </Divider>

              {/* Social Login Buttons */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  size="large"
                  style={{
                    height: '52px',
                    borderRadius: '8px',
                    background: '#db4437',
                    border: 'none',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '16px'
                  }}
                >
                  Google
                </Button>
                <Button
                  block
                  size="large"
                  style={{
                    height: '52px',
                    borderRadius: '8px',
                    background: '#1877f2',
                    border: 'none',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '16px'
                  }}
                >
                  Facebook
                </Button>
                <Button
                  block
                  size="large"
                  style={{
                    height: '52px',
                    borderRadius: '8px',
                    background: '#0a66c2',
                    border: 'none',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '16px'
                  }}
                >
                  LinkedIn
                </Button>
              </Space>

              {/* Login Link */}
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Bạn đã có tài khoản?{' '}
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                    style={{ color: '#00b14f', fontWeight: '500' }}
                  >
                    Đăng nhập ngay
                  </a>
                </Text>
              </div>
            </Card>
          </Col>

          {/* Right Column - Branding */}
          <Col xs={24} lg={12}>
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 50%, #1a1a1a 100%)',
              height: '100%',
              borderRadius: '0',
              padding: '80px 60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Logo */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '40px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '30px'
                }}>
                  TopJobs
                </div>
              </div>

              {/* Main Content */}
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={1} style={{ 
                  color: 'white', 
                  margin: '0 0 20px 0',
                  fontSize: '42px',
                  fontWeight: '700',
                  lineHeight: '1.2'
                }}>
                  Tiếp lợi thế
                </Title>
                <Title level={1} style={{ 
                  color: 'white', 
                  margin: '0 0 30px 0',
                  fontSize: '42px',
                  fontWeight: '700',
                  lineHeight: '1.2'
                }}>
                  Nối thành công
                </Title>
                <Paragraph style={{ 
                  color: '#e2e8f0', 
                  margin: 0,
                  fontSize: '20px',
                  lineHeight: '1.6'
                }}>
                  TopJobs - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam
                </Paragraph>
              </div>

              {/* Bottom Info */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#a0aec0',
                  fontSize: '16px'
                }}>
                  <span>Bảo mật - Điều khoản</span>
                </div>
              </div>

              {/* Decorative Dots */}
              <div style={{
                position: 'absolute',
                top: '40px',
                right: '40px',
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, #00b14f 2px, transparent 2px)',
                backgroundSize: '16px 16px',
                opacity: 0.3
              }} />
            </div>
          </Col>
        </Row>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
