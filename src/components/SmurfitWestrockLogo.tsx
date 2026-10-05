/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SmurfitWestrockLogoProps {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SmurfitWestrockLogo: React.FC<SmurfitWestrockLogoProps> = ({
  theme = 'light',
  size = 'md',
  className = '',
}) => {
  const isDark = theme === 'dark';
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg className={`${sizeClasses} aspect-[1.15] shrink-0`} viewBox="0 0 100 85" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="96" height="81" rx="18" fill={isDark ? '#0F172A' : '#002B49'} />
        <rect x="8" y="8" width="84" height="69" rx="14" stroke="#009FE3" strokeWidth="4" strokeDasharray="5 3" opacity="0.75" />
        <path d="M22 28H52C62 28 68 34 64 41C60 48 48 52 38 56C32 58 36 64 46 64H76" stroke="#009FE3" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 45H72" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="77" cy="27" r="3.5" fill="#10B981" />
      </svg>
      <div className="flex flex-col text-left">
        <span className={`font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'} ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}`}>
          Smurfit <span className="text-[#009FE3]">Westrock</span>
        </span>
        <span className={`font-mono text-[9px] tracking-wider uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
          Molino 4 · Medición Remota
        </span>
      </div>
    </div>
  );
};
