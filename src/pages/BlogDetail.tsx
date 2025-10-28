import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Tag, Breadcrumb, Skeleton } from 'antd';
import { publicBlogsApi, type PublicBlog } from '../apis/blogs.api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Title } = Typography;

const BlogDetail: React.FC = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<PublicBlog | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!slug) return;
      const data = await publicBlogsApi.getBySlug(slug);
      setBlog(data);
      if (data?.title) document.title = data.title;
    };
    run();
  }, [slug]);

  if (!blog) {
    return (
      <div>
        <Header />
        <div className="container" style={{ padding: 16, maxWidth: 920, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ background: '#F3F5F7' }}>
        <div className="container" style={{ padding: '16px 0', maxWidth: 920, margin: '0 auto' }}>
          <Breadcrumb style={{ marginBottom: 12 }}>
            <Breadcrumb.Item>
              <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>Quay lại</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Blog</Breadcrumb.Item>
            <Breadcrumb.Item>{blog.title}</Breadcrumb.Item>
          </Breadcrumb>
          <Card>
            <img className="blog-cover" src={blog.coverImageUrl} alt={blog.title} style={{ marginBottom: 16 }} />
            <Title level={2} style={{ marginBottom: 8 }}>{blog.title}</Title>
            <div style={{ marginBottom: 16 }}>{(blog.tags || []).map(t => <Tag key={t}>{t}</Tag>)}</div>
            <div
              className="blog-content"
              // Admin-generated HTML content
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;


