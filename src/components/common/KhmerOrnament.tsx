import React from 'react';

export const KhmerDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-full max-w-xs mx-auto my-4',
  color = '#d4af37',
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#d4af37] to-[#d4af37]/40" />
      <svg
        width="28"
        height="28"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-amber-600 drop-shadow-sm flex-shrink-0"
      >
        {/* Ornate Khmer Lotus Centerpiece */}
        <path
          d="M20 4C20 4 23 12 28 14C33 16 38 20 38 20C38 20 31 22 28 26C25 30 20 36 20 36C20 36 15 30 12 26C9 22 2 20 2 20C2 20 7 16 12 14C17 12 20 4 20 4Z"
          fill={color}
          fillOpacity="0.85"
        />
        <circle cx="20" cy="20" r="4" fill="#ffffff" fillOpacity="0.9" />
        <circle cx="20" cy="20" r="2" fill={color} />
      </svg>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#d4af37] to-[#d4af37]/40" />
    </div>
  );
};

export const KhmerCorner: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
  color?: string;
}> = ({ position = 'top-left', className = '', size = 48, color = '#d4af37' }) => {
  const rotationClass = {
    'top-left': '',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }[position];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${rotationClass} ${className} pointer-events-none transition-transform`}
    >
      <path
        d="M2 2V28C2 28 8 20 18 18C28 16 28 2 28 2H2Z"
        fill={color}
        fillOpacity="0.25"
      />
      <path
        d="M2 2L50 2C42 10 32 12 24 16C16 20 12 32 2 50V2Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="6" cy="6" r="3" fill={color} />
      <circle cx="16" cy="6" r="1.5" fill={color} />
      <circle cx="6" cy="16" r="1.5" fill={color} />
    </svg>
  );
};

export const KhmerRoyalCrest: React.FC<{
  monogram?: string;
  groomInitials?: string;
  brideInitials?: string;
  title?: string;
  className?: string;
}> = ({ monogram = 'T & Y', groomInitials = 'T', brideInitials = 'Y', title = 'សិរីសួស្តី អាពាហ៍ពិពាហ៍', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="relative flex items-center justify-center w-24 h-24 mb-2">
        {/* Outer Golden Glow Circle */}
        <div className="absolute inset-0 rounded-full border border-[#c59b27]/60 shadow-[0_0_20px_rgba(197,155,39,0.3)] animate-pulse" />
        <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#c59b27]/80" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#fdfbf7] via-[#f7f2e9] to-[#eedfc4] flex items-center justify-center shadow-inner">
          <div className="font-serif font-bold text-[#4A0E17] text-base tracking-widest flex items-center justify-center">
            {monogram}
          </div>
        </div>

        {/* Traditional Crown Petals */}
        <svg
          className="absolute -top-3 w-8 h-8 text-[#c59b27] drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
        </svg>
      </div>

      {title && (
        <span className="font-moul text-[#4A0E17] tracking-wide text-sm md:text-base drop-shadow-sm">
          {title}
        </span>
      )}
    </div>
  );
};

export const KhmerWaxSeal: React.FC<{
  onClick?: () => void;
  isOpen?: boolean;
  label?: string;
}> = ({ onClick, isOpen = false, label = 'បើកធៀបអញ្ជើញ' }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group relative cursor-pointer outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
      aria-label="Open Invitation"
    >
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-700 via-red-800 to-amber-900 shadow-xl border-4 border-red-900/40 flex flex-col items-center justify-center p-2 text-amber-200">
        {/* Wax irregular rim effect */}
        <div className="absolute -inset-1 rounded-full border-2 border-red-600/30 opacity-70 blur-[1px]" />
        
        {/* Stamped Rings Monogram */}
        <svg
          className="w-8 h-8 text-amber-300 drop-shadow-md mb-0.5 group-hover:rotate-12 transition-transform duration-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="9" cy="12" r="5" strokeDasharray="28" strokeDashoffset="0" />
          <circle cx="15" cy="12" r="5" strokeDasharray="28" strokeDashoffset="0" />
          <path d="M12 7L13.5 9.5H10.5L12 7Z" fill="currentColor" />
        </svg>

        <span className="font-moul text-[10px] text-amber-200 drop-shadow tracking-wider text-center leading-tight">
          {isOpen ? 'ធៀបការ' : 'សិរីមង្គល'}
        </span>
      </div>

      {!isOpen && (
        <div className="mt-2 text-center">
          <span className="inline-block px-3 py-1 bg-amber-500/90 text-stone-900 text-xs font-medium rounded-full shadow-md animate-bounce">
            {label}
          </span>
        </div>
      )}
    </button>
  );
};

export const DamaskCornerOrnament: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
}> = ({ position, className = '', size = 80 }) => {
  const transform = {
    'top-left': '',
    'top-right': 'scale-x-[-1]',
    'bottom-left': 'scale-y-[-1]',
    'bottom-right': 'scale-[-1]',
  }[position];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${transform} ${className} pointer-events-none opacity-40`}
    >
      <path
        d="M5 5C25 5 45 15 55 35C45 25 35 22 20 25C15 26 10 32 12 38C14 44 22 45 28 42C38 37 42 22 58 20C72 18 85 28 92 40C82 32 68 30 55 38C45 44 42 55 45 65C48 75 58 82 68 80C78 78 82 68 78 60C72 48 55 52 50 42C48 38 50 32 55 30C62 27 75 35 85 45C75 42 62 48 60 58C58 68 68 75 75 72C65 72 58 65 58 55C58 45 68 38 80 40C90 42 96 52 95 62C94 75 82 88 68 92C50 97 32 88 25 72C18 56 22 38 10 25C7 21 5 12 5 5Z"
        fill="currentColor"
      />
      <circle cx="18" cy="18" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="32" cy="12" r="2.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
};

