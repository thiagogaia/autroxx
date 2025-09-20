'use client';

import React from 'react';
import './hydro-background.css';

interface HydroBackGroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function HydroBackGround({ children, className = '' }: HydroBackGroundProps) {
  return (
    <div className={`hydro-background ${className}`}>
      <div className="ocean-waves"></div>
      {children}
    </div>
  );
}
