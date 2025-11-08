import React, { useEffect, useState } from 'react';
import { Button, Card, Radio, Progress, Layout, Typography, message, Spin, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { hollandAPI } from '../apis/holland.api';
import type { HollandQuestion } from '../apis/holland.api';
import { useUser } from '../contexts/UserContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Title, Text, Paragraph } = Typography;

const HollandTest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [questions, setQuestions] = useState<HollandQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await hollandAPI.getQuestions();
      setQuestions(data.questions || []);
    } catch (error: any) {
      message.error('Không thể tải câu hỏi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[currentIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: value
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để lưu kết quả');
      navigate('/login');
      return;
    }

    // Kiểm tra đã trả lời hết chưa
    const unanswered = questions.filter(q => answers[q._id] === undefined);
    if (unanswered.length > 0) {
      message.warning(`Bạn còn ${unanswered.length} câu chưa trả lời`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await hollandAPI.submitTest(answers);
      message.success('Đã lưu kết quả!');
      navigate('/holland-result', { state: { result } });
    } catch (error: any) {
      message.error('Lỗi khi gửi kết quả: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Header />
        <Layout.Content style={{ padding: '50px', textAlign: 'center' }}>
          <Spin size="large" />
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <Header />
        <Layout.Content style={{ padding: '50px', textAlign: 'center' }}>
          <Title level={3}>Chưa có câu hỏi nào</Title>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((Object.keys(answers).length / questions.length) * 100).toFixed(0);

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#f5f5f5', minHeight: '80vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Title level={2}>Trắc nghiệm tính cách Holland (RIASEC)</Title>
            <Paragraph type="secondary">
              Trả lời {questions.length} câu hỏi để khám phá tính cách nghề nghiệp của bạn
            </Paragraph>
            <Progress percent={Number(progress)} status="active" />
            <Text type="secondary">
              Đã trả lời: {Object.keys(answers).length}/{questions.length}
            </Text>
          </Card>

          {/* Question Card */}
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Câu {currentIndex + 1}/{questions.length}</Text>
                <Title level={4} style={{ marginTop: 8 }}>
                  {currentQuestion.content}
                </Title>
              </div>

              <Radio.Group
                value={answers[currentQuestion._id]}
                onChange={(e) => handleAnswer(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {currentQuestion.options.map((opt) => (
                    <Radio key={opt.value} value={opt.value} style={{ fontSize: 16, padding: '8px 0' }}>
                      {opt.label}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <Button
                  size="large"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  Câu trước
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    disabled={answers[currentQuestion._id] === undefined}
                  >
                    Câu tiếp theo
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={Object.keys(answers).length < questions.length}
                  >
                    Hoàn thành
                  </Button>
                )}
              </div>
            </Space>
          </Card>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
};

export default HollandTest;
