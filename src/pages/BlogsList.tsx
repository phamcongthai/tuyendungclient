import React, { useEffect, useMemo, useState } from 'react';
import { Card, List, Input, Tag, Pagination, Empty, Layout, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { publicBlogsApi, PublicBlog } from '../apis/blogs.api';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
      <div style={{ background: '#F3F5F7' }}>
        <div className="container" style={{ padding: '24px 0' }}>
          <Card
            style={{ marginBottom: 16 }}
            title="Bài viết"
            extra={
              <Input.Search
                placeholder="Tìm kiếm"
                onSearch={onSearch}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
            }
          >
            {availableTags.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ marginRight: 8, color: '#666' }}>Tags:</span>
                <Tag
                  onClick={() => setSelectedTag(undefined)}
                  color={!selectedTag ? 'green' : undefined}
                  style={{ cursor: 'pointer' }}
                >
                  Tất cả
                </Tag>
                {availableTags.map(tag => (
                  <Tag.CheckableTag
                    key={tag}
                    checked={selectedTag === tag}
                    onChange={(checked) => setSelectedTag(checked ? tag : undefined)}
                  >
                    {tag}
                  </Tag.CheckableTag>
                ))}
              </div>
            )}
          </Card>

          {items.length === 0 && !loading ? (
            <Empty description="Không có bài viết" />
          ) : (
            <List
              loading={loading}
              grid={{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }}
              dataSource={items}
              renderItem={(item) => (
                <List.Item key={item.slug}>
                  <Card
                    hoverable
                    cover={<img className="blog-card-cover" src={item.coverImageUrl} alt={item.title} />}
                  >
                    <Card.Meta
                      title={<Link to={`/blog/${item.slug}`}>{item.title}</Link>}
                      description={<span style={{ color: '#666' }}>{item.excerpt}</span>}
                    />
                    <div style={{ marginTop: 8 }}>
                      {(item.tags || []).map(t => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )}

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger
              pageSizeOptions={[6, 9, 12, 18] as any}
              onChange={(p, l) => { setPage(p); setLimit(l); }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogsList;


