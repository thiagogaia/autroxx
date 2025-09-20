'use client';

import React from 'react';
import './space-background.css';

interface SpaceBackGroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function SpaceBackGround({ children, className = '' }: SpaceBackGroundProps) {
  return (
    <div className={`space-background ${className}`}>
      <div className="starfield"></div>
      {children}
    </div>
  );
}
