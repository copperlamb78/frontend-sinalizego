import React from 'react';
import { cn } from '@/lib/utils';
import { Scissors } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  showText = true
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', badge: 'text-[10px]' },
    md: { icon: 'w-8 h-8', text: 'text-xl', badge: 'text-xs' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', badge: 'text-xs' },
    xl: { icon: 'w-14 h-14', text: 'text-4xl', badge: 'text-sm' }
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0F766E] text-white shadow-lg shadow-teal-500/20 border border-teal-400/30',
        sizeMap[size].icon
      )}>
        <Scissors className="w-1/2 h-1/2 -rotate-45" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
      </div>

      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={cn('font-black text-[#F8FAFC]', sizeMap[size].text)}>
            Sinalize<span className="text-[#14B8A6]">GO</span>
          </span>
          <span className={cn(
            'ml-1.5 px-1.5 py-0.5 rounded font-mono font-bold bg-[#1E293B] text-teal-400 border border-slate-700/60 uppercase tracking-widest',
            sizeMap[size].badge
          )}>
            SaaS
          </span>
        </div>
      )}
    </div>
  );
};
