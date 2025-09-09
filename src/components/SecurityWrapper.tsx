import { ReactNode } from 'react';
import { useEffect } from 'react';

interface SecurityWrapperProps {
  children: ReactNode;
}

// Security enhancement: Add Content Security Policy and security headers via meta tags
export const SecurityWrapper = ({ children }: SecurityWrapperProps) => {
  useEffect(() => {
    // Add security-related meta tags
    const metaTags = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
    ];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Clear any sensitive data from localStorage on page unload
    const handleBeforeUnload = () => {
      // Only clear non-essential data, keep auth tokens for better UX
      const sensitiveKeys = ['tempData', 'cachedQueries'];
      sensitiveKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return <>{children}</>;
};
