import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Layout, List, Select, Space, Tag, Typography, Tooltip, Avatar, Popconfirm, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI, type ApplicationItem, type ApplicationStatus } from '../apis/applications.api';
import { useUser } from '../contexts/UserContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileTextOutlined, ClockCircleOutlined, StopOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Đã ứng tuyển',
  viewed: 'NTD đã xem hồ sơ',
  shortlisted: 'Hồ sơ phù hợp',
  accepted: 'Đã nhận',
  rejected: 'Bị từ chối',
  withdrawn: 'Đã rút đơn',
  interviewed: 'Đã phỏng vấn',
  interview_failed: 'Rớt phỏng vấn',
};

const STATUS_COLORS: Partial<Record<ApplicationStatus, string>> = {
  pending: 'default',
  viewed: 'processing',
  shortlisted: 'success',
  accepted: 'green',
  rejected: 'red',
  withdrawn: 'warning',
  interviewed: 'blue',
  interview_failed: 'red',
};

const AppliedJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<ApplicationStatus | undefined>(undefined);

  const filteredApplications = useMemo(() => {
    if (!status) return applications;
    return applications.filter(a => a.status === status);
  }, [applications, status]);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await applicationsAPI.listByUser({ userId: user.id, page, limit });
      setApplications(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      setApplications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      await applicationsAPI.withdraw(id);
      await load();
    } catch {}
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, page, limit]);

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#F3F5F7', minHeight: '60vh' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          padding: '36px 0',
          color: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ opacity: 0.9, fontWeight: 600, letterSpacing: 0.3 }}>Hồ sơ ứng tuyển</div>
              <h1 style={{ margin: '6px 0 0 0', fontSize: 28, fontWeight: 800 }}>Việc làm đã ứng tuyển</h1>
            </div>
            <Select
              placeholder="Trạng thái"
              value={status}
              onChange={(v) => setStatus(v as ApplicationStatus | undefined)}
              allowClear
              style={{ minWidth: 220, background: 'white', borderRadius: 8 }}
              options={[
                { label: 'Tất cả', value: undefined },
                { label: STATUS_LABELS.pending, value: 'pending' },
                { label: STATUS_LABELS.viewed, value: 'viewed' },
                { label: STATUS_LABELS.shortlisted, value: 'shortlisted' },
                { label: STATUS_LABELS.accepted, value: 'accepted' },
                { label: STATUS_LABELS.rejected, value: 'rejected' },
                { label: STATUS_LABELS.withdrawn, value: 'withdrawn' },
                { label: STATUS_LABELS.interviewed, value: 'interviewed' },
                { label: STATUS_LABELS.interview_failed, value: 'interview_failed' },
              ]}
            />
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px' }}>
          {loading ? (
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          ) : (!loading && (applications.length === 0 || filteredApplications.length === 0)) ? (
            <Card style={{ textAlign: 'center', padding: '36px' }}>
              <Avatar size={72} style={{ background: '#e6fffb', color: '#08979c' }} icon={<FileTextOutlined />} />
              <div style={{ marginTop: 16 }}>
                <Title level={4} style={{ marginBottom: 4 }}>Bạn chưa ứng tuyển công việc nào!</Title>
                <Text type="secondary">Bắt đầu sự nghiệp mơ ước với hàng nghìn việc làm chất lượng tại TopCV</Text>
              </div>
              <Button type="primary" size="large" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>
                Tìm việc ngay
              </Button>
            </Card>
          ) : (
            <Card style={{ borderRadius: 16 }}>
              <List
                dataSource={filteredApplications}
                pagination={{
                  current: page,
                  pageSize: limit,
                  total: status ? filteredApplications.length : total,
                  onChange: (p, ps) => { setPage(p); setLimit(ps); },
                }}
                renderItem={(item) => (
                  <List.Item key={item._id} style={{ padding: '16px 12px', borderBottom: '1px solid #f0f0f0' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <Avatar shape="square" size={48} style={{ background: '#f6ffed', color: '#52c41a' }} icon={<FileTextOutlined />} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 16 }}>
                            {typeof item.jobId === 'object' && item.jobId ? 
                              (item.jobId.title || 'Tin tuyển dụng') : 
                              <span style={{ color: '#999' }}>Tin tuyển dụng đã bị xóa</span>
                            }
                          </div>
                          <Space size={12} style={{ color: '#8c8c8c', fontSize: 12 }}>
                            <span><ClockCircleOutlined /> {new Date(item.createdAt).toLocaleString()}</span>
                            <Tag color={STATUS_COLORS[item.status] || 'default'} style={{ marginLeft: 0 }}>{STATUS_LABELS[item.status]}</Tag>
                          </Space>
                        </div>
                      </Space>
                      <Space>
                        {typeof item.jobId === 'object' && item.jobId?.slug ? (
                          <Tooltip title="Xem chi tiết công việc">
                            <Button 
                              type="default" 
                              icon={<ArrowRightOutlined />} 
                              onClick={() => {
                                const job = item.jobId as { _id: string; title?: string; slug?: string };
                                if (job.slug) navigate(`/jobs/${job.slug}`);
                              }} 
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Tin tuyển dụng không còn tồn tại">
                            <Button 
                              type="default" 
                              icon={<ArrowRightOutlined />} 
                              disabled
                            />
                          </Tooltip>
                        )}
                        {(item.status === 'pending' || item.status === 'viewed') && (
                          <Popconfirm
                            title="Rút đơn ứng tuyển"
                            description="Bạn chắc chắn muốn rút đơn này?"
                            okText="Rút đơn"
                            cancelText="Hủy"
                            onConfirm={() => handleWithdraw(item._id)}
                          >
                            <Button danger icon={<StopOutlined />}>Rút đơn</Button>
                          </Popconfirm>
                        )}
                      </Space>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
};

export default AppliedJobs;
