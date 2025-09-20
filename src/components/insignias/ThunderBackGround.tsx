'use client';

import React from 'react';
import './thunder-background.css';

interface ThunderBackGroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function ThunderBackGround({ children, className = '' }: ThunderBackGroundProps) {
  return (
    <div className={`thunder-background ${className}`}>
      <div className="storm-clouds"></div>
      <div className="lightning-flash"></div>
      {children}
    </div>
  );
}
