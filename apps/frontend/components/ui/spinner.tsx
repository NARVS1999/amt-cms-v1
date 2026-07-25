'use client';

import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const sizeMap = { sm: 14, default: 20, lg: 28 };

function Spinner({ size = 'default', className }: SpinnerProps) {
  const px = sizeMap[size];
  return (
    <span role="status">
      <LoaderCircle
        className={cn('animate-spin', className)}
        size={px}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </span>
  );
}

export { Spinner };
