import React from 'react'
import { Card, Avatar } from 'antd'

type CategoryItem = {
  _id: string
  title: string
  slug: string
  logo?: string
  jobCount: number
}

type CategoryCardProps = { category: CategoryItem }

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Card className="category-card" hoverable>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar size={44} src={category.logo}>
          {category.title?.charAt(0)}
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


