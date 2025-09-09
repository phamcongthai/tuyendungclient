import React from 'react'
import { Card, Skeleton } from 'antd'

export const HotJobCardSkeleton: React.FC = () => {
  return (
    <Card className="hot-job-card" hoverable>
      <div className="hot-job-inner">
        <Skeleton.Avatar active shape="square" size={56} />
        <div className="hot-job-content" style={{ width: '100%' }}>
          <Skeleton.Input active size="small" style={{ width: '90%', height: 20 }} />
          <Skeleton.Input active size="small" style={{ width: '60%', marginTop: 6 }} />
          <div className="hot-job-tags" style={{ marginTop: 8 }}>
            <Skeleton.Button active size="small" style={{ width: 100 }} />
            <Skeleton.Button active size="small" style={{ width: 80 }} />
          </div>
        </div>
        <Skeleton.Button active style={{ width: 36, height: 36, borderRadius: 999 }} />
      </div>
    </Card>
  )
}

export default HotJobCardSkeleton


