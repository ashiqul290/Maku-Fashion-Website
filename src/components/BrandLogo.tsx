import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  inverted = false,
  className = '',
  onClick
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { icon: 38, title: 'text-base sm:text-lg', subtitle: 'text-[9px]' };
      case 'lg':
        return { icon: 56, title: 'text-2xl', subtitle: 'text-[11px]' };
      case 'xl':
        return { icon: 76, title: 'text-3xl', subtitle: 'text-xs' };
      case 'md':
      default:
        return { icon: 46, title: 'text-lg sm:text-xl', subtitle: 'text-[10px]' };
    }
  };

  const dim = getDimensions();

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 select-none cursor-pointer group ${className}`}
    >
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105 border border-[#C5A059]/50 shadow-sm bg-[#FAF8F5]"
        style={{
          width: dim.icon,
          height: dim.icon,
        }}
        aria-hidden="true"
      >
        <span className="flex h-full w-full items-center justify-center font-serif text-2xl font-bold text-[#B38838]">
          M
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col min-w-0">
        <span
          className={`tracking-tight sm:tracking-wide font-bold leading-tight ${dim.title} ${
            inverted ? 'text-amber-100/95' : 'text-[#1F1D1B]'
          } truncate`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Maku <span className="text-[#B38838]">Collection</span>
        </span>

        {showSubtitle && (
          <span
            className={`hidden sm:block tracking-[0.22em] uppercase font-medium ${dim.subtitle} ${
              inverted ? 'text-amber-200/70' : 'text-[#8A7B6E]'
            }`}
          >
            Cookware • Kitchenware • Appliances
          </span>
        )}
      </div>
    </div>
  );
};
