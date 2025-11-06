import React, { useEffect, useState, useRef } from 'react';
import { Carousel, Empty, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

type BannerItem = {
  _id: string;
  title: string;
  imageUrl: string;
  redirectUrl?: string;
  altText?: string;
};

const SingleBannerCarousel: React.FC<{ position: string }> = ({ position }) => {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<any>(null);
  const bannerHeight = 200;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_URL as string;
        const res = await fetch(`${base}/banners/position/${position}`);
        const data = await res.json();
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : data?.data || []);
      } catch {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [position]);

  if (loading) return <div style={{ textAlign: 'center', padding: 16 }}><Spin /></div>;
  if (!items.length) return <Empty description="Chưa có quảng cáo" />;

  const groupedItems: BannerItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    groupedItems.push(items.slice(i, i + 2));
  }

  return (
    <div style={{ position: 'relative' }}>
      <Carousel
        ref={carouselRef}
        dots
        autoplay
        autoplaySpeed={4000}
        infinite={groupedItems.length > 1}
        slidesToShow={1}
        slidesToScroll={1}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      >
        {groupedItems.map((group, idx) => (
          <div key={idx} style={{ padding: 0 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              {group.map((b) => (
                <div key={b._id} style={{ flex: 1 }}>
                  {b.redirectUrl ? (
                    <a href={b.redirectUrl} target="_blank" rel="noreferrer">
                      <img
                        src={b.imageUrl}
                        alt={b.altText || b.title}
                        style={{ width: '100%', height: bannerHeight, display: 'block', objectFit: 'cover', borderRadius: 8 }}
                      />
                    </a>
                  ) : (
                    <img
                      src={b.imageUrl}
                      alt={b.altText || b.title}
                      style={{ width: '100%', height: bannerHeight, display: 'block', objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                </div>
              ))}
              {group.length === 1 && <div style={{ flex: 1 }} />}
            </div>
          </div>
        ))}
      </Carousel>
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
              background: 'rgba(255, 255, 255, 0.9)',
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
              background: 'rgba(255, 255, 255, 0.9)',
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

export default SingleBannerCarousel;
