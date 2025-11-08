import React from 'react';
import { Card, Layout, Typography, Tag, List, Button, Row, Col, Statistic } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircleOutlined, HomeOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const CATEGORY_NAMES: Record<string, string> = {
  R: 'Realistic (Thực tế)',
  I: 'Investigative (Nghiên cứu)',
  A: 'Artistic (Nghệ thuật)',
  S: 'Social (Xã hội)',
  E: 'Enterprising (Kinh doanh)',
  C: 'Conventional (Truyền thống)',
};

const HollandResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <Layout>
        <Header />
        <Layout.Content style={{ padding: '50px', textAlign: 'center' }}>
          <Title level={3}>Không tìm thấy kết quả</Title>
          <Button type="primary" onClick={() => navigate('/holland-test')}>
            Làm trắc nghiệm
          </Button>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  const { scores, topCode, profile } = result;

  // Prepare scores data
  const scoresArray = Object.entries(scores).map(([key, value]) => ({
    category: key,
    name: CATEGORY_NAMES[key as keyof typeof CATEGORY_NAMES],
    value: value as number,
  }));

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#f5f5f5', minHeight: '80vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Success Header */}
          <Card style={{ marginBottom: 24, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
              Hoàn thành trắc nghiệm!
            </Title>
            <Text style={{ fontSize: 16, color: 'white' }}>
              Dưới đây là kết quả phân tích tính cách nghề nghiệp của bạn
            </Text>
          </Card>

          {/* Top Code */}
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Title level={3}>Mã Holland của bạn</Title>
            <Tag color="blue" style={{ fontSize: 24, padding: '8px 24px', marginTop: 16 }}>
              {topCode}
            </Tag>
            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              3 nhóm tính cách nổi bật nhất của bạn
            </Paragraph>
          </Card>

          {/* Scores Display */}
          <Card title="Điểm số phân tích RIASEC" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              {scoresArray.map((item) => (
                <Col key={item.category} xs={12} sm={8} md={4}>
                  <Statistic
                    title={`${item.category} - ${item.name.split(' ')[0]}`}
                    value={item.value}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              ))}
            </Row>
          </Card>

          {/* Profile Details */}
          {profile && (
            <Card title="Phân tích chi tiết" style={{ marginBottom: 24 }}>
              <Title level={4}>{profile.title}</Title>
              <Paragraph>{profile.description}</Paragraph>

              {profile.suitableCareers && profile.suitableCareers.length > 0 && (
                <>
                  <Title level={5} style={{ marginTop: 24 }}>
                    Nghề nghiệp phù hợp
                  </Title>
                  <List
                    dataSource={profile.suitableCareers}
                    renderItem={(item: string) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </>
              )}

              {profile.suggestedSkills && profile.suggestedSkills.length > 0 && (
                <>
                  <Title level={5} style={{ marginTop: 24 }}>
                    Kỹ năng nên phát triển
                  </Title>
                  <div style={{ marginTop: 12 }}>
                    {profile.suggestedSkills.map((skill: string, idx: number) => (
                      <Tag key={idx} color="green" style={{ marginBottom: 8 }}>
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )}

          {/* Actions */}
          <Card style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>
            <Button
              size="large"
              style={{ marginLeft: 16 }}
              onClick={() => navigate('/search')}
            >
              Tìm việc phù hợp
            </Button>
          </Card>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
};

export default HollandResult;
