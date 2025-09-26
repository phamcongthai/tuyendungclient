import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { useUser } from '../contexts/UserContext'
import UserProfileDropdown from './UserProfileDropdown'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useUser()
  const recruiterUrl = (import.meta as any).env?.VITE_API_RECRUITER_URL as string | undefined

  const handleMenuClick = (key: string) => {
    if (location.pathname === '/') {
      // Nếu đang ở trang chủ, scroll đến section tương ứng
      const element = document.getElementById(key)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Nếu không ở trang chủ, navigate về trang chủ và scroll
      navigate('/')
      setTimeout(() => {
        const element = document.getElementById(key)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  return (
    <Layout.Header className="site-header" style={{ background: '#ffffff', padding: 0 }}>
      <div className="container header-inner">
        <div className="brand" onClick={() => navigate('/')}>TopJobs</div>
        <Menu
          mode="horizontal"
          selectable={false}
          className="nav"
          items={[
            { 
              key: 'jobs', 
              label: <a href="#jobs" onClick={(e) => { e.preventDefault(); handleMenuClick('jobs') }}>Việc làm</a> 
            },
            { 
              key: 'companies', 
              label: <a href="#companies" onClick={(e) => { e.preventDefault(); handleMenuClick('companies') }}>Công ty</a> 
            },
            { 
              key: 'cv', 
              label: <a href="#" onClick={(e) => e.preventDefault()}>CV</a> 
            },
            { 
              key: 'blog', 
              label: <a href="#" onClick={(e) => e.preventDefault()}>Blog</a> 
            }
          ]}
        />
        <div className="actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {!loading && (
            <>
              {user ? (
                <UserProfileDropdown />
              ) : (
                <>
                  <Button type="default" onClick={() => navigate('/login')}>Đăng nhập</Button>
                  <Button type="primary" onClick={() => navigate('/register')}>Đăng ký</Button>
                </>
              )}
            </>
          )}
          {recruiterUrl && (
            <a
              href={recruiterUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                textDecoration: 'none'
              }}
            >
              <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1 }}>Bạn là nhà tuyển dụng?</span>
              <span style={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>Đăng tuyển ngay »</span>
            </a>
          )}
        </div>
      </div>
    </Layout.Header>
  )
}

export default Header


