import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Skeleton, Avatar, Tag, Space, Typography, Divider } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, GlobalOutlined, TeamOutlined, AuditOutlined, CalendarOutlined } from '@ant-design/icons'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { http } from '../apis/http'

type Company = {
  _id: string
  name: string
  slug: string
  logo?: string
  background?: string
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
        const res = await http.get<Company>(`/companies/slug/${slug}`)
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
                {/* Background Cover Image */}
                {company.background && (
                  <div
                    style={{
                      width: '100%',
                      height: 300,
                      borderRadius: 16,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }}
                  >
                    <img
                      src={company.background}
                      alt={`${company.name} background`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                        padding: '40px 24px 24px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 16
                      }}
                    >
                      <Avatar size={80} src={company.logo} style={{ borderRadius: 12, border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        {company.name?.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography.Title level={2} style={{ margin: 0, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                          {company.name}
                        </Typography.Title>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hero Header (fallback when no background) */}
                {!company.background && (
                  <div
                    style={{
                      background: 'linear-gradient(180deg, #F0FFF7 0%, #FFFFFF 60%)',
                      border: '1px solid #e8f5e8',
                      borderRadius: 16,
                      padding: 20,
                      boxShadow: '0 8px 24px rgba(16,185,129,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <Avatar size={96} src={company.logo} style={{ borderRadius: 16, border: '1px solid #e8f5e8' }}>
                        {company.name?.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography.Title level={3} style={{ margin: 0 }}>{company.name}</Typography.Title>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                          <Tag color="#d1fae5" style={{ color: '#065f46', borderColor: '#d1fae5' }}><TeamOutlined /> <span style={{ marginLeft: 6 }}>{company.size || 'Chưa rõ quy mô'}</span></Tag>
                          <Tag><EnvironmentOutlined /> <span style={{ marginLeft: 6 }}>{company.address || company.location || 'Chưa có địa chỉ'}</span></Tag>
                          {company.website && (
                            <Tag color="#e6fffb" style={{ color: '#08979c', borderColor: '#b5f5ec' }}>
                              <GlobalOutlined />
                              <a href={company.website} target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>{company.website}</a>
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Info Tags (shown when has background) */}
                {company.background && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 4px' }}>
                    <Tag color="#d1fae5" style={{ color: '#065f46', borderColor: '#d1fae5', fontSize: 14, padding: '4px 12px' }}>
                      <TeamOutlined /> <span style={{ marginLeft: 6 }}>{company.size || 'Chưa rõ quy mô'}</span>
                    </Tag>
                    <Tag style={{ fontSize: 14, padding: '4px 12px' }}>
                      <EnvironmentOutlined /> <span style={{ marginLeft: 6 }}>{company.address || company.location || 'Chưa có địa chỉ'}</span>
                    </Tag>
                    {company.website && (
                      <Tag color="#e6fffb" style={{ color: '#08979c', borderColor: '#b5f5ec', fontSize: 14, padding: '4px 12px' }}>
                        <GlobalOutlined />
                        <a href={company.website} target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>{company.website}</a>
                      </Tag>
                    )}
                  </div>
                )}

                {/* Main Grid: Content | Sidebar */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  {/* Left: About, Industries, Map */}
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div style={{ background: '#fff', border: '1px solid #e8f5e8', borderRadius: 16, padding: 20 }}>
                      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Giới thiệu</Typography.Title>
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

                    {(company.address || company.location) ? (
                      <div style={{ background: '#fff', border: '1px solid #e8f5e8', borderRadius: 16, padding: 20 }}>
                        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Vị trí</Typography.Title>
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

                  {/* Right: Sidebar consolidated */}
                  <div style={{ display: 'grid', gap: 16, alignSelf: 'start' }}>
                    <div style={{ background: '#fff', border: '1px solid #e8f5e8', borderRadius: 16, padding: 20 }}>
                      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>Thông tin liên hệ</Typography.Title>
                      <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <MailOutlined style={{ color: '#00b14f' }} />
                          <span>{company.email || 'Chưa có thông tin'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <PhoneOutlined style={{ color: '#00b14f' }} />
                          <span>{company.phone || 'Chưa có thông tin'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <EnvironmentOutlined style={{ color: '#00b14f' }} />
                          <span>{company.address || company.location || 'Chưa có địa chỉ'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <GlobalOutlined style={{ color: '#00b14f' }} />
                          <a href={company.website || '#'} target={company.website ? '_blank' : undefined} rel="noreferrer">
                            {company.website || 'Chưa có website'}
                          </a>
                        </div>
                      </div>
                      <Divider style={{ margin: '16px 0' }} />
                      <div style={{ display: 'grid', gap: 12 }}>
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
                  </div>
                </div>
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


