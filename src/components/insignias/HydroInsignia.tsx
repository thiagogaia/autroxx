'use client';

import React, { useEffect, useRef, useState } from 'react';
import './hydro-insignia.css';

interface HydroInsigniaProps {
  className?: string;
  waterType?: 'hydro' | 'tsunami' | 'ice' | 'storm';
  showText?: boolean;
  text?: string;
}

const waterTypes = {
  hydro: {
    text: 'HYDRO MASTER',
    colors: {
      primary: 'rgba(0, 150, 255, 0.8)',
      secondary: 'rgba(100, 200, 255, 0.6)',
      accent: 'rgba(200, 240, 255, 0.4)'
    }
  },
  tsunami: {
    text: 'TSUNAMI LORD',
    colors: {
      primary: 'rgba(0, 100, 180, 0.9)',
      secondary: 'rgba(50, 150, 200, 0.7)',
      accent: 'rgba(100, 180, 220, 0.5)'
    }
  },
  ice: {
    text: 'FROST SAGE',
    colors: {
      primary: 'rgba(150, 200, 255, 0.8)',
      secondary: 'rgba(200, 230, 255, 0.6)',
      accent: 'rgba(230, 245, 255, 0.4)'
    }
  },
  storm: {
    text: 'STORM BRINGER',
    colors: {
      primary: 'rgba(100, 150, 255, 0.8)',
      secondary: 'rgba(150, 180, 255, 0.6)',
      accent: 'rgba(180, 200, 255, 0.4)'
    }
  }
};

