'use client';

import React from 'react';
import './discord-background.css';

interface DiscordBackGroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function DiscordBackGround({ children, className = '' }: DiscordBackGroundProps) {
  return (
    <div className={`discord-background ${className}`}>
      <div className="discord-pattern"></div>
      {children}
    </div>
  );
}
