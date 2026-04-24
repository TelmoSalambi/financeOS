import { useState, useEffect } from 'react';

/**
 * Reactive hook that tracks viewport width against a breakpoint.
 * Unlike reading window.innerWidth directly in render, this re-renders
 * the component when the viewport crosses the breakpoint.
 */
export const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);

  return isMobile;
};
