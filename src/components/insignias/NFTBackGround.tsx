'use client';

import React from 'react';
import './nft-background.css';

interface NFTBackGroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function NFTBackGround({ children, className = '' }: NFTBackGroundProps) {
  return (
    <div className={`nft-background ${className}`}>
      {children}
    </div>
  );
}
