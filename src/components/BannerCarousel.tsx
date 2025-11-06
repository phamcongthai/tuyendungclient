import React, { useEffect, useState, useRef } from 'react';
import { Carousel, Empty } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

type BannerItem = {
  _id: string;
  title: string;
  imageUrl: string;
  redirectUrl?: string;
  altText?: string;
};

export const BannerCarousel: React.FC<{ position: string }> = ({ position }) => {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_URL;
        const res = await fetch(`${base}/banners/position/${position}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data?.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [position]);

  // Chia items thành các nhóm 2 banner mỗi slide
  const groupedItems: BannerItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    groupedItems.push(items.slice(i, i + 2));
  }

  if (loading) return null;
  if (!items.length) return <Empty description="Chưa có quảng cáo nào" />;

  return (
    <div style={{ width: '80%', margin: '0 auto', position: 'relative' }}>
      <Carousel
        ref={carouselRef}
        autoplay
        autoplaySpeed={3000}
        dots
        slidesToShow={2}
        slidesToScroll={2}
        infinite={groupedItems.length > 1}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      >
        {groupedItems.map((group, groupIndex) => (
          <div key={groupIndex} style={{ display: 'flex', gap: 16, padding: '0 8px' }}>
            {group.map((b) => (
              <div key={b._id} style={{ flex: 1 }}>
                {b.redirectUrl ? (
                  <a href={b.redirectUrl} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                    <img
                      src={b.imageUrl}
                      alt={b.altText || b.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'cover',
                        maxHeight: 320,
                        borderRadius: 8,
                      }}
                    />
                  </a>
                ) : (
                  <img
                    src={b.imageUrl}
                    alt={b.altText || b.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover',
                      maxHeight: 320,
                      borderRadius: 8,
                    }}
                  />
                )}
              </div>
            ))}
            {/* Nếu chỉ có 1 banner trong slide cuối, thêm placeholder để giữ layout */}
            {group.length === 1 && <div style={{ flex: 1 }} />}
          </div>
        ))}
      </Carousel>
      {/* Custom arrows */}
      {groupedItems.length > 1 && (
        <>
          <div
            onClick={() => carouselRef.current?.prev()}
            style={{
              position: 'absolute',
              left: -40,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: 24,
              color: '#1890ff',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <LeftOutlined />
          </div>
          <div
            onClick={() => carouselRef.current?.next()}
            style={{
              position: 'absolute',
              right: -40,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: 24,
              color: '#1890ff',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <RightOutlined />
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;


