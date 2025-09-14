import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Skeleton, Space, Layout, Avatar, message, Divider } from 'antd'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { DollarOutlined, BookOutlined, ClockCircleOutlined, ShareAltOutlined, BookTwoTone, TeamOutlined, AppstoreOutlined, EnvironmentOutlined, ExportOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { fetchJobDetail, fetchCompanyById } from '../apis/jobs.api'
import { applicationsAPI } from '../apis/applications.api'
import { useUser } from '../contexts/UserContext'
import type { JobData } from '../types/models'
import ApplyModal from '../components/ApplyModal'

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e8f5e8', borderRadius: 16, padding: 20, boxShadow: '0 8px 24px rgba(16,185,129,0.06)' }}>
    <h3 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h3>
    <div>{children}</div>
  </div>
)

const Pill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ecfdf5', border: '1px solid #d1fae5', padding: '8px 12px', borderRadius: 999, color: '#065f46', fontWeight: 600 }}>
    {icon}
    <span>{text}</span>
  </div>
)

const JobDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<JobData | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [checkingApplication, setCheckingApplication] = useState(false)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        if (!slug) return
        const data = await fetchJobDetail(slug)

        // If companyId is already populated (object), just use payload as-is (it contains full fields via DTO)
        if (data.companyId && typeof data.companyId === 'object' && '_id' in data.companyId) {
          if (mounted) setJob(data)
          return
        }

        // Otherwise set job first
        if (mounted) setJob(data)

        // If we only have companyId as string, fetch full company info
        const companyIdStr = typeof data.companyId === 'string' ? data.companyId : undefined
        if (companyIdStr) {
          try {
            const company = await fetchCompanyById(companyIdStr)
            console.log('Full company data fetched:', company)
            if (mounted) {
              setJob(prev => prev ? ({
                ...prev,
                company: {
                  id: company._id,
                  slug: company.slug,
                  name: company.name,
                  logo: company.logo,
                  size: company.size,
                  location: company.location,
                },
                companySlug: company.slug,
                companyName: company.name,
                companyLogo: company.logo,
                companySize: company.size,
                companyLocation: company.location,
              } as JobData) : prev)
            }
          } catch (e) {
            console.warn('Không lấy được thông tin công ty:', e)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [slug])

  // Kiểm tra trạng thái ứng tuyển khi job được load và user đã đăng nhập
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !job?._id) return
      
      setCheckingApplication(true)
      try {
        const result = await applicationsAPI.checkApplication(job._id)
        setHasApplied(result.hasApplied || false)
      } catch (error) {
        console.error('Error checking application status:', error)
        setHasApplied(false)
      } finally {
        setCheckingApplication(false)
      }
    }

    checkApplicationStatus()
  }, [user, job?._id])

  useEffect(() => {
  }, [job])

  const applyJobId = useMemo(() => {
    const raw = (job as any)?._id;
    const normalized = typeof raw === 'string' ? raw : (raw && raw.$oid) ? raw.$oid : '';
    return normalized;
  }, [job]);

  const salaryText = useMemo(() => {
    if (!job) return ''
    if (job.salaryMin && job.salaryMax) return `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} ${job.salaryType || 'VND'}`
    if (job.salaryMin) return `Từ ${job.salaryMin.toLocaleString()} ${job.salaryType || 'VND'}`
    if (job.salaryMax) return `Đến ${job.salaryMax.toLocaleString()} ${job.salaryType || 'VND'}`
    return 'Thoả thuận'
  }, [job])

  const deadlineText = useMemo(() => {
    if (!job?.deadline) return ''
    const dt = new Date(job.deadline)
    return isNaN(dt.getTime()) ? job.deadline : dt.toLocaleDateString('vi-VN')
  }, [job?.deadline])

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#F3F5F7' }}>
        <div style={{ background: '#fff', minHeight: '100vh' }}>
          <div className="container" style={{ padding: '24px 0' }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : job ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Hero banner */}
                <div style={{
                  background: 'linear-gradient(180deg, #F0FFF7 0%, #FFFFFF 60%)',
                  border: '1px solid #e8f5e8',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 8px 24px rgba(16,185,129,0.06)'
                }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    {(() => {
                      const companyObj = (typeof job.companyId === 'object' && job.companyId) ? (job.companyId as any) : null
                      const logo = job.company?.logo || job.companyLogo || companyObj?.logo
                      if (logo) {
                        return (
                          <img
                            src={logo}
                            alt={job.title}
                            style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', background: '#d1fae5', border: '1px solid #e8f5e8' }}
                          />
                        )
                      }
                      return (
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#d1fae5', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#00b14f' }}>
                          {job.title?.charAt(0) || 'J'}
                        </div>
                      )
                    })()}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h1 style={{ margin: 0 }}>{job.title || 'Tin tuyển dụng'}</h1>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        <Tag color="#d1fae5" style={{ color: '#065f46', borderColor: '#d1fae5' }}>{job.location || '—'}</Tag>
                        {job.jobType && <Tag>{job.jobType}</Tag>}
                        {job.workingHours && <Tag>{job.workingHours}</Tag>}
                        {job.deadline && <Tag color="orange">Hạn nộp: {deadlineText}</Tag>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {hasApplied ? (
                        <Button 
                          type="primary" 
                          size="large" 
                          icon={<CheckCircleOutlined />}
                          disabled
                          style={{ background: '#52c41a', borderColor: '#52c41a', cursor: 'not-allowed' }}
                        >
                          Đã ứng tuyển
                        </Button>
                      ) : (
                        <Button type="primary" size="large" onClick={() => setApplyOpen(true)} loading={checkingApplication}>
                          {checkingApplication ? 'Đang kiểm tra...' : 'Ứng tuyển ngay'}
                        </Button>
                      )}
                      <Button size="large" icon={<ShareAltOutlined />}>Chia sẻ</Button>
                    </div>
                  </div>
                  <Divider style={{ margin: '16px 0' }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <Pill icon={<DollarOutlined />} text={`Lương: ${salaryText}`} />
                    {job.education && <Pill icon={<BookOutlined />} text={job.education} />}
                    {job.experienceYears && <Pill icon={<ClockCircleOutlined />} text={`Kinh nghiệm: ${job.experienceYears}`} />}
                  </div>
                </div>

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <SectionCard title="Mô tả công việc">
                      <div dangerouslySetInnerHTML={{ __html: job.description || '<ul><li>—</li></ul>' }} />
                    </SectionCard>
                    <SectionCard title="Yêu cầu ứng viên">
                      <div dangerouslySetInnerHTML={{ __html: job.requirements || '<ul><li>—</li></ul>' }} />
                    </SectionCard>
                    <SectionCard title="Quyền lợi">
                      <div dangerouslySetInnerHTML={{ __html: job.benefits || '<ul><li>—</li></ul>' }} />
                    </SectionCard>
                  </div>

                  {/* Sidebar */}
                  <div style={{ display: 'grid', gap: 16, alignSelf: 'start', position: 'sticky', top: 16 }}>
                    <SectionCard title="Thông tin chung">
                      <div style={{ display: 'grid', gap: 8 }}>
                        {job.jobType && <Tag color="green">{job.jobType}</Tag>}
                        {job.workingHours && <Tag>{job.workingHours}</Tag>}
                        {job.deadline && <Tag color="orange">Hạn nộp: {deadlineText}</Tag>}
                        {job.skills?.length ? (
                          <div>
                            <div style={{ marginBottom: 8, fontWeight: 600 }}>Kỹ năng</div>
                            <Space wrap>
                              {job.skills.slice(0, 8).map((s) => (
                                <Tag key={s}>{s}</Tag>
                              ))}
                            </Space>
                          </div>
                        ) : null}
                      </div>
                    </SectionCard>

                    <SectionCard title="Về công ty">
                      {(() => {
                        const companyObj = (typeof job.companyId === 'object' && job.companyId) ? (job.companyId as any) : null
                        const logo = job.company?.logo || job.companyLogo || companyObj?.logo
                        const name = job.company?.name || job.companyName || companyObj?.name
                        const slug = job.company?.slug || job.companySlug || companyObj?.slug
                        const size = job.company?.size || job.companySize || companyObj?.size
                        const industries = (job as any).company?.industries || companyObj?.industries
                        const address = job.company?.location || job.companyLocation || companyObj?.address
                        const website = (job as any).company?.website || companyObj?.website
                        const foundedYear = (job as any).company?.foundedYear || companyObj?.foundedYear

                        if (!name) return <div>Chưa có thông tin công ty</div>

                        return (
                          <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <Avatar size={56} src={logo} style={{ borderRadius: 12 }}>
                                {name.charAt(0)}
                              </Avatar>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gap: 8 }}>
                              {size ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151' }}>
                                  <TeamOutlined style={{ color: '#00b14f', fontSize: 18 }} />
                                  <span>Quy mô: {size}</span>
                                </div>
                              ) : null}
                              {industries ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151' }}>
                                  <AppstoreOutlined style={{ color: '#00b14f', fontSize: 18 }} />
                                  <span>Lĩnh vực: {Array.isArray(industries) ? industries.join(', ') : industries}</span>
                                </div>
                              ) : null}
                              {address ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151' }}>
                                  <EnvironmentOutlined style={{ color: '#00b14f', fontSize: 18 }} />
                                  <span>Địa điểm: {address}</span>
                                </div>
                              ) : null}
                              {address ? (
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginTop: 4, color: '#065f46' }}>
                                    <EnvironmentOutlined style={{ color: '#00b14f', fontSize: 18 }} />
                                    <span>Xem bản đồ</span>
                                  </div>
                                  <div style={{ marginTop: 8, border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                                    <iframe
                                      title="Xem bản đồ"
                                      width="100%"
                                      height="220"
                                      style={{ border: 0 }}
                                      loading="lazy"
                                      allowFullScreen
                                      referrerPolicy="no-referrer-when-downgrade"
                                      src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`}
                                    />
                                  </div>
                                </div>
                              ) : null}
                              {website ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151' }}>
                                  <ShareAltOutlined style={{ color: '#00b14f', fontSize: 18 }} />
                                  <a href={website} target="_blank" rel="noreferrer">{website}</a>
                                </div>
                              ) : null}
                              {foundedYear ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151' }}>
                                  <ClockCircleOutlined style={{ color: '#00b14f', fontSize: 18 }} />
                                  <span>Thành lập: {foundedYear}</span>
                                </div>
                              ) : null}
                            </div>

                            {slug ? (
                              <div>
                                <Button type="link" icon={<ExportOutlined />} onClick={() => navigate(`/companies/${slug}`)}>
                                  Xem trang công ty
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        )
                      })()}
                    </SectionCard>
                  </div>
                </div>
              </div>
            ) : (
              <div>Không tìm thấy tin tuyển dụng</div>
            )}
          </div>
        </div>
      </Layout.Content>
      <Footer />
      <ApplyModal 
        open={applyOpen} 
        onClose={() => setApplyOpen(false)} 
        jobId={applyJobId}
        onApplicationSuccess={() => {
          setHasApplied(true)
          message.success('Ứng tuyển thành công!')
        }}
      />
    </Layout>
  )
}

export default JobDetail