import React, { useMemo, useState } from 'react'
import { Input, Button, Tag, Select } from 'antd'
import provincesData from 'provinces'
import { fetchFeaturedCategories } from '../apis/jobs.api'
import HeroBanner from './HeroBanner'

type HeroSearchProps = {
  onSearch?: (keyword: string, location: string, category?: string) => void
  initialKeyword?: string
  initialLocation?: string
  compact?: boolean
  fluid?: boolean
  resultsVariant?: boolean
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, initialKeyword, initialLocation, compact, fluid, resultsVariant }) => {
  const [keyword, setKeyword] = useState(initialKeyword || '')
  const [location, setLocation] = useState(initialLocation || '')
  const [category, setCategory] = useState<string>('')
  const [categories, setCategories] = useState<Array<{ _id: string; title: string; slug: string }>>([])
  const catPages = useMemo(() => {
    const pageSize = 6
    const pages: Array<Array<{ _id: string; title: string; slug: string }>> = []
    for (let i = 0; i < categories.length; i += pageSize) {
      pages.push(categories.slice(i, i + pageSize))
    }
    return pages
  }, [categories])
  const [catPage, setCatPage] = useState(0)

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
      // Fallback minimal list
      vn = [
        { name: 'Hà Nội' }, { name: 'Hồ Chí Minh' }, { name: 'Đà Nẵng' }, { name: 'Hải Phòng' }, { name: 'Cần Thơ' },
        { name: 'Bắc Ninh' }, { name: 'Quảng Ninh' }, { name: 'Thanh Hóa' }, { name: 'Nghệ An' }, { name: 'Khánh Hòa' }
      ]
    }
    return vn.map((p: any) => ({ value: p.name, label: p.name }))
  }, [])

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetchFeaturedCategories()
        setCategories(res.data?.map((c) => ({ _id: (c as any)._id, title: (c as any).title, slug: (c as any).slug })) || [])
        setCatPage(0)
      } catch {
        setCategories([])
      }
    })()
  }, [])

  // Sync when initial values change (e.g., coming from URL on search page)
  React.useEffect(() => {
    if (initialKeyword !== undefined) setKeyword(initialKeyword)
  }, [initialKeyword])

  React.useEffect(() => {
    if (initialLocation !== undefined) setLocation(initialLocation)
  }, [initialLocation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(keyword.trim(), location.trim(), category || undefined)
  }

  const quickTags = ['Thực tập', 'Backend', 'Frontend', 'Java', 'Tester', 'Kế toán']

  return (
    <section className={`hero${compact ? ' hero-compact' : ''}${resultsVariant ? ' hero-results' : ''}`}>
      <div className={fluid ? undefined : "container"} style={fluid ? { maxWidth: '100%', padding: '80px 50px' } : undefined}>
        <h1>Việc làm tốt, lương cao cho bạn</h1>
        <p>Tìm công việc mơ ước với hàng ngàn tin tuyển dụng mỗi ngày</p>
        <form className="search-bar" onSubmit={handleSubmit}>
          <div className="input-group">
            <Select
              showSearch
              allowClear
              placeholder="Danh mục Nghề"
              size="large"
              style={{ width: '100%' }}
              value={category || undefined}
              options={categories.map((c) => ({ value: c.title, label: c.title }))}
              onChange={(v) => setCategory(v || '')}
            />
          </div>
          <div className="input-group">
            <Input
              placeholder="Vị trí, kỹ năng, công ty..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              size="large"
            />
          </div>
          <div className="input-group">
            <Select
              showSearch
              allowClear
              placeholder="Địa điểm"
              size="large"
              style={{ width: '100%' }}
              value={location || undefined}
              options={vnOptions}
              filterOption={(input, option) => {
                const src = toAscii(option?.label?.toString() || '')
                return src.includes(toAscii(input))
              }}
              onChange={(v) => setLocation(v || '')}
            />
          </div>
          <Button type="primary" htmlType="submit" size="large">Tìm kiếm</Button>
        </form>
        <div className="quick-tags">
          <span className="quick-label">Gợi ý:</span>
          {quickTags.map((tag) => (
            <Tag key={tag} color="#d1fae5" style={{ color: '#065f46', cursor: 'pointer' }} onClick={() => setKeyword(tag)}>
              {tag}
            </Tag>
          ))}
        </div>
        <div className="hero-lower">
          <div className="hero-left">
            <ul className="hero-cat-list">
              {(catPages[catPage] || []).map((c) => (
                <li key={c._id} className="hero-cat-item" onClick={() => setKeyword(c.title)}>
                  <span className="hero-cat-name">{c.title}</span>
                  <span className="chev">›</span>
                </li>
              ))}
            </ul>
            <div className="hero-cat-nav">
              <button type="button" className="hero-nav-btn" onClick={() => setCatPage((p) => Math.max(0, p - 1))}>‹</button>
              <span className="hero-page">{(catPage + 1)} / {Math.max(1, catPages.length || 1)}</span>
              <button type="button" className="hero-nav-btn" onClick={() => setCatPage((p) => Math.min(Math.max(0, catPages.length - 1), p + 1))}>›</button>
            </div>
          </div>
          <div className="hero-right">
            <HeroBanner />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSearch


