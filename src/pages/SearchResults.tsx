import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout, Card, Tag, Space, Input, Select, Slider, Button, Empty, Row, Col, Checkbox, Radio } from 'antd'
import provincesData from 'provinces'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSearch from '../components/HeroSearch'
import { fetchJobs } from '../apis/jobs.api'
import type { JobData } from '../types/models'

const useQuery = () => new URLSearchParams(useLocation().search)

const SearchResults: React.FC = () => {
  const query = useQuery()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<JobData[]>([])
  const [total, setTotal] = useState(0)

  // Filters state
  const [keyword, setKeyword] = useState<string>(query.get('q') || '')
  const [location, setLocation] = useState<string>(query.get('loc') || '')
  const [categories, setCategories] = useState<string[]>(query.get('cat') ? [query.get('cat') as string] : [])
  const [jobType, setJobType] = useState<string | undefined>(query.get('type') || undefined)
  const [level, setLevel] = useState<string | undefined>(query.get('lv') || undefined)
  const [experience, setExperience] = useState<string | undefined>(query.get('exp') || undefined)
  const [salary, setSalary] = useState<[number, number]>([0, 0])

  const params = useMemo(() => ({
    search: [keyword, location].filter(Boolean).join(' ').trim(),
    location,
    categories,
    jobType,
    level,
    experience,
    salaryMin: salary[0] || undefined,
    salaryMax: salary[1] || undefined,
    page: 1,
    limit: 12,
    status: 'active' as const,
  }), [keyword, location, categories, jobType, level, experience, salary])

  // Build VN province options from 'provinces'
  const toAscii = (s: string) => s
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

  const vnOptions = useMemo(() => {
    const list: any[] = Array.isArray((provincesData as any)) ? (provincesData as any) : []
    let vn = list.filter((p: any) => {
      const country = String(p?.country || p?.country_code || p?.countryCode || '')
      return /^VN|VNM$/i.test(country)
    })
    if (vn.length === 0) {
      vn = [
        { name: 'Hà Nội' }, { name: 'Hồ Chí Minh' }, { name: 'Đà Nẵng' }, { name: 'Hải Phòng' }, { name: 'Cần Thơ' },
        { name: 'Bắc Ninh' }, { name: 'Quảng Ninh' }, { name: 'Thanh Hóa' }, { name: 'Nghệ An' }, { name: 'Khánh Hòa' }
      ]
    }
    return vn.map((p: any) => ({ value: p.name, label: p.name }))
  }, [])

  // NOTE: Prefer server-side regex search to avoid double-filtering. Render server results directly.

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const { data, total } = await fetchJobs(params)
        setJobs(data)
        setTotal(total)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params])

  const applyFilters = () => {
    const q = new URLSearchParams()
    if (keyword) q.set('q', keyword)
    if (location) q.set('loc', location)
    if (categories.length) q.set('cat', categories.join(','))
    if (jobType) q.set('type', jobType)
    if (level) q.set('lv', level)
    if (experience) q.set('exp', experience)
    navigate(`/search?${q.toString()}`)
  }

  const handleTopSearch = (kw: string, loc: string, cat?: string) => {
    setKeyword(kw)
    setLocation(loc)
    if (cat !== undefined) {
      setCategories(cat ? [cat] : [])
    }
    const q = new URLSearchParams()
    if (kw) q.set('q', kw)
    if (loc) q.set('loc', loc)
    if (cat) {
      q.set('cat', cat)
    } else if (categories.length) {
      q.set('cat', categories.join(','))
    }
    if (jobType) q.set('type', jobType)
    if (level) q.set('lv', level)
    if (experience) q.set('exp', experience)
    navigate(`/search?${q.toString()}`)
  }

  return (
    <Layout>
      <Header />
      <Layout.Content style={{ background: '#F3F5F7' }}>
        <div style={{ padding: 0 }}>
          <div style={{ padding: 0 }}>
            <HeroSearch onSearch={handleTopSearch} initialKeyword={keyword} initialLocation={location} compact fluid resultsVariant />
          </div>
          <div className="container" style={{ padding: '24px 0' }}>
          <Row gutter={[16, 16]}>
            {/* Filters */}
            <Col xs={24} md={8} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Input placeholder="Từ khóa (tên job, công ty, ngành)" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                  <Select
                    showSearch
                    allowClear
                    placeholder="Địa điểm"
                    options={vnOptions}
                    value={location || undefined}
                    filterOption={(input, option) => {
                      const src = toAscii(option?.label?.toString() || '')
                      return src.includes(toAscii(input))
                    }}
                    onChange={(v) => setLocation(v || '')}
                  />
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Theo danh mục nghề</div>
                    <Checkbox.Group
                      style={{ display: 'grid', gap: 8 }}
                      value={categories}
                      onChange={(vals) => setCategories(vals as string[])}
                    >
                      <Checkbox value="Kế toán">Kế toán</Checkbox>
                      <Checkbox value="Marketing">Marketing</Checkbox>
                      <Checkbox value="Bán lẻ / Dịch vụ tiêu dùng">Sales Bán lẻ/Dịch vụ tiêu dùng</Checkbox>
                      <Checkbox value="CSKH">Chăm sóc khách hàng</Checkbox>
                      <Checkbox value="Quản lý dự án xây dựng">Quản lý dự án xây dựng</Checkbox>
                    </Checkbox.Group>
                  </div>
                  <Select
                    allowClear
                    placeholder="Hình thức"
                    options={[
                      { value: 'Full-time', label: 'Full-time' },
                      { value: 'Part-time', label: 'Part-time' },
                      { value: 'Internship', label: 'Internship' },
                    ]}
                    value={jobType}
                    onChange={(v) => setJobType(v)}
                  />
                  <Select
                    allowClear
                    placeholder="Cấp bậc"
                    options={[
                      { value: 'Nhân viên', label: 'Nhân viên' },
                      { value: 'Trưởng nhóm', label: 'Trưởng nhóm' },
                      { value: 'Trưởng/Phó phòng', label: 'Trưởng/Phó phòng' },
                      { value: 'Quản lý/Giám sát', label: 'Quản lý / Giám sát' },
                      { value: 'Trưởng chi nhánh', label: 'Trưởng chi nhánh' },
                      { value: 'Phó giám đốc', label: 'Phó giám đốc' },
                      { value: 'Giám đốc', label: 'Giám đốc' },
                      { value: 'Thực tập sinh', label: 'Thực tập sinh' },
                    ]}
                    value={level}
                    onChange={(v) => setLevel(v)}
                  />
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Kinh nghiệm</div>
                    <Radio.Group value={experience} onChange={(e) => setExperience(e.target.value)} style={{ display: 'grid', gap: 6 }}>
                      <Radio value={undefined as any}>Tất cả</Radio>
                      <Radio value={'Không yêu cầu'}>Không yêu cầu</Radio>
                      <Radio value={'Dưới 1 năm'}>Dưới 1 năm</Radio>
                      <Radio value={'2 năm'}>2 năm</Radio>
                      <Radio value={'3 năm'}>3 năm</Radio>
                      <Radio value={'4 năm'}>4 năm</Radio>
                      <Radio value={'5 năm'}>5 năm</Radio>
                      <Radio value={'Trên 5 năm'}>Trên 5 năm</Radio>
                    </Radio.Group>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Mức lương</div>
                    <Slider range min={0} max={60} step={5} value={salary} onChange={(v) => setSalary(v as [number, number])} tooltip={{ formatter: (v) => `${v} triệu` }} />
                  </div>
                  <Button type="primary" onClick={applyFilters}>Áp dụng</Button>
                </Space>
              </Card>
            </Col>

            {/* Results */}
            <Col xs={24} md={16} lg={18}>
              <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>Kết quả tìm kiếm ({total})</div>
                </div>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {!loading && jobs.length === 0 ? (
                    <Empty description="Không có kết quả phù hợp" />
                  ) : (
                    jobs.map((job) => {
                      const companyObj: any = (job as any).company || (job as any).companyId;
                      const logo: string | undefined = (job as any).companyLogo || companyObj?.logo;
                      return (
                      <div key={job._id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, padding: 12, display: 'flex', gap: 12 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, background: '#d1fae5', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#00b14f', overflow: 'hidden' }}>
                          {logo ? (
                            <img src={logo} alt={companyObj?.name || 'logo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span>{(companyObj?.name || job.title || 'J').charAt(0)}</span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{job.title}</div>
                          <div style={{ color: '#0f766e', fontSize: 12 }}>{job.location || companyObj?.address || '—'}</div>
                          <Space wrap size={4} style={{ marginTop: 6 }}>
                            {job.jobType && <Tag>{job.jobType}</Tag>}
                            {job.level && <Tag color="orange">{job.level}</Tag>}
                            {job.skills?.slice(0, 3).map(s => <Tag key={s}>{s}</Tag>)}
                          </Space>
                        </div>
                        <div>
                          <Button type="link" onClick={() => navigate(`/jobs/${job.slug}`)}>Xem</Button>
                        </div>
                      </div>)
                    })
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
          </div>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  )
}

export default SearchResults


