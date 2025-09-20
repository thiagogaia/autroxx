'use client';

import React from 'react';
import './fire-background.css';

interface FireBackGroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function FireBackGround({ children, className = '' }: FireBackGroundProps) {
  return (
    <div className={`fire-background ${className}`}>
      {children}
    </div>
  );
}
