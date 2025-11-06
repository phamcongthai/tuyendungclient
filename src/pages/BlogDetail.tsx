import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Breadcrumb, Skeleton, List } from 'antd';
import { publicBlogsApi, type PublicBlog } from '../apis/blogs.api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Title } = Typography;

const BlogDetail: React.FC = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<PublicBlog | null>(null);
  const [others, setOthers] = useState<PublicBlog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const [data, list] = await Promise.all([
          publicBlogsApi.getBySlug(slug),
          publicBlogsApi.list({ page: 1, limit: 20 })
        ]);
        setBlog(data);
        setOthers(list.items || []);
        if (data?.title) document.title = data.title;
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  if (!blog) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: 16, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          <Card style={{ height: 'fit-content' }}>
            <Skeleton active paragraph={{ rows: 8 }} title={false} />
          </Card>
          <div>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ background: '#F3F5F7' }}>
        <div className="container" style={{ padding: '16px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
            <Card style={{ height: 'fit-content', position: 'sticky', top: 16 }} title="Bài viết khác">
              <List
                dataSource={others}
                loading={loading}
                renderItem={(item) => {
                  const active = item.slug === slug;
                  return (
                    <List.Item
                      key={item.slug}
                      style={{
                        padding: '8px 0',
                        cursor: 'pointer',
                        borderLeft: active ? '3px solid #1677ff' : '3px solid transparent',
                        background: active ? '#f0f5ff' : undefined,
                        paddingLeft: 8,
                        borderRadius: 4,
                      }}
                      onClick={() => navigate(`/blog/${item.slug}`)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: active ? 600 : 500, color: active ? '#1677ff' : '#0f172a' }}>
                          {item.title}
                        </span>
                        {item.excerpt && (
                          <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                            {item.excerpt}
                          </span>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />
            </Card>

            <div>
              <Breadcrumb style={{ marginBottom: 12 }}>
                <Breadcrumb.Item>
                  <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>Quay lại</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link to="/blog">Blog</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{blog.title}</Breadcrumb.Item>
              </Breadcrumb>
              <Card>
                <img className="blog-cover" src={blog.coverImageUrl} alt={blog.title} style={{ marginBottom: 16 }} />
                <Title level={2} style={{ marginBottom: 8 }}>{blog.title}</Title>
                <div style={{ marginBottom: 16 }}>{(blog.tags || []).map(t => <Tag key={t}>{t}</Tag>)}</div>
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;


