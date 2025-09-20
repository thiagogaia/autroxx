'use client';

import React from 'react';
import './medieval-background.css';

interface MedievalBackGroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function MedievalBackGround({ children, className = '' }: MedievalBackGroundProps) {
  return (
    <div className={`medieval-background ${className}`}>
      {children}
    </div>
  );
}
