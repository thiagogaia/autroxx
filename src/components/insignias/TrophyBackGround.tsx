'use client';

import React from 'react';
import './trophy-background.css';

interface TrophyBackGroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function TrophyBackGround({ children, className = '' }: TrophyBackGroundProps) {
  return (
    <div className={`trophy-background ${className}`}>
      {children}
    </div>
  );
}
