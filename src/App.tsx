import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import JobDetail from './pages/JobDetail'
import CompanyDetail from './pages/CompanyDetail'
import Profile from './pages/Profile'
import CvViewer from './pages/CvViewer'
import SearchResults from './pages/SearchResults'
import './styles.css'
import 'antd/dist/reset.css'
import { ConfigProvider, theme } from 'antd'
import { UserProvider } from './contexts/UserContext'

const App: React.FC = () => {
  return (
    <UserProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#00b14f', // Màu xanh lá tươi sáng như TopCV
            colorLink: '#00b14f',
            colorLinkHover: '#009a45',
            colorTextBase: '#1a1a1a',
            colorBgBase: '#ffffff',
            colorBorder: '#e8f5e8',
            fontFamily:
              'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
            borderRadius: 8
          },
          components: {
            Button: { borderRadius: 8 },
            Card: { borderRadiusLG: 12 }
          }
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/jobs/:slug" element={<JobDetail />} />
          <Route path="/companies/:slug" element={<CompanyDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/cv" element={<CvViewer />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </ConfigProvider>
    </UserProvider>
  )
}

export default App
