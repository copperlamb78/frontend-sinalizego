import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

// Using Cloudinary e_trim to remove surrounding canvas padding so the logo typography fills the height
const LOGO_BRAND_IMAGE_URL = 'https://res.cloudinary.com/dsg7aisg9/image/upload/e_trim,f_auto,q_auto/v1787494139/Blue_and_Black_Minimalist_Professional_Business_Brand_Logo_khpcbp.png';

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
    sm: { iconBox: 'w-7 h-7', brandImg: 'h-7 max-h-7', text: 'text-lg' },
    md: { iconBox: 'w-9 h-9', brandImg: 'h-9 sm:h-10 max-h-10', text: 'text-xl' },
    lg: { iconBox: 'w-12 h-12', brandImg: 'h-12 sm:h-14 max-h-14', text: 'text-3xl' },
    xl: { iconBox: 'w-16 h-16', brandImg: 'h-16 sm:h-20 max-h-20', text: 'text-4xl' }
  };

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      {/* Symbol / Icon: Calendar mark */}
      <div className={cn(
        'flex items-center justify-center rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0F766E] text-white shadow-lg shadow-teal-500/20 border border-teal-400/30 shrink-0',
        sizeMap[size].iconBox
      )}>
        <Calendar className="w-1/2 h-1/2" />
      </div>

      {/* Brand Name: Cloudinary Image trimmed to fill height + Text Fallback */}
      {showText && (
        <div className="flex items-center">
          {!imageError ? (
            <img
              src={LOGO_BRAND_IMAGE_URL}
              alt="SinalizeGO"
              className={cn('w-auto object-contain brightness-110 shrink-0 transition-all duration-200', sizeMap[size].brandImg)}
              onError={() => setImageError(true)}
            />
          ) : (
            <span className={cn('font-black text-[#F8FAFC] tracking-tight', sizeMap[size].text)}>
              Sinalize<span className="text-[#14B8A6]">GO</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
