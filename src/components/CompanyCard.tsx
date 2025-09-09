import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Company } from '../types/models'
import { Card, Tag } from 'antd'

type CompanyCardProps = {
  company: Company
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const navigate = useNavigate()
  const targetSlug = company.slug || company.id
  return (
    <Card 
      className="company-card" 
      hoverable 
      bodyStyle={{ padding: 14 }}
      style={{ width: '100%', height: 100, display: 'flex', cursor: targetSlug ? 'pointer' : 'default' }}
      onClick={() => { if (targetSlug) navigate(`/companies/${targetSlug}`) }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
        <div className="company-logo" aria-hidden style={{ overflow: 'hidden' }}>
          {company.logo ? (
            <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
          ) : (
            company.logoText ?? company.name.charAt(0)
          )}
        </div>
        <div className="company-info" style={{ minWidth: 0 }}>
          <div className="company-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.name}</div>
          {company.location && <div className="company-location" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.location}</div>}
          {company.hot && <Tag color="#d1fae5" style={{ color: '#065f46' }}>Hot</Tag>}
        </div>
      </div>
    </Card>
  )
}

export default CompanyCard


