import React from 'react'
import { Layout } from 'antd'

export const Footer: React.FC = () => {
  return (
    <Layout.Footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">TopJobs</div>
          <p>Tìm kiếm công việc phù hợp và xây dựng sự nghiệp của bạn.</p>
        </div>
        <div>
          <h4>Về chúng tôi</h4>
          <ul>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Giới thiệu</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Tuyển dụng</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Liên hệ</a></li>
          </ul>
        </div>
        <div>
          <h4>Dành cho ứng viên</h4>
          <ul>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Việc làm mới nhất</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Công ty hàng đầu</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Mẫu CV</a></li>
          </ul>
        </div>
        <div>
          <h4>Hỗ trợ</h4>
          <ul>
            <li>Email: support@topjobs.vn</li>
            <li>Hotline: 0123 456 789</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} TopJobs</div>
    </Layout.Footer>
  )
}

export default Footer


