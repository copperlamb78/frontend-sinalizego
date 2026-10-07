import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/core/utils/cn';

export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
}

/**
 * Componente atômico para revelação suave com fade-in e slide
 * baseado em IntersectionObserver nativo de alta performance.
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 700,
  direction = 'up',
  threshold = 0.1,
  className,
  style,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Se IntersectionObserver não estiver disponível, exibe imediatamente
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const directionClasses = {
    up: isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
    down: isVisible ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0',
    left: isVisible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0',
    right: isVisible ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0',
    none: isVisible ? 'opacity-100' : 'opacity-0',
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      className={cn(
        'transition-all will-change-[transform,opacity]',
        directionClasses[direction],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
