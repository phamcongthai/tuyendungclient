import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  Space,
  Checkbox,
  Row,
  Col
} from 'antd';
import { 
  MailOutlined, 
  LockOutlined, 
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import { authAPI } from '../apis/auth.api';
import type { LoginData } from '../apis/auth.api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../contexts/UserContext';

const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, user, loading: userLoading } = useUser();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!userLoading && user) {
      navigate('/');
    }
  }, [userLoading, user, navigate]);

  const onFinish = async (values: LoginData) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values);

      console.log('Login API Response:', response); // Debug log

      // Backend returns { user: {...} } on success
      // Check if response has user data (successful login)
      if (response && response.user) {
        console.log('Login - Response user data:', response.user);
        console.log('Login - isVerified value:', response.user.isVerified);
        
        // Update user context
        login(response.user);
        
        // Show success message with SweetAlert
        await Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          text: `Chào mừng ${response.user.fullName} quay trở lại HiWork`,
          confirmButtonText: 'Tiếp tục',
          confirmButtonColor: '#00b14f',
          timer: 2000,
          timerProgressBar: true
        });
        
        // Token is automatically set in HTTP-only cookie by backend
        // No need to manually store token in localStorage
        
        navigate('/');
      } else {
        // Show error message with SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: 'Email hoặc mật khẩu không chính xác',
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#ff4d4f'
        });
      }
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      
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

  // Avoid rendering the login form while checking auth state
  if (userLoading) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      
      <div style={{ 
        padding: '40px 20px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: 'calc(100vh - 140px)'
      }}>
        <Row gutter={0} style={{ width: '100%', maxWidth: '1000px' }}>
          {/* Left Column - Login Form */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: 'none',
                height: '100%'
              }}
              bodyStyle={{ padding: '40px' }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/')}
                  style={{ 
                    position: 'absolute', 
                    left: '0', 
                    top: '0',
                    color: '#666'
                  }}
                >
                  Trang chủ
                </Button>
                
                <Title level={2} style={{ margin: '0 0 8px 0', color: '#00b14f', fontSize: '28px' }}>
                  Chào mừng bạn quay trở lại
                </Title>
                <Paragraph style={{ color: '#666', margin: 0, fontSize: '16px' }}>
                  Đăng nhập để tiếp tục khám phá cơ hội việc làm
                </Paragraph>
              </div>

              {/* Form */}
              <Form
                form={form}
                name="login"
                onFinish={onFinish}
                layout="vertical"
                requiredMark={false}
                size="large"
              >
                <Form.Item
                  name="email"
                  label={<Text strong style={{ fontSize: '14px' }}>Email</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined style={{ color: '#00b14f' }} />}
                    placeholder="example@email.com"
                    style={{ borderRadius: '8px', height: '48px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<Text strong style={{ fontSize: '14px' }}>Mật khẩu</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: '#00b14f' }} />}
                    placeholder="Nhập mật khẩu của bạn"
                    style={{ borderRadius: '8px', height: '48px' }}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    >
                      <Text style={{ fontSize: '14px' }}>Ghi nhớ đăng nhập</Text>
                    </Checkbox>
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      style={{ color: '#00b14f', fontSize: '14px' }}
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                </Form.Item>

                <Form.Item style={{ marginBottom: '24px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: '#00b14f',
                      border: 'none'
                    }}
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </Form.Item>
              </Form>

              {/* Divider */}
              <Divider>
                <Text type="secondary">Hoặc đăng nhập bằng</Text>
              </Divider>

              {/* Social Login Buttons */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  size="large"
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    background: '#db4437',
                    border: 'none',
                    color: 'white',
                    fontWeight: '500'
                  }}
                >
                  Google
                </Button>
                <Button
                  block
                  size="large"
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    background: '#1877f2',
                    border: 'none',
                    color: 'white',
                    fontWeight: '500'
                  }}
                >
                  Facebook
                </Button>
                <Button
                  block
                  size="large"
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    background: '#0a66c2',
                    border: 'none',
                    color: 'white',
                    fontWeight: '500'
                  }}
                >
                  LinkedIn
                </Button>
              </Space>

              {/* Register Link */}
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Chưa có tài khoản?{' '}
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/register'); }}
                    style={{ color: '#00b14f', fontWeight: '500' }}
                  >
                    Đăng ký ngay
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
              borderRadius: '12px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Logo */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '20px'
                }}>
                  HiWork
                </div>
              </div>

              {/* Main Content */}
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={1} style={{ 
                  color: 'white', 
                  margin: '0 0 16px 0',
                  fontSize: '36px',
                  fontWeight: '700'
                }}>
                  Tiếp lợi thế
                </Title>
                <Title level={1} style={{ 
                  color: 'white', 
                  margin: '0 0 24px 0',
                  fontSize: '36px',
                  fontWeight: '700'
                }}>
                  Nối thành công
                </Title>
                <Paragraph style={{ 
                  color: '#e2e8f0', 
                  margin: 0,
                  fontSize: '18px',
                  lineHeight: '1.6'
                }}>
                  HiWork - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam
                </Paragraph>
              </div>

              {/* Bottom Info */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#a0aec0',
                  fontSize: '14px'
                }}>
                  <span>Bảo mật - Điều khoản</span>
                </div>
              </div>

              {/* Decorative Dots */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, #00b14f 2px, transparent 2px)',
                backgroundSize: '12px 12px',
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

export default Login;
