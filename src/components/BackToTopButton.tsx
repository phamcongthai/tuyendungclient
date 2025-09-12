import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

interface BackToTopButtonProps {
  threshold?: number; // Scroll threshold to show button
  behavior?: 'smooth' | 'auto' | 'instant';
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  threshold = 300,
  behavior = 'smooth',
  offset = 0,
  className,
  style
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: offset,
      left: 0,
      behavior: behavior
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      type="primary"
      shape="circle"
      icon={<VerticalAlignTopOutlined />}
      onClick={scrollToTop}
      className={className}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        width: '48px',
        height: '48px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        ...style
      }}
      aria-label="Scroll to top"
    />
  );
};

export default BackToTopButton;
