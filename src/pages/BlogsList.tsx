import React, { useEffect, useMemo, useState } from 'react';
import { Card, List, Input, Tag, Pagination, Empty, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import { SearchOutlined, TagOutlined } from '@ant-design/icons';
import { publicBlogsApi, type PublicBlog } from '../apis/blogs.api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Title, Text } = Typography;

const BlogsList: React.FC = () => {
  const [items, setItems] = useState<PublicBlog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach(b => (b.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const fetchData = async (opts?: { resetPage?: boolean }) => {
    setLoading(true);
    try {
      const currentPage = opts?.resetPage ? 1 : page;
      const res = await publicBlogsApi.list({ keyword, page: currentPage, limit, tag: selectedTag });
      setItems(res.items);
      setTotal(res.total || 0);
      if (opts?.resetPage) setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, selectedTag]);

  const onSearch = () => fetchData({ resetPage: true });

  return (
    <div>
      <Header />
      <div style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', minHeight: 'calc(100vh - 64px)' }}>
        {/* Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #00b14f 0%, #00d45a 100%)',
          padding: '60px 0 40px',
          marginBottom: 40
        }}>
          <div className="container">
            <Title level={1} style={{ color: '#fff', marginBottom: 12, fontSize: 42, fontWeight: 800 }}>
              Blog & Tin Tức
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 16 }}>
              Khám phá các bài viết hữu ích về nghề nghiệp, phát triển kỹ năng và xu hướng tuyển dụng
            </Text>
            <div style={{ marginTop: 24 }}>
              <Input.Search
                placeholder="Tìm kiếm bài viết..."
                onSearch={onSearch}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                size="large"
                prefix={<SearchOutlined style={{ color: '#00b14f' }} />}
                style={{ 
                  maxWidth: 600,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}
                allowClear
              />
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: 60 }}>
          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <Card 
              className="blog-filter-card"
              style={{ 
                marginBottom: 32,
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              <Space size={[8, 12]} wrap>
                <TagOutlined style={{ color: '#00b14f', fontSize: 16 }} />
                <Tag
                  onClick={() => setSelectedTag(undefined)}
                  color={!selectedTag ? 'success' : 'default'}
                  style={{ 
                    cursor: 'pointer',
                    borderRadius: 20,
                    padding: '4px 16px',
                    fontSize: 14,
                    fontWeight: selectedTag === undefined ? 600 : 400
                  }}
                >
                  Tất cả
                </Tag>
                {availableTags.map(tag => (
                  <Tag
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? undefined : tag)}
                    color={selectedTag === tag ? 'success' : 'default'}
                    style={{ 
                      cursor: 'pointer',
                      borderRadius: 20,
                      padding: '4px 16px',
                      fontSize: 14,
                      fontWeight: selectedTag === tag ? 600 : 400
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Blog Grid */}
          {items.length === 0 && !loading ? (
            <Empty 
              description="Không có bài viết"
              style={{ padding: '60px 0' }}
            />
          ) : (
            <List
              loading={loading}
              grid={{ 
                gutter: [24, 24], 
                column: 3, 
                xs: 1, 
                sm: 2, 
                md: 2,
                lg: 3,
                xl: 3
              }}
              dataSource={items}
              renderItem={(item) => (
                <List.Item key={item.slug}>
                  <Link to={`/blog/${item.slug}`} className="blog-card-link">
                    <Card
                      className="modern-blog-card"
                      hoverable
                      cover={
                        <div className="blog-card-image-wrapper">
                          <img 
                            className="blog-card-cover" 
                            src={item.coverImageUrl} 
                            alt={item.title}
                          />
                          <div className="blog-card-overlay" />
                        </div>
                      }
                      bordered={false}
                      style={{
                        height: '100%',
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="blog-card-content">
                        <Title 
                          level={5} 
                          className="blog-card-title"
                          style={{ 
                            marginBottom: 8,
                            fontSize: 15,
                            fontWeight: 600,
                            lineHeight: 1.4,
                            color: '#1a1a1a',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 42
                          }}
                        >
                          {item.title}
                        </Title>
                        
                        <Text 
                          className="blog-card-excerpt"
                          style={{ 
                            color: '#666',
                            fontSize: 13,
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 39,
                            marginBottom: 12
                          }}
                        >
                          {item.excerpt || 'Đọc thêm để khám phá nội dung...'}
                        </Text>

                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginTop: 'auto',
                          paddingTop: 8,
                          borderTop: '1px solid #f0f0f0'
                        }}>
                          {item.tags && item.tags.length > 0 && (
                            <Tag 
                              color="success"
                              style={{ 
                                borderRadius: 10,
                                fontSize: 11,
                                border: 'none',
                                margin: 0,
                                padding: '2px 8px'
                              }}
                            >
                              {item.tags[0]}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </List.Item>
              )}
            />
          )}

          {/* Pagination */}
          {total > 0 && (
            <div style={{ 
              marginTop: 48, 
              textAlign: 'center',
              padding: '24px 0'
            }}>
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                showSizeChanger
                pageSizeOptions={[6, 9, 12, 18] as any}
                onChange={(p, l) => { setPage(p); setLimit(l); }}
                style={{
                  display: 'inline-flex',
                  gap: 8
                }}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogsList;


