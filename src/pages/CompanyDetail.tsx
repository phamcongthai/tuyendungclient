import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Skeleton, Avatar, Tag, Space, Typography } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, GlobalOutlined, AppstoreOutlined, TeamOutlined, AuditOutlined, CalendarOutlined } from '@ant-design/icons'
import Header from '../components/Header'
import Footer from '../components/Footer'
import axios from 'axios'

type Company = {
  _id: string
  name: string
  slug: string
  logo?: string
  size?: string | number
  address?: string
  location?: string
  description?: string
  website?: string
  email?: string
  phone?: string
  industries?: string[]
  taxCode?: string
  foundedYear?: string
}

const CompanyDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<Company | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        if (!slug) return
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const res = await axios.get<Company>(`${baseURL}/companies/slug/${slug}`)
        if (mounted) setCompany(res.data)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [slug])

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#F3F5F7' }}>
        <div style={{ background: '#fff', minHeight: '100vh' }}>
          <div className="container" style={{ padding: '24px 0' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : company ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Header Card */}
                <div
                  style={{
                    display: 'grid',
                    gap: 16,
                    gridTemplateColumns: '96px 1fr',
                    alignItems: 'center',
                    background: '#fff',
                    border: '1px solid #e8f5e8',
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: '0 8px 24px rgba(16,185,129,0.06)'
                  }}
                >
                  <Avatar size={96} src={company.logo} style={{ borderRadius: 16 }}>
                    {company.name?.charAt(0)}
                  </Avatar>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <Typography.Title level={3} style={{ margin: 0 }}>{company.name}</Typography.Title>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Tag color="green"><TeamOutlined /> <span style={{ marginLeft: 6 }}>{company.size || 'Chưa có thông tin'}</span></Tag>
                      <Tag><EnvironmentOutlined /> <span style={{ marginLeft: 6 }}>{company.address || company.location || 'Chưa có thông tin'}</span></Tag>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 16
                  }}
                >
                  <div style={{ background: '#fff', border: '1px solid #e8f5e8', borderRadius: 16, padding: 20 }}>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <GlobalOutlined style={{ color: '#00b14f' }} />
                        <a href={company.website || '#'} target={company.website ? '_blank' : undefined} rel="noreferrer">
                          {company.website || 'Chưa có thông tin'}
                        </a>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MailOutlined style={{ color: '#00b14f' }} />
                        <span>{company.email || 'Chưa có thông tin'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <PhoneOutlined style={{ color: '#00b14f' }} />
                        <span>{company.phone || 'Chưa có thông tin'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AuditOutlined style={{ color: '#00b14f' }} />
                        <span>Mã số thuế: {company.taxCode || 'Chưa có thông tin'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CalendarOutlined style={{ color: '#00b14f' }} />
                        <span>Năm thành lập: {company.foundedYear || 'Chưa có thông tin'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e8f5e8', borderRadius: 16, padding: 20 }}>
                    <Typography.Title level={4} style={{ marginTop: 0 }}>Mô tả</Typography.Title>
                    {company.description ? (
                      <div dangerouslySetInnerHTML={{ __html: company.description }} />
                    ) : (
                      <div>Chưa có thông tin</div>
                    )}
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e8f5e8', borderRadius: 16, padding: 20 }}>
                    <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Ngành nghề</Typography.Title>
                    {company.industries && company.industries.length ? (
                      <Space wrap>
                        {company.industries.map((ind) => (
                          <Tag key={ind} color="#ECFDF5" style={{ color: '#065f46', borderColor: '#D1FAE5', fontWeight: 600 }}>{ind}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <div>Chưa có thông tin</div>
                    )}
                  </div>
                </div>

                {/* Map - moved to bottom for better layout */}
                {(company.address || company.location) ? (
                  <div style={{ background: '#fff', border: '1px solid #e8f5e8', borderRadius: 16, padding: 20 }}>
                    <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Xem bản đồ</Typography.Title>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                      <iframe
                        title="Xem bản đồ"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(company.address || company.location || '')}&z=15&output=embed`}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div>Không tìm thấy công ty</div>
            )}
          </div>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  )
}

export default CompanyDetail


