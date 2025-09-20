'use client';

import React, { useEffect, useRef, useState } from 'react';
import './fire-insignia.css';

interface FireInsigniaProps {
  className?: string;
  fireType?: 'inferno' | 'hellfire' | 'blaze' | 'ember';
  showText?: boolean;
  text?: string;
}

const fireTypes = {
  inferno: {
    text: 'INFERNO MASTER',
    colors: {
      primary: 'rgba(255, 69, 0, 0.9)',
      secondary: 'rgba(255, 140, 0, 0.8)',
      accent: 'rgba(255, 255, 255, 0.3)',
      core: 'rgba(255, 255, 255, 0.9)'
    }
  },
  hellfire: {
    text: 'HELLFIRE LORD',
    colors: {
      primary: 'rgba(255, 0, 0, 0.9)',
      secondary: 'rgba(255, 69, 0, 0.8)',
      accent: 'rgba(255, 255, 255, 0.4)',
      core: 'rgba(255, 255, 255, 1)'
    }
  },
  blaze: {
    text: 'BLAZE WARRIOR',
    colors: {
      primary: 'rgba(255, 165, 0, 0.9)',
      secondary: 'rgba(255, 140, 0, 0.8)',
      accent: 'rgba(255, 255, 255, 0.3)',
      core: 'rgba(255, 255, 255, 0.8)'
    }
  },
  ember: {
    text: 'EMBER SAGE',
    colors: {
      primary: 'rgba(139, 69, 19, 0.9)',
      secondary: 'rgba(255, 69, 0, 0.8)',
      accent: 'rgba(255, 255, 255, 0.2)',
      core: 'rgba(255, 255, 255, 0.7)'
    }
  }
};

export default function FireInsignia({ 
  className = '', 
  fireType = 'inferno',
  showText = true,
  text
}: FireInsigniaProps) {
  const fireBadgeRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState(fireType);

  const selectedType = fireTypes[currentType];
  const displayText = text || selectedType.text;

  // Atualiza cores quando o tipo muda
  useEffect(() => {
    if (fireBadgeRef.current) {
      const colors = selectedType.colors;
      
      // Atualiza CSS custom properties
      fireBadgeRef.current.style.setProperty('--fire-primary', colors.primary);
      fireBadgeRef.current.style.setProperty('--fire-secondary', colors.secondary);
      fireBadgeRef.current.style.setProperty('--fire-accent', colors.accent);
      fireBadgeRef.current.style.setProperty('--fire-core', colors.core);
    }
  }, [currentType]);

  return (
    <div 
      ref={fireBadgeRef}
      className={`fire-badge ${className}`}
    >
      <div className="badge-base"></div>
      <div className="heat-aura"></div>
      <div className="flame-outer"></div>
      <div className="flame-middle"></div>
      <div className="flame-core"></div>
      <div className="flame-hotcore"></div>
      
      {/* Brasas flutuantes com posições específicas */}
      <div className="ember ember1"></div>
      <div className="ember ember2"></div>
      <div className="ember ember3"></div>
      <div className="ember ember4"></div>
      <div className="ember ember5"></div>
      
      {/* Pontos de calor com posições específicas */}
      <div className="heat-point heat-point1"></div>
      <div className="heat-point heat-point2"></div>
      <div className="heat-point heat-point3"></div>
      <div className="heat-point heat-point4"></div>
      
      {showText && (
        <div className="badge-text">{displayText}</div>
      )}
    </div>
  );
}
