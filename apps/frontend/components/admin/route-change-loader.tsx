'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function RouteChangeLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div style={{ position: 'relative', minHeight: 'inherit' }}>
      {visible && (
        <div
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-white/90 transition-opacity duration-300"
          aria-hidden="true"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-full bg-[--color-primary]"
                style={{
                  animation: 'dotBounce 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">Loading</span>
        </div>
      )}
      {children}
    </div>
  );
}
