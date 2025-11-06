import React, { useEffect, useState } from 'react';
import { Carousel, Empty, Spin } from 'antd';
import './banner.css';

type BannerPosition = 'BELOW_SEARCH_BAR' | 'BELOW_FEATURED_COMPANIES';

interface BannerItem {
  _id: string;
  title: string;
  imageUrl: string;
  redirectUrl?: string;
  altText?: string;
}

// Cấu hình responsive cho carousel
const responsiveSettings = [
  {
    breakpoint: 768, // Dưới 768px
    settings: {
      slidesToShow: 1, // Chỉ hiển thị 1 slide
      slidesToScroll: 1,
    },
  },
];

export const BannerCarousel: React.FC<{ position: BannerPosition }> = ({ position }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BannerItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_URL as string;
        const res = await fetch(`${base}/banners/position/${position}`);
        const data = await res.json();
        if (!mounted) return;
        setItems((Array.isArray(data) ? data : data?.data) || []);
      } catch {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [position]);

  if (loading) return <div className="banner-slot"><Spin /></div>;
  if (!items || items.length === 0) return <div className="banner-slot"><Empty description="Banner" /></div>;

  // Đảm bảo có đủ item để lặp vô hạn (nếu item ít hơn slidesToShow)
  const displayItems = items.length > 0 && items.length < 2 ? [...items, ...items] : items;

  return (
    <div className="banner-slot">
      <Carousel
        autoplay
        dots
        className="banner-carousel"
        slidesToShow={2}       // <-- THAY ĐỔI 1: Hiển thị 2 slide
        slidesToScroll={1}     // <-- THAY ĐỔI 2: Cuộn 1 slide mỗi lần cho mượt
        responsive={responsiveSettings} // <-- THAY ĐỔI 3: Thêm cấu hình responsive
      >
        {displayItems.map(item => (
          // Thêm một class 'banner-link' để dễ dàng style
          <a
            key={item._id}
            href={item.redirectUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="banner-link" // Thêm class cho thẻ <a>
          >
            <div className="banner-slide">
              <img src={item.imageUrl} alt={item.altText || item.title} className="banner-image" />
            </div>
          </a>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;