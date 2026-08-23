import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

const LOGO_IMAGE_URL = 'https://res.cloudinary.com/dsg7aisg9/image/upload/v1787494139/Blue_and_Black_Minimalist_Professional_Business_Brand_Logo_khpcbp.png';

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
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-lg', iconBox: 'w-7 h-7' },
    md: { img: 'w-9 h-9', text: 'text-xl', iconBox: 'w-9 h-9' },
    lg: { img: 'w-12 h-12', text: 'text-2xl', iconBox: 'w-12 h-12' },
    xl: { img: 'w-16 h-16', text: 'text-4xl', iconBox: 'w-16 h-16' }
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {!imageError ? (
        <img
          src={LOGO_IMAGE_URL}
          alt="SinalizeGO"
          className={cn('rounded-xl object-contain shadow-md shadow-teal-950/20 shrink-0', sizeMap[size].img)}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={cn(
          'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0F766E] text-white shadow-lg shadow-teal-500/20 border border-teal-400/30 shrink-0',
          sizeMap[size].iconBox
        )}>
          <Calendar className="w-1/2 h-1/2" />
        </div>
      )}

      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={cn('font-black text-[#F8FAFC]', sizeMap[size].text)}>
            Sinalize<span className="text-[#14B8A6]">GO</span>
          </span>
        </div>
      )}
    </div>
  );
};
