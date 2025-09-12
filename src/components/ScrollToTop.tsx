import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  behavior?: 'smooth' | 'auto' | 'instant';
  delay?: number;
  offset?: number;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  behavior = 'smooth', 
  delay = 0,
  offset = 0 
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Add delay if specified
    const scrollToTop = () => {
      window.scrollTo({
        top: offset,
        left: 0,
        behavior: behavior
      });
    };

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [pathname, behavior, delay, offset]);

  return null;
};

export default ScrollToTop;
