import React from 'react'
import { Card, Avatar } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCartOutlined,
  BankOutlined,
  LaptopOutlined,
  TeamOutlined,
  ReadOutlined,
  BuildOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  BarChartOutlined,
} from '@ant-design/icons'

type CategoryItem = {
  _id: string
  title: string
  slug: string
  logo?: string
  jobCount: number
}

type CategoryCardProps = { category: CategoryItem }

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate()
  const pickIcon = (title?: string) => {
    const t = (title || '').toLowerCase()
    const green = { color: '#00b14f' } as React.CSSProperties
    if (/công nghệ|it|phần mềm|lập trình|developer|kỹ sư/i.test(t)) return <LaptopOutlined style={green} />
    if (/kinh doanh|bán hàng|sale|sales|thương mại/i.test(t)) return <ShoppingCartOutlined style={green} />
    if (/ngân hàng|tài chính|chứng khoán|đầu tư/i.test(t)) return <BankOutlined style={green} />
    if (/kế toán|kiểm toán|tax|account/i.test(t)) return <BarChartOutlined style={green} />
    if (/giáo dục|đào tạo|học thuật|teacher/i.test(t)) return <ReadOutlined style={green} />
    if (/xây dựng|cơ khí|kỹ thuật/i.test(t)) return <BuildOutlined style={green} />
    if (/y tế|bác sĩ|dược|health|medical/i.test(t)) return <MedicineBoxOutlined style={green} />
    if (/khoa học|data|ai|ml|machine learning|scientist/i.test(t)) return <ExperimentOutlined style={green} />
    if (/nhân sự|tuyển dụng|hr/i.test(t)) return <TeamOutlined style={green} />
    return <LaptopOutlined style={green} />
  }
  return (
    <Card 
      className="category-card" 
      hoverable 
      onClick={() => navigate(`/search?cat=${encodeURIComponent(category.title)}`)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar 
          size={44} 
          src={category.logo}
          icon={!category.logo ? pickIcon(category.title) : undefined}
          style={{ backgroundColor: '#d1fae5', color: '#00b14f' }}
        >
          {!category.logo ? pickIcon(category.title) : null}
        </Avatar>
        <div className="category-content">
          <div className="category-name">{category.title}</div>
          <div className="category-count">{category.jobCount.toLocaleString()} việc làm</div>
        </div>
      </div>
    </Card>
  )
}

export default CategoryCard


