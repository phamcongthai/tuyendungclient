import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSearch from '../components/HeroSearch'
import CompanyCard from '../components/CompanyCard'
import CategoryCard from '../components/CategoryCard'
import { fetchFeaturedCategories } from '../apis/jobs.api'
import { Layout, Row, Col, Tag, Button, Empty, Card, Modal, Spin, Upload } from 'antd'
import { FireOutlined, DollarOutlined, PlusOutlined } from '@ant-design/icons'
import HotJobCardSkeleton from '../components/skeleton/HotJobCardSkeleton'
import type { Company, JobData } from '../types/models'
import { fetchJobs } from '../apis/jobs.api' // ✅ import từ api.ts
import { useUser } from '../contexts/UserContext'
import GlobalNotice from '../components/GlobalNotice'
import { fetchActiveCVSamples, fetchCVSampleById, type CVSampleData } from '../apis/cv-samples.api'
import { uploadAPI } from '../apis/upload.api'
import { usersAPI } from '../apis/users.api'
import { App as AntdApp } from 'antd'
import SingleBannerCarousel from '../components/SingleBannerCarousel'
import StatsCounters from '../components/StatsCounters'
import './Home.css'

type FeaturedCategory = { _id: string; title: string; slug: string; logo?: string; jobCount: number }

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true)
  const [loadingHotJobs, setLoadingHotJobs] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [displayedJobs, setDisplayedJobs] = useState<JobData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  // Newest jobs (non-featured)
  const [latestJobs, setLatestJobs] = useState<JobData[]>([])
  const [loadingLatest, setLoadingLatest] = useState<boolean>(true)
  const [currentLatestPage, setCurrentLatestPage] = useState(1)
  const [hasMoreLatest, setHasMoreLatest] = useState(true)
  const [loadingMoreLatest, setLoadingMoreLatest] = useState(false)
  const [, setTotalJobs] = useState(0)
  const [featuredCategories, setFeaturedCategories] = useState<FeaturedCategory[]>([])
  const { user } = useUser()
  const [cvSamples, setCvSamples] = useState<CVSampleData[]>([])
  const [loadingCV, setLoadingCV] = useState<boolean>(true)
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false)
  const [cvPreviewLoading, setCvPreviewLoading] = useState(false)
  const [cvPreview, setCvPreview] = useState<CVSampleData | null>(null)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const { message } = AntdApp.useApp()

  

  useEffect(() => {
    const getHotJobs = async () => {
      setLoadingHotJobs(true)
      try {
        const { data, total } = await fetchJobs({ page: 1, limit: 6, status: 'active', featured: true })
        setDisplayedJobs(data)
        setTotalJobs(total)
        setHasMore(data.length === 6 && total > 6)
      } catch (error) {
        console.error('Failed to fetch hot jobs:', error)
        setDisplayedJobs([])
      } finally {
        setLoadingHotJobs(false)
      }
    }
    const getLatestJobs = async () => {
      setLoadingLatest(true)
      try {
        const { data, total } = await fetchJobs({ page: 1, limit: 6, status: 'active', featured: false })
        setLatestJobs(data)
        setHasMoreLatest(data.length === 6 && total > 6)
      } catch (e) {
        setLatestJobs([])
      } finally {
        setLoadingLatest(false)
      }
    }
    const getFeaturedCompanies = async () => {
      setLoadingCompanies(true)
      try {
        const { data } = await fetchJobs({ page: 1, limit: 20, status: 'active' })
        // Lấy danh sách công ty duy nhất từ các job
        const companyMap = new Map<string, Company>()
        for (const job of data) {
          // Ưu tiên lấy từ job.company (nếu backend populate)
          const populated = job.company
          if (populated?.name) {
            const id = (populated as any)._id || populated.slug || populated.name
            if (!companyMap.has(id)) {
              companyMap.set(id, {
                id: String(id),
                name: populated.name || job.companyName || 'Công ty',
                slug: populated.slug || job.companySlug,
                logo: populated.logo || job.companyLogo,
                location: populated.location || job.companyLocation,
              })
            }
            continue
          }

          // Nếu companyId là object (populate kiểu khác)
          if (job.companyId && typeof job.companyId === 'object') {
            const c = job.companyId as any
            const id = c._id || c.slug || c.name
            if (id && !companyMap.has(id)) {
              companyMap.set(id, {
                id: String(id),
                name: c.name || job.companyName || 'Công ty',
                slug: c.slug || job.companySlug,
                logo: c.logo || job.companyLogo,
                location: c.location || job.companyLocation,
              })
            }
            continue
          }

          // Fallback: dùng các field rời trên job
          const fallbackId = job.companySlug || job.companyName || job._id
          if (fallbackId && !companyMap.has(String(fallbackId))) {
            companyMap.set(String(fallbackId), {
              id: String(fallbackId),
              name: job.companyName || 'Công ty',
              slug: job.companySlug,
              logo: job.companyLogo,
              location: job.companyLocation,
            })
          }
        }

        const companies = Array.from(companyMap.values()).slice(0, 8)
        setFeaturedCompanies(companies)
      } catch (e) {
        
        setFeaturedCompanies([])
      } finally {
        setLoadingCompanies(false)
      }
    }
    const getFeaturedCategories = async () => {
      setLoadingCategories(true)
      try {
        const res = await fetchFeaturedCategories()
        const onlyHasJobs = res.data.filter((c) => (c as any).jobCount > 0)
        setFeaturedCategories(onlyHasJobs.slice(0, 6))
      } catch (e) {
        
        setFeaturedCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    const getCV = async () => {
      setLoadingCV(true)
      try {
        const samples = await fetchActiveCVSamples()
        setCvSamples(samples)
      } catch (e) {
        setCvSamples([])
      } finally {
        setLoadingCV(false)
      }
    }
    getHotJobs()
    getFeaturedCompanies()
    getFeaturedCategories()
    getCV()
    getLatestJobs()
  }, [])

  const openCVPreview = async (id: string) => {
    try {
      setCvPreviewOpen(true)
      setCvPreviewLoading(true)
      const data = await fetchCVSampleById(id)
      setCvPreview(data)
    } catch (e) {
      setCvPreview(null)
    } finally {
      setCvPreviewLoading(false)
    }
  }

  const handleUploadPdf = async (file: File) => {
    try {
      if (!user) {
        message.warning('Bạn cần đăng nhập để tải CV')
        navigate('/login')
        return false as any
      }
      if (!file || file.type !== 'application/pdf') {
        message.error('Vui lòng chọn file PDF')
        return false as any
      }
      setUploadingCv(true)
      const { url } = await uploadAPI.uploadCvPdf(file)
      await usersAPI.updateMe({ cvPdfUrl: url })
      message.success('Đã tải CV lên thành công')
      setUploadModalOpen(false)
      return true as any
    } catch (e: any) {
      message.error(e?.message || 'Tải CV thất bại')
      return false as any
    } finally {
      setUploadingCv(false)
    }
  }

  const handleSearch = async (keyword: string, location: string, category?: string) => {
    const q = new URLSearchParams()
    if (keyword) q.set('q', keyword)
    if (location) q.set('loc', location)
    if (category) q.set('cat', category)
    navigate(`/search?${q.toString()}`)
  }

  const loadMoreJobs = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const { data, total } = await fetchJobs({ page: nextPage, limit: 6, status: 'active', featured: true })
      
      if (data.length > 0) {
        setDisplayedJobs(prev => [...prev, ...data])
        setCurrentPage(nextPage)
        setHasMore(displayedJobs.length + data.length < total)
      } else {
        setHasMore(false)
      }
    } catch (error) {
    } finally {
      setLoadingMore(false)
    }
  }

  const loadMoreLatestJobs = async () => {
    if (loadingMoreLatest || !hasMoreLatest) return
    setLoadingMoreLatest(true)
    try {
      const nextPage = currentLatestPage + 1
      const { data, total } = await fetchJobs({ page: nextPage, limit: 6, status: 'active', featured: false })
      if (data.length > 0) {
        setLatestJobs(prev => [...prev, ...data])
        setCurrentLatestPage(nextPage)
        setHasMoreLatest(latestJobs.length + data.length < total)
      } else {
        setHasMoreLatest(false)
      }
    } catch (e) {
    } finally {
      setLoadingMoreLatest(false)
    }
  }

  const formatSalary = (job: JobData) => {
    if (job.isSalaryNegotiable === true) return "Thỏa thuận";
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.salaryType || "VNĐ"}`;
    }
    if (job.salaryMin) {
      return `Từ ${job.salaryMin.toLocaleString()} ${job.salaryType || "VNĐ"}`;
    }
    if (job.salaryMax) {
      return `Đến ${job.salaryMax.toLocaleString()} ${job.salaryType || "VNĐ"}`;
    }
    return "Không rõ";
  };

  const getJobTypeColor = (jobType?: string) => {
    switch (jobType?.toLowerCase()) {
      case 'fulltime':
      case 'full-time':
        return 'green';
      case 'parttime':
      case 'part-time':
        return 'orange';
      case 'internship':
        return 'blue';
      case 'contract':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'junior':
        return 'blue';
      case 'middle':
      case 'mid':
        return 'orange';
      case 'senior':
        return 'red';
      case 'lead':
      case 'manager':
        return 'purple';
      default:
        return 'default';
    }
  };

  // deadline not shown on home cards

  const handleJobClick = (job: JobData) => {
    navigate(`/jobs/${job.slug}`)
  }

  return (
    <Layout>
      <Header />
      <GlobalNotice />
      <Layout.Content style={{ background: '#F3F5F7' }}>
        
        <HeroSearch onSearch={handleSearch} />

        

        {/* Hot Jobs Section - Modern UI */}
        <section className="section hot-jobs-section" id="jobs">
          <div className="container">
            {/* Section Header */}
            <div className="section-head">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                <FireOutlined style={{ fontSize: '32px', color: '#ff6b35' }} />
                <h2>
                  Việc làm hot
                </h2>
              </div>
              <p>
                Những cơ hội việc làm hấp dẫn nhất đang chờ bạn
              </p>
            </div>

            {/* Jobs Grid - 3 columns, 2 rows initially */}
            <Row gutter={[20, 20]}>
              {loadingHotJobs
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <Col key={idx} xs={24} sm={12} md={8} lg={8}>
                      <HotJobCardSkeleton />
                    </Col>
                  ))
                : displayedJobs.length > 0
                ? displayedJobs.map((job) => (
                    <Col key={job._id} xs={24} sm={12} md={8} lg={8}>
                      <div 
                        data-slug={job.slug}
                        onClick={() => handleJobClick(job)}
                        className="job-card"
                      >
                        {/* Hot Badge */}
                        <div className="badge-hot">
                          <FireOutlined style={{ fontSize: '10px' }} />
                          HOT
                        </div>

                        {/* Company Info */}
                        <div className="job-company-row">
                          <div className="company-avatar">
                            {(() => {
                              const companyObj = (typeof job.companyId === 'object' && job.companyId) ? (job.companyId as any) : null
                              const logo = job.company?.logo || job.companyLogo || companyObj?.logo
                              if (logo) {
                                return (
                                  <img 
                                    src={logo} 
                                    alt={(job.company?.name || companyObj?.name || job.companyName || 'Company')}
                                    
                                  />
                                )
                              }
                              const fallback = (job.company?.name || companyObj?.name || job.companyName || job.title || 'C')
                              return fallback.charAt(0).toUpperCase()
                            })()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 className="job-title">
                              {job.title}
                            </h3>
                            <p className="job-subtitle">
                              {job.career || 'Chưa xác định'}
                            </p>
                          </div>
                        </div>

                        {/* Salary */}
                        <div className="salary-chip">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <DollarOutlined style={{ color: '#2196f3', fontSize: '12px' }} />
                            <span className="val">
                              {formatSalary(job)}
                            </span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="job-tags">
                          {job.jobType && (
                            <Tag color={getJobTypeColor(job.jobType)} style={{ borderRadius: '4px', fontWeight: '500', fontSize: '10px', padding: '2px 6px' }}>
                              {job.jobType}
                            </Tag>
                          )}
                          {job.level && (
                            <Tag color={getLevelColor(job.level)} style={{ borderRadius: '4px', fontWeight: '500', fontSize: '10px', padding: '2px 6px' }}>
                              {job.level}
                            </Tag>
                          )}
                          {job.skills?.slice(0, 1).map((skill) => (
                            <Tag key={skill} style={{ 
                              background: '#f5f5f5', 
                              color: '#666', 
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              fontWeight: '500',
                              fontSize: '10px',
                              padding: '2px 6px'
                            }}>
                              {skill}
                            </Tag>
                          ))}
                        </div>

                        {/* Additional Info */}
                        <div className="job-extra-tags">
                          {job.experienceYears && (
                            <Tag style={{ 
                              background: '#e3f2fd', 
                              color: '#1976d2', 
                              border: '1px solid #bbdefb',
                              borderRadius: '4px',
                              fontWeight: '500',
                              fontSize: '10px',
                              padding: '2px 6px'
                            }}>
                              {job.experienceYears}
                            </Tag>
                          )}
                          {job.workingHours && (
                            <Tag style={{ 
                              background: '#e8f5e8', 
                              color: '#2e7d32', 
                              border: '1px solid #c8e6c9',
                              borderRadius: '4px',
                              fontWeight: '500',
                              fontSize: '10px',
                              padding: '2px 6px'
                            }}>
                              {job.workingHours}
                            </Tag>
                          )}
                          {job.education && (
                            <Tag style={{ 
                              background: '#f3e5f5', 
                              color: '#7b1fa2', 
                              border: '1px solid #e1bee7',
                              borderRadius: '4px',
                              fontWeight: '500',
                              fontSize: '10px',
                              padding: '2px 6px'
                            }}>
                              {job.education}
                            </Tag>
                          )}
                          {/* deadline hidden on home cards as requested */}
                        </div>
                      </div>
                    </Col>
                  ))
                : (
                    <Col span={24}>
                      <Empty 
                        description="Không có việc làm nào được tìm thấy"
                        style={{ 
                          background: 'white', 
                          borderRadius: '16px', 
                          padding: '40px',
                          margin: '20px 0'
                        }}
                      />
                    </Col>
                  )}
            </Row>

            {/* Load More Button */}
            {hasMore && !loadingHotJobs && (
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Button 
                  size="large"
                  loading={loadingMore}
                  onClick={loadMoreJobs}
                  className="btn-load-more"
                  icon={<PlusOutlined />}
                >
                  {loadingMore ? 'Đang tải...' : 'Xem thêm việc làm'}
                </Button>
              </div>
            )}

            {/* View All Button removed per request; keep only Load More */}
          </div>
        </section>

        {/* Newest Jobs Section */}
        <section className="section hot-jobs-section" id="newest-jobs">
          <div className="container">
            <div className="section-head">
              <h2>Việc làm mới nhất</h2>
              <p>Các tin mới đăng gần đây</p>
            </div>
            <Row gutter={[20, 20]}>
              {loadingLatest
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <Col key={idx} xs={24} sm={12} md={8} lg={8}>
                      <HotJobCardSkeleton />
                    </Col>
                  ))
                : latestJobs.length > 0
                ? latestJobs.map((job) => (
                    <Col key={job._id} xs={24} sm={12} md={8} lg={8}>
                      <div 
                        data-slug={job.slug}
                        onClick={() => handleJobClick(job)}
                        className="job-card"
                      >
                        <div className="job-company-row">
                          <div className="company-avatar">
                            {(() => {
                              const companyObj = (typeof job.companyId === 'object' && job.companyId) ? (job.companyId as any) : null
                              const logo = job.company?.logo || job.companyLogo || companyObj?.logo
                              if (logo) {
                                return (
                                  <img 
                                    src={logo} 
                                    alt={(job.company?.name || companyObj?.name || job.companyName || 'Company')}
                                  />
                                )
                              }
                              const fallback = (job.company?.name || companyObj?.name || job.companyName || job.title || 'C')
                              return fallback.charAt(0).toUpperCase()
                            })()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 className="job-title">{job.title}</h3>
                            <p className="job-subtitle">{job.career || 'Chưa xác định'}</p>
                          </div>
                        </div>
                        <div className="salary-chip">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <DollarOutlined style={{ color: '#0ea5e9', fontSize: 12 }} />
                            <span className="val">{formatSalary(job)}</span>
                          </div>
                        </div>
                        <div className="job-tags">
                          {job.jobType && (
                            <Tag color={getJobTypeColor(job.jobType)} style={{ borderRadius: 4, fontWeight: 500, fontSize: 10, padding: '2px 6px' }}>
                              {job.jobType}
                            </Tag>
                          )}
                          {job.level && (
                            <Tag color={getLevelColor(job.level)} style={{ borderRadius: 4, fontWeight: 500, fontSize: 10, padding: '2px 6px' }}>
                              {job.level}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </Col>
                  ))
                : (
                  <Col span={24}>
                    <Empty description="Không có việc làm nào" style={{ background: 'white', borderRadius: 16, padding: 40, margin: '20px 0' }} />
                  </Col>
                )}
            </Row>
            {hasMoreLatest && !loadingLatest && (
              <div style={{ textAlign: 'center', marginTop: 30 }}>
                <Button 
                  size="large"
                  loading={loadingMoreLatest}
                  onClick={loadMoreLatestJobs}
                  className="btn-load-more"
                >
                  {loadingMoreLatest ? 'Đang tải...' : 'Xem thêm việc mới'}
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="section" id="categories">
          <div className="container">
            <div className="section-head">
              <h2>Ngành nghề nổi bật</h2>
              <a href="#" onClick={(e) => e.preventDefault()} className="link">Xem tất cả</a>
            </div>
            <Row gutter={[14, 14]}>
              {(loadingCategories ? Array.from({ length: 6 }) : featuredCategories).map((c, idx) => (
                <Col key={(c as any)?._id || idx} xs={24} sm={12} md={12} lg={8}>
                  {loadingCategories ? (
                    <div style={{ height: 80, background: '#f5f5f5', borderRadius: 12 }} />
                  ) : (
                    <CategoryCard category={c as any} />
                  )}
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <section className="section" id="companies">
          <div className="container">
            <div className="section-head">
              <h2>Công ty nổi bật</h2>
              <a href="#" onClick={(e) => e.preventDefault()} className="link">Xem tất cả</a>
            </div>
            <Row gutter={[14, 14]}>
              {loadingCompanies
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <Col key={idx} xs={24} sm={12} md={12} lg={6}>
                      <div style={{ height: 100, background: '#f5f5f5', borderRadius: 12 }} />
                    </Col>
                  ))
                : featuredCompanies.map((c) => (
                    <Col key={c.id} xs={24} sm={12} md={12} lg={6}>
                      <CompanyCard company={c} />
                    </Col>
                  ))}
            </Row>
          </div>
        </section>

        {/* Banner below featured companies */}
        <section className="section" style={{ padding: '20px 0', background: '#F3F5F7' }}>
          <div className="container">
            <SingleBannerCarousel position="BELOW_FEATURED_COMPANIES" />
          </div>
        </section>

        {/* CV Samples Section */}
        <section className="section" id="cv">
          <div className="container">
            <div className="section-head">
              <h2>Mẫu CV</h2>
              <a href="#" onClick={(e) => e.preventDefault()} className="link">Xem tất cả</a>
            </div>
            <Row gutter={[14, 14]}>
              {loadingCV
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <Col key={idx} xs={24} sm={12} md={8} lg={6}>
                      <div style={{ height: 220, background: '#f5f5f5', borderRadius: 12 }} />
                    </Col>
                  ))
                : cvSamples.map((s) => (
                    <Col key={s._id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        hoverable
                        onClick={() => openCVPreview(s._id)}
                        style={{ cursor: 'pointer' }}
                        cover={
                          s.demoImage ? (
                            <img src={s.demoImage} alt={s.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ height: 200, background: '#f5f5f5' }} />
                          )
                        }
                      >
                        <Card.Meta title={s.name || s.title} />
                      </Card>
                    </Col>
                  ))}
            </Row>
          </div>
        </section>

        {/* Stats Counters */}
        <StatsCounters />

        <Modal
          open={cvPreviewOpen}
          onCancel={() => { setCvPreviewOpen(false); setCvPreview(null) }}
          title={cvPreview?.name || 'Xem mẫu CV'}
          width={1000}
          footer={[
            <Button key="close" onClick={() => { setCvPreviewOpen(false); setCvPreview(null) }}>Đóng</Button>
          ]}
        >
          {cvPreviewLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : cvPreview ? (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <iframe
                title={cvPreview.name}
                style={{ width: '100%', height: 700, border: 'none' }}
                srcDoc={`<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><style>${cvPreview.css || ''}</style></head><body>${cvPreview.html || ''}</body></html>`}
              />
            </div>
          ) : (
            <div style={{ padding: 16 }}>Không thể tải xem trước mẫu CV.</div>
          )}
        </Modal>

        <section className="cta">
          <div className="container cta-inner">
            <div>
              <h3>Tải CV của bạn để được gợi ý việc làm phù hợp</h3>
              <p>Hệ thống đề xuất thông minh giúp bạn tiếp cận đúng công việc mơ ước.</p>
            </div>
            <a className="btn btn-secondary" href="#" onClick={(e) => { e.preventDefault(); setUploadModalOpen(true) }}>Tải CV ngay</a>
          </div>
        </section>

        <section className="section" id="support-hotline" style={{ padding: '40px 0', background: 'linear-gradient(90deg, #0bb24d, #14a44d)' }}>
          <div className="container">
            <h3 style={{ color: 'white', margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>Hotline Tư Vấn</h3>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ display: 'inline-block', padding: '6px 12px', background: '#e8f5e9', color: '#00B14F', borderRadius: 999, fontWeight: 600 }}>Dành cho Người tìm việc</span>
                </div>
                <h2 style={{ margin: '8px 0 20px', fontSize: 28, lineHeight: 1.2, color: '#111827' }}>Tìm việc khó đã có HiWork</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <a href="tel:0123456789" style={{ background: '#00B14F', color: '#fff', borderRadius: 999, padding: '10px 16px', fontWeight: 700, textDecoration: 'none' }}>0123456789</a>
                  <Button type="primary" shape="round" style={{ background: '#00B14F', borderColor: '#00B14F', fontWeight: 700 }} onClick={() => (window.location.href = 'tel:0123456789')}>GỌI NGAY</Button>
                </div>
                <div style={{ color: '#334155' }}>
                  <div style={{ fontSize: 14 }}>Email hỗ trợ Ứng viên: <a href="mailto:hiwork@gmail.com">hiwork@gmail.com</a></div>
                </div>
              </div>
              <div style={{ flex: '0 0 320px', textAlign: 'center' }}>
                <img src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/job-new/hotline.png" alt="Hỗ trợ HiWork" style={{ width: '100%', maxWidth: 360 }} />
              </div>
            </div>
          </div>
        </section>

        <Modal
          title="Tải CV PDF"
          open={uploadModalOpen}
          onCancel={() => setUploadModalOpen(false)}
          footer={null}
        >
          <Upload.Dragger
            multiple={false}
            accept="application/pdf"
            beforeUpload={async (f) => { await handleUploadPdf(f as File); return false as any; }}
            showUploadList={false}
            disabled={uploadingCv}
          >
            <p className="ant-upload-drag-icon">
              <span role="img" aria-label="inbox">📄</span>
            </p>
            <p className="ant-upload-text">Kéo thả hoặc bấm để chọn file PDF</p>
            <p className="ant-upload-hint">Chỉ hỗ trợ tệp .pdf, dung lượng phù hợp</p>
          </Upload.Dragger>
        </Modal>
      </Layout.Content>
      <Footer />
    </Layout>
  )
}

export default Home
