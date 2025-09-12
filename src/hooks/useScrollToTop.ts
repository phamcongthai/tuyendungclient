import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UseScrollToTopOptions {
  behavior?: 'smooth' | 'auto' | 'instant';
  delay?: number;
  offset?: number;
  enabled?: boolean;
}

export const useScrollToTop = (options: UseScrollToTopOptions = {}) => {
  const {
    behavior = 'smooth',
    delay = 0,
    offset = 0,
    enabled = true
  } = options;

  const { pathname } = useLocation();

  useEffect(() => {
    if (!enabled) return;

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
  }, [pathname, behavior, delay, offset, enabled]);
};

export default useScrollToTop;
