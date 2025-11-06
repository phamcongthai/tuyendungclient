import React, { useEffect, useRef, useState } from 'react';
import { Carousel, Empty, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

type BannerItem = {
  _id: string;
  title: string;
  imageUrl: string;
  redirectUrl?: string;
  altText?: string;
};

const HeroBanner: React.FC = () => {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<any>(null);
  const bannerHeight = 220;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_URL as string;
        const res = await fetch(`${base}/banners/position/BELOW_SEARCH_BAR`);
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
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: bannerHeight, background: '#fff', borderRadius: 12 }}><Spin /></div>;
  if (!items.length) return <div style={{ height: bannerHeight, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Empty description="Chưa có quảng cáo" /></div>;

  return (
    <div className="hero-right-banner" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: bannerHeight }}>
      <Carousel
        ref={carouselRef}
        autoplay
        autoplaySpeed={4000}
        dots
        slidesToShow={1}
        slidesToScroll={1}
        infinite={items.length > 1}
        style={{ height: bannerHeight }}
      >
        {items.map((b) => (
          <div key={b._id} style={{ height: bannerHeight }}>
            {b.redirectUrl ? (
              <a href={b.redirectUrl} target="_blank" rel="noreferrer">
                <img src={b.imageUrl} alt={b.altText || b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </a>
            ) : (
              <img src={b.imageUrl} alt={b.altText || b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
          </div>
        ))}
      </Carousel>
      {items.length > 1 && (
        <>
          <div
            onClick={() => carouselRef.current?.prev()}
            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <LeftOutlined />
          </div>
          <div
            onClick={() => carouselRef.current?.next()}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <RightOutlined />
          </div>
        </>
      )}
    </div>
  );
};

export default HeroBanner;