export default function HydroInsignia({ 
  className = '', 
  waterType = 'hydro',
  showText = true,
  text
}: HydroInsigniaProps) {
  const badgeContainerRef = useRef<HTMLDivElement>(null);
  const waterBadgeRef = useRef<HTMLDivElement>(null);
  const waterDropsRef = useRef<HTMLDivElement>(null);
  const steamParticlesRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState(waterType);

  const selectedType = waterTypes[currentType];
  const displayText = text || selectedType.text;

  // Cria gotas de água
  const createWaterDrops = (count: number = 6) => {
    if (!waterDropsRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('div');
      drop.className = 'drop';
      
      const angle = (360 / count) * i + Math.random() * 45;
      const distance = 60 + Math.random() * 50;
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance;
      
      drop.style.left = `calc(50% + ${x}px)`;
      drop.style.top = `calc(50% + ${y}px)`;
      drop.style.animationDelay = (i * 0.3) + 's';
      drop.style.animationDuration = (3 + Math.random() * 2) + 's';
      
      waterDropsRef.current.appendChild(drop);
      
      setTimeout(() => drop.remove(), 5000);
    }
  };

  // Cria vapor
  const createSteam = (count: number = 8) => {
    if (!steamParticlesRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const steam = document.createElement('div');
      steam.className = 'steam';
      
      const x = Math.random() * 200 - 100;
      const y = Math.random() * 100 + 50;
      
      steam.style.left = `calc(50% + ${x}px)`;
      steam.style.top = `calc(50% + ${y}px)`;
      steam.style.animationDelay = (Math.random() * 2) + 's';
      steam.style.animationDuration = (4 + Math.random() * 2) + 's';
      
      steamParticlesRef.current.appendChild(steam);
      
      setTimeout(() => steam.remove(), 6000);
    }
  };

  // Explosão aquática no clique
  const createWaterExplosion = () => {
    createWaterDrops(12);
    createSteam(10);
    
    // Onda de choque
    if (badgeContainerRef.current) {
      const shockWave = document.createElement('div');
      shockWave.className = 'shock-wave';
      badgeContainerRef.current.appendChild(shockWave);
      
      setTimeout(() => shockWave.remove(), 1000);
    }
  };

  // Evento de clique
  const handleClick = () => {
    if (waterBadgeRef.current) {
      waterBadgeRef.current.classList.add('clicked');
      setTimeout(() => waterBadgeRef.current?.classList.remove('clicked'), 800);
    }
    createWaterExplosion();
  };

  // Movimento do mouse cria gotas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (Math.random() > 0.7 && waterDropsRef.current) {
      const rect = badgeContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const drop = document.createElement('div');
      drop.className = 'drop';
      drop.style.left = `calc(50% + ${x}px)`;
      drop.style.top = `calc(50% + ${y}px)`;
      drop.style.animationDuration = '2s';
      
      waterDropsRef.current.appendChild(drop);
      
      setTimeout(() => drop.remove(), 2000);
    }
  };

  // Efeitos automáticos
  useEffect(() => {
    const autoEffects = () => {
      createWaterDrops(4);
      createSteam(3);
    };

    const interval = setInterval(autoEffects, 5000);

    // Inicialização
    setTimeout(() => {
      createWaterDrops(8);
      createSteam(5);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Atualiza cores quando o tipo muda
  useEffect(() => {
    if (waterBadgeRef.current) {
      const colors = selectedType.colors;
      waterBadgeRef.current.style.background = `radial-gradient(ellipse at 30% 30%, 
        ${colors.primary} 0%,
        ${colors.secondary} 30%,
        ${colors.accent} 60%,
        ${colors.primary} 100%)`;
    }
  }, [currentType]);

  return (
    <div 
      ref={badgeContainerRef}
      className={`badge-container ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      <div className="tidal-ring"></div>
      
      <div ref={waterDropsRef} className="water-drops">
        {/* Gotas geradas dinamicamente */}
      </div>
      
      <div ref={steamParticlesRef} className="steam-particles">
        {/* Vapor gerado dinamicamente */}
      </div>
      
      <div ref={waterBadgeRef} className="water-badge">
        <div className="water-ripple"></div>
        <div className="water-ripple"></div>
        <div className="water-ripple"></div>
        
        <div className="water-reflection"></div>
        
        {/* Símbolo aquático SVG */}
        <svg className="water-symbol" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradientes aquáticos */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(200, 240, 255, 1)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgba(100, 200, 255, 0.9)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(0, 150, 255, 0.8)', stopOpacity:1}} />
            </linearGradient>
            
            <radialGradient id="dropGradient" cx="30%" cy="30%">
              <stop offset="0%" style={{stopColor:'rgba(255, 255, 255, 0.9)', stopOpacity:1}} />
              <stop offset="70%" style={{stopColor:'rgba(100, 200, 255, 0.7)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(0, 150, 255, 0.5)', stopOpacity:1}} />
            </radialGradient>
            
            {/* Filtro de brilho aquático */}
            <filter id="waterGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Onda principal */}
          <path id="mainWave" 
            d="M20 60 Q30 40, 40 60 T60 60 T80 60" 
            stroke="url(#waterGradient)" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
            filter="url(#waterGlow)">
            <animate attributeName="d" 
              values="M20 60 Q30 40, 40 60 T60 60 T80 60;M20 60 Q30 80, 40 60 T60 60 T80 60;M20 60 Q30 40, 40 60 T60 60 T80 60" 
              dur="3s" 
              repeatCount="indefinite"/>
          </path>
          
          {/* Onda secundária */}
          <path id="secondWave" 
            d="M15 50 Q25 35, 35 50 T55 50 T75 50 T85 50" 
            stroke="url(#waterGradient)" 
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round"
            opacity="0.7">
            <animate attributeName="d" 
              values="M15 50 Q25 35, 35 50 T55 50 T75 50 T85 50;M15 50 Q25 65, 35 50 T55 50 T75 50 T85 50;M15 50 Q25 35, 35 50 T55 50 T75 50 T85 50" 
              dur="3s" 
              begin="0.5s"
              repeatCount="indefinite"/>
          </path>
          
          {/* Gota principal */}
          <ellipse id="mainDrop" 
            cx="50" cy="25" 
            rx="12" ry="18" 
            fill="url(#dropGradient)" 
            filter="url(#waterGlow)">
            <animate attributeName="ry" 
              values="18;20;18" 
              dur="2s" 
              repeatCount="indefinite"/>
            <animate attributeName="opacity" 
              values="0.8;1;0.8" 
              dur="2s" 
              repeatCount="indefinite"/>
          </ellipse>
          
          {/* Gotas menores */}
          <circle id="smallDrop1" 
            cx="35" cy="30" r="4" 
            fill="url(#dropGradient)" 
            opacity="0.8">
            <animate attributeName="r" 
              values="4;6;4" 
              dur="2.5s" 
              begin="0.5s"
              repeatCount="indefinite"/>
          </circle>
          
          <circle id="smallDrop2" 
            cx="65" cy="35" r="3" 
            fill="url(#dropGradient)" 
            opacity="0.7">
            <animate attributeName="r" 
              values="3;5;3" 
              dur="2.5s" 
              begin="1s"
              repeatCount="indefinite"/>
          </circle>
          
          {/* Ondulações circulares */}
          <circle id="ripple1" 
            cx="50" cy="70" r="8" 
            stroke="url(#waterGradient)" 
            strokeWidth="2" 
            fill="none" 
            opacity="0.6">
            <animate attributeName="r" 
              values="8;15;8" 
              dur="4s" 
              repeatCount="indefinite"/>
            <animate attributeName="opacity" 
              values="0.6;0.2;0.6" 
              dur="4s" 
              repeatCount="indefinite"/>
          </circle>
          
          <circle id="ripple2" 
            cx="50" cy="70" r="12" 
            stroke="url(#waterGradient)" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.4">
            <animate attributeName="r" 
              values="12;20;12" 
              dur="4s" 
              begin="1s"
              repeatCount="indefinite"/>
            <animate attributeName="opacity" 
              values="0.4;0.1;0.4" 
              dur="4s" 
              begin="1s"
              repeatCount="indefinite"/>
          </circle>
          
          {/* Brilho na gota principal */}
          <ellipse id="dropHighlight" 
            cx="45" cy="20" 
            rx="3" ry="6" 
            fill="rgba(255, 255, 255, 0.8)" 
            opacity="0.7">
            <animate attributeName="opacity" 
              values="0.7;1;0.7" 
              dur="1.5s" 
              repeatCount="indefinite"/>
          </ellipse>
        </svg>
      </div>
      
      {showText && (
        <div className="badge-text">{displayText}</div>
      )}
    </div>
  );
}
