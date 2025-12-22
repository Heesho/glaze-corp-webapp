import React from "react";

interface DonutLogoProps {
  className?: string;
}

export function DonutLogo({ className = "w-8 h-8" }: DonutLogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Dough (Bottom/Base Layer) */}
      <circle cx="256" cy="256" r="256" fill="#e4e4e7" />

      {/* Icing (Pink Layer) with wavy drip effect */}
      <path
        d="M256 0C114.6 0 0 114.6 0 256c0 14.8 1.3 29.3 3.6 43.4
           C25 310 50 340 85 320
           c35-20 50-10 70 15
           s45 20 70-15
           c25-35 55-25 80 0
           s50 20 75-10
           c25-30 55-20 80 10
           c15 18 30 15 48.4-3.4
           C510.7 285.3 512 270.8 512 256
           C512 114.6 397.4 0 256 0z"
        fill="#ec4899"
      />

      {/* Hole (Black Center) */}
      <circle cx="256" cy="256" r="90" fill="black" />
    </svg>
  );
}
