import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BlogsList from './pages/BlogsList'
import BlogDetail from './pages/BlogDetail'
import Register from './pages/Register'
import Login from './pages/Login'
import JobDetail from './pages/JobDetail'
import CompanyDetail from './pages/CompanyDetail'
import Profile from './pages/Profile'
import CvViewer from './pages/CvViewer'
import SearchResults from './pages/SearchResults'
import ScrollToTop from './components/ScrollToTop'
import BackToTopButton from './components/BackToTopButton'
import './styles.css'
import 'antd/dist/reset.css'
import { ConfigProvider, theme } from 'antd'
import { UserProvider } from './contexts/UserContext'
import { SocketProvider } from './contexts/SocketContext'
import { NotificationProvider } from './contexts/NotificationContext'
import AppliedJobs from './pages/AppliedJobs'
import { SettingsProvider } from './contexts/SettingsContext'

const App: React.FC = () => {
  return (
    <UserProvider>
      <SocketProvider>
        <NotificationProvider>
          <SettingsProvider>
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
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogsList />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/jobs/:slug" element={<JobDetail />} />
          <Route path="/companies/:slug" element={<CompanyDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/cv" element={<CvViewer />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/applications" element={<AppliedJobs />} />
        </Routes>
        <BackToTopButton />
        </ConfigProvider>
          </SettingsProvider>
        </NotificationProvider>
      </SocketProvider>
    </UserProvider>
  )
}

export default App
