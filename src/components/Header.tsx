import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { useUser } from '../contexts/UserContext'
import UserProfileDropdown from './UserProfileDropdown'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useUser()

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
        <div className="actions">
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
        </div>
      </div>
    </Layout.Header>
  )
}

export default Header


