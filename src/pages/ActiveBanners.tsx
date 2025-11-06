import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Empty } from 'antd';
import BannerCarousel from '../components/BannerCarousel';

const { Title } = Typography;

const ActiveBanners: React.FC = () => {
  const positions = ['BELOW_SEARCH_BAR', 'BELOW_FEATURED_COMPANIES'];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quảng cáo hiện tại</Title>
      </Card>

      {positions.map((position) => (
        <Card key={position} style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            {position === 'BELOW_SEARCH_BAR' ? 'Banner dưới thanh tìm kiếm' : 'Banner dưới công ty nổi bật'}
          </Title>
          <BannerCarousel position={position} />
        </Card>
      ))}
    </div>
  );
};

export default ActiveBanners;



