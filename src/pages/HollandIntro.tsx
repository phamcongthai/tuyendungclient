import React from 'react';
import { Button, Card, Layout, Typography, Row, Col, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  ExperimentOutlined, 
  CheckCircleOutlined, 
  RocketOutlined,
  BulbOutlined,
  HeartOutlined,
  TeamOutlined,
  TrophyOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HollandIntro: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      key: 'R',
      title: 'R - Nhóm người Kỹ thuật (Realistic)',
      icon: <ExperimentOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      description: 'Thích làm với những vật cụ thể, máy móc, dụng cụ, cây cối, con vật hoặc các hoạt động ngoài trời.',
      color: '#e6f7ff',
    },
    {
      key: 'I',
      title: 'I - Nhóm người Nghiên cứu (Investigative)',
      icon: <BulbOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      description: 'Thích quan sát, tìm tòi, điều tra, phân tích, đánh giá hoặc giải quyết vấn đề.',
      color: '#f6ffed',
    },
    {
      key: 'A',
      title: 'A - Nhóm người Nghệ thuật (Artistic)',
      icon: <RocketOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      description: 'Có khả năng nghệ thuật, sáng tác, trực giác và thích làm việc trong các tình huống không có kế hoạch trước như dùng trí tưởng tượng và sáng tạo.',
      color: '#f9f0ff',
    },
    {
      key: 'S',
      title: 'S - Nhóm người Xã hội (Social)',
      icon: <HeartOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      description: 'Thích làm việc cung cấp hoặc làm sáng tỏ thông tin, thích giúp đỡ, huấn luyện, chữa trị hoặc chăm sóc sức khỏe cho người khác, có khả năng về ngôn ngữ.',
      color: '#fff7e6',
    },
    {
      key: 'E',
      title: 'E - Nhóm người Quản lý (Enterprising)',
      icon: <TrophyOutlined style={{ fontSize: 48, color: '#f5222d' }} />,
      description: 'Thích làm việc với những người khác, có khả năng tác động, thuyết phục, thể hiện, lãnh đạo hoặc quản lý các mục tiêu của tổ chức, các lợi ích kinh tế.',
      color: '#fff1f0',
    },
    {
      key: 'C',
      title: 'C - Nghiệp vụ (Conventional)',
      icon: <FileTextOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
      description: 'Thích làm việc với dữ liệu, con số, có khả năng làm việc văn phòng, thống kê, thực hiện các công việc đòi hỏi chi tiết, tỉ mỉ, cẩn thận hoặc làm theo hướng dẫn của người khác.',
      color: '#e6fffb',
    },
  ];

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#f5f5f5', minHeight: '80vh' }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '60px 20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <TeamOutlined style={{ fontSize: 72, marginBottom: 24 }} />
            <Title level={1} style={{ color: 'white', fontSize: 42, marginBottom: 16 }}>
              Trắc nghiệm định hướng nghề nghiệp Holland
            </Title>
            <Title level={3} style={{ color: 'white', fontWeight: 400, marginBottom: 0 }}>
              Khám phá tính cách và tìm ra nghề nghiệp phù hợp với bạn
            </Title>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          {/* Giới thiệu */}
          <Card style={{ marginBottom: 32 }}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src="https://huongnghiepaau.edu.vn/wp-content/uploads/2022/02/John-Holland.jpg"
                    alt="John L. Holland"
                    style={{ 
                      width: '100%', 
                      maxWidth: 300,
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Text style={{ display: 'block', marginTop: 12, fontStyle: 'italic', color: '#666' }}>
                    Tiến sỹ John L. Holland (1919 – 2008)
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={16}>
                <Title level={2}>Trắc nghiệm Holland là gì?</Title>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                  <strong>John L. Holland</strong> (1919 – 2008) là tiến sỹ tâm lý học người Mỹ. John Holland nổi tiếng nhất 
                  và biết đến rộng rãi nhất qua nghiên cứu <strong>Lý thuyết lựa chọn nghề nghiệp</strong>.
                </Paragraph>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                  Mô hình lý thuyết nghề nghiệp của ông đã được sử dụng trong thực tiễn hướng nghiệp tại nhiều nước trên thế giới 
                  và được đánh giá rất cao về tính chính xác trong việc khám phá, lựa chọn ngành, nghề phù hợp tính cách, sở thích của bản thân.
                </Paragraph>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                  Học thuyết của John Holland đã lập luận rằng: <strong>"Thiên hướng nghề nghiệp chính là sự biểu hiện cá tính của mỗi con người"</strong> 
                  và nó được phân loại thành 6 nhóm và được diễn tả ở hai phương diện: tính cách con người và môi trường làm việc.
                </Paragraph>
              </Col>
            </Row>
          </Card>

          {/* Lý thuyết mật mã Holland */}
          <Card style={{ marginBottom: 32, background: '#f0f5ff' }}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={12}>
                <Title level={2}>Lý thuyết mật mã Holland (RIASEC)</Title>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                  Lý thuyết Lựa chọn nghề nghiệp chia con người ra <strong>6 loại cá tính</strong> và thường được viết tắt là 
                  <strong> RIASEC</strong> và được gọi là <strong>mật mã Holland (Holland codes)</strong>.
                </Paragraph>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                  John Holland đã sắp xếp sáu loại tính cách này vào một lục giác dựa trên sở thích làm việc với những tác nhân kích thích 
                  khác nhau gồm: <strong>con người, dữ liệu, đồ vật và ý tưởng</strong>.
                </Paragraph>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src="https://media-blog.jobsgo.vn/blog/wp-content/uploads/2023/04/trac-nghiem-holland.jpg"
                    alt="Lục giác Holland RIASEC"
                    style={{ 
                      width: '100%', 
                      maxWidth: 450,
                      borderRadius: 12,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }}
                  />
                  <Text style={{ display: 'block', marginTop: 12, fontStyle: 'italic', color: '#666' }}>
                    Mô hình lục giác Holland RIASEC
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* 6 nhóm tính cách */}
          <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
            6 Nhóm tính cách RIASEC
          </Title>
          
          <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
            {categories.map((cat) => (
              <Col key={cat.key} xs={24} sm={12} lg={8}>
                <Card 
                  style={{ 
                    height: '100%',
                    background: cat.color,
                    border: '2px solid #f0f0f0',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  hoverable
                >
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    {cat.icon}
                  </div>
                  <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>
                    {cat.title}
                  </Title>
                  <Paragraph style={{ fontSize: 15, lineHeight: 1.6, textAlign: 'center' }}>
                    {cat.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Lợi ích */}
          <Card style={{ marginBottom: 32 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
              Lợi ích khi làm trắc nghiệm Holland
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Space align="start" size={16}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Title level={4} style={{ marginBottom: 8 }}>Hiểu rõ bản thân</Title>
                    <Text style={{ fontSize: 15 }}>
                      Khám phá tính cách, sở thích và năng lực tự nhiên của bạn
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space align="start" size={16}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Title level={4} style={{ marginBottom: 8 }}>Định hướng nghề nghiệp</Title>
                    <Text style={{ fontSize: 15 }}>
                      Tìm ra những nghề nghiệp phù hợp với tính cách của bạn
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space align="start" size={16}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Title level={4} style={{ marginBottom: 8 }}>Lựa chọn ngành học</Title>
                    <Text style={{ fontSize: 15 }}>
                      Giúp bạn chọn ngành học phù hợp khi vào đại học
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space align="start" size={16}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Title level={4} style={{ marginBottom: 8 }}>Phát triển sự nghiệp</Title>
                    <Text style={{ fontSize: 15 }}>
                      Xác định con đường phát triển sự nghiệp phù hợp
                    </Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* CTA */}
          <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
            <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
              Sẵn sàng khám phá bản thân?
            </Title>
            <Paragraph style={{ color: 'white', fontSize: 16, marginBottom: 24 }}>
              Chỉ mất 10-15 phút để hoàn thành bài trắc nghiệm và nhận kết quả ngay lập tức
            </Paragraph>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate('/holland-test')}
              style={{ 
                height: 56, 
                fontSize: 18, 
                padding: '0 48px',
                background: '#00b14f',
                border: 'none'
              }}
            >
              Bắt đầu ngay
            </Button>
          </Card>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
};

export default HollandIntro;
