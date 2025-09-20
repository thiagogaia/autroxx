'use client';

import React, { useEffect, useRef, useState } from 'react';
import './thunder-insignia.css';

interface ThunderInsigniaProps {
  className?: string;
  thunderType?: 'lord' | 'storm' | 'lightning' | 'electric';
  showText?: boolean;
  text?: string;
}

const thunderTypes = {
  lord: {
    text: 'THUNDER LORD',
    colors: {
      primary: 'rgba(255, 255, 0, 0.4)',
      secondary: 'rgba(255, 165, 0, 0.3)',
      accent: 'rgba(138, 43, 226, 0.4)'
    }
  },
  storm: {
    text: 'STORM MASTER',
    colors: {
      primary: 'rgba(100, 149, 237, 0.4)',
      secondary: 'rgba(70, 130, 180, 0.3)',
      accent: 'rgba(25, 25, 112, 0.4)'
    }
  },
  lightning: {
    text: 'LIGHTNING SAGE',
    colors: {
      primary: 'rgba(255, 20, 147, 0.4)',
      secondary: 'rgba(186, 85, 211, 0.3)',
      accent: 'rgba(138, 43, 226, 0.4)'
    }
  },
  electric: {
    text: 'ELECTRIC KING',
    colors: {
      primary: 'rgba(0, 255, 255, 0.4)',
      secondary: 'rgba(64, 224, 208, 0.3)',
      accent: 'rgba(0, 191, 255, 0.4)'
    }
  }
};

export default function ThunderInsignia({ 
  className = '', 
  thunderType = 'lord',
  showText = true,
  text
}: ThunderInsigniaProps) {
  const badgeContainerRef = useRef<HTMLDivElement>(null);
  const thunderBadgeRef = useRef<HTMLDivElement>(null);
  const electricSparksRef = useRef<HTMLDivElement>(null);
  const shockWavesRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState(thunderType);

  const selectedType = thunderTypes[currentType];
  const displayText = text || selectedType.text;

  // Cria faíscas elétricas
  const createElectricSparks = (count: number = 10) => {
    if (!electricSparksRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark';
      
      const angle = (360 / count) * i + Math.random() * 45;
      const distance = 60 + Math.random() * 40;
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance;
      
      spark.style.left = `calc(50% + ${x}px)`;
      spark.style.top = `calc(50% + ${y}px)`;
      spark.style.animationDelay = (i * 0.1) + 's';
      spark.style.animationDuration = (1.5 + Math.random() * 1) + 's';
      
      electricSparksRef.current.appendChild(spark);
      
      setTimeout(() => spark.remove(), 3000);
    }
  };

  // Cria ondas de choque
  const createShockWaves = (count: number = 3) => {
    if (!shockWavesRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const wave = document.createElement('div');
      wave.className = 'shock-wave';
      
      wave.style.animationDelay = (i * 0.3) + 's';
      wave.style.animationDuration = (2 + Math.random() * 1) + 's';
      
      shockWavesRef.current.appendChild(wave);
      
      setTimeout(() => wave.remove(), 3000);
    }
  };

  // Cria tempestade elétrica
  const createThunderStorm = () => {
    createElectricSparks(15);
    createShockWaves(5);
  };

  // Evento de clique
  const handleClick = () => {
    if (thunderBadgeRef.current) {
      thunderBadgeRef.current.classList.add('clicked');
      setTimeout(() => thunderBadgeRef.current?.classList.remove('clicked'), 800);
    }
    
    createThunderStorm();
  };

  // Movimento do mouse cria faíscas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (Math.random() > 0.7 && electricSparksRef.current) {
      const rect = badgeContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const spark = document.createElement('div');
      spark.className = 'spark';
      spark.style.left = `calc(50% + ${x}px)`;
      spark.style.top = `calc(50% + ${y}px)`;
      spark.style.animationDuration = '1.5s';
      
      electricSparksRef.current.appendChild(spark);
      
      setTimeout(() => spark.remove(), 1500);
    }
  };

  // Efeitos automáticos
  useEffect(() => {
    const autoEffects = () => {
      createElectricSparks(5);
      createShockWaves(2);
    };

    const interval = setInterval(autoEffects, 4000);

    // Inicialização
    setTimeout(() => {
      createElectricSparks(8);
      createShockWaves(3);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Atualiza cores quando o tipo muda
  useEffect(() => {
    if (thunderBadgeRef.current) {
      const colors = selectedType.colors;
      thunderBadgeRef.current.style.background = `radial-gradient(ellipse at 30% 30%, 
        ${colors.primary} 0%,
        ${colors.secondary} 30%,
        ${colors.accent} 60%,
        rgba(75, 0, 130, 0.6) 100%)`;
    }
  }, [currentType]);

  return (
    <div 
      ref={badgeContainerRef}
      className={`badge-container ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      <div className="electric-ring"></div>
      
      <div ref={electricSparksRef} className="electric-sparks">
        {/* Faíscas geradas dinamicamente */}
      </div>
      
      <div ref={shockWavesRef} className="shock-waves">
        {/* Ondas de choque geradas dinamicamente */}
      </div>
      
      <div ref={thunderBadgeRef} className="thunder-badge">
        {/* Raio SVG */}
        <svg className="thunder-symbol" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradientes para o raio */}
            <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(255, 255, 255, 1)', stopOpacity:1}} />
              <stop offset="30%" style={{stopColor:'rgba(255, 255, 0, 1)', stopOpacity:1}} />
              <stop offset="70%" style={{stopColor:'rgba(255, 165, 0, 0.9)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(255, 255, 0, 0.8)', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(255, 255, 255, 1)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgba(255, 255, 200, 0.9)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(255, 255, 100, 0.8)', stopOpacity:1}} />
            </linearGradient>
            
            <radialGradient id="electricGlow" cx="50%" cy="50%">
              <stop offset="0%" style={{stopColor:'rgba(255, 255, 255, 0.9)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgba(255, 255, 0, 0.7)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(138, 43, 226, 0.5)', stopOpacity:1}} />
            </radialGradient>
            
            {/* Filtros para brilho elétrico */}
            <filter id="thunderGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="electricField" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Raio principal com formato realista */}
          <path id="mainLightning" 
            d="M45,10 L50,25 L40,35 L48,45 L35,60 L42,70 L30,85 L50,50 L60,65 L52,75 L65,90 L50,50 L55,35 L45,10 Z" 
            fill="url(#lightningGradient)" 
            filter="url(#thunderGlow)">
            <animate attributeName="opacity" 
              values="0.8;1;0.9;1;0.8" 
              dur="2s" 
              repeatCount="indefinite"/>
            <animate attributeName="d" 
              values="M45,10 L50,25 L40,35 L48,45 L35,60 L42,70 L30,85 L50,50 L60,65 L52,75 L65,90 L50,50 L55,35 L45,10 Z;
                      M44,10 L51,26 L39,36 L49,44 L34,61 L43,69 L29,86 L51,51 L61,64 L51,76 L66,89 L51,51 L56,34 L44,10 Z;
                      M46,10 L49,24 L41,34 L47,46 L36,59 L41,71 L31,84 L49,49 L59,66 L53,74 L64,91 L49,49 L54,36 L46,10 Z;
                      M45,10 L50,25 L40,35 L48,45 L35,60 L42,70 L30,85 L50,50 L60,65 L52,75 L65,90 L50,50 L55,35 L45,10 Z" 
              dur="1.5s" 
              repeatCount="indefinite"/>
          </path>
          
          {/* Núcleo interno do raio */}
          <path id="lightningCore" 
            d="M47,15 L49,30 L45,40 L47,50 L40,65 L45,75 L35,85 L49,52 L55,67 L50,77 L60,88 L49,52 L52,40 L47,15 Z" 
            fill="url(#coreGradient)" 
            filter="url(#electricField)">
            <animate attributeName="opacity" 
              values="0.9;1;0.8;1;0.9" 
              dur="1.8s" 
              repeatCount="indefinite"/>
          </path>
          
          {/* Ramificações elétricas */}
          <g id="electricBranches">
            {/* Ramo esquerdo superior */}
            <path d="M42,20 L35,15 L30,22" 
              stroke="url(#lightningGradient)" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0;0.7;0" 
                dur="3s" 
                repeatCount="indefinite"/>
            </path>
            
            {/* Ramo direito superior */}
            <path d="M58,30 L65,25 L70,32" 
              stroke="url(#lightningGradient)" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
              opacity="0">
              <animate attributeName="opacity" 
                values="0;0.8;0;0.6;0" 
                dur="3s" 
                begin="1s"
                repeatCount="indefinite"/>
            </path>
            
            {/* Ramo inferior esquerdo */}
            <path d="M35,70 L25,75 L20,82" 
              stroke="url(#lightningGradient)" 
              strokeWidth="1.5" 
              fill="none" 
              strokeLinecap="round"
              opacity="0">
              <animate attributeName="opacity" 
                values="0;0.9;0;0.5;0" 
                dur="3s" 
                begin="2s"
                repeatCount="indefinite"/>
            </path>
            
            {/* Ramo inferior direito */}
            <path d="M65,80 L72,85 L78,90" 
              stroke="url(#lightningGradient)" 
              strokeWidth="1.5" 
              fill="none" 
              strokeLinecap="round"
              opacity="0">
              <animate attributeName="opacity" 
                values="0;0.7;0;0.4;0" 
                dur="3s" 
                begin="0.5s"
                repeatCount="indefinite"/>
            </path>
          </g>
          
          {/* Campo elétrico ao redor */}
          <g id="electricField">
            <circle cx="20" cy="30" r="2" 
              fill="url(#electricGlow)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;0.8;0" 
                dur="2s" 
                repeatCount="indefinite"/>
              <animate attributeName="r" 
                values="2;4;2" 
                dur="2s" 
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="80" cy="40" r="1.5" 
              fill="url(#electricGlow)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;0.9;0" 
                dur="2s" 
                begin="0.7s"
                repeatCount="indefinite"/>
              <animate attributeName="r" 
                values="1.5;3;1.5" 
                dur="2s" 
                begin="0.7s"
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="25" cy="80" r="1.8" 
              fill="url(#electricGlow)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;0.7;0" 
                dur="2s" 
                begin="1.3s"
                repeatCount="indefinite"/>
              <animate attributeName="r" 
                values="1.8;3.5;1.8" 
                dur="2s" 
                begin="1.3s"
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="75" cy="70" r="2.2" 
              fill="url(#electricGlow)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;0.6;0" 
                dur="2s" 
                begin="1.8s"
                repeatCount="indefinite"/>
              <animate attributeName="r" 
                values="2.2;4.5;2.2" 
                dur="2s" 
                begin="1.8s"
                repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Pontos de energia elétrica */}
          <g id="energyPoints">
            <circle cx="50" cy="25" r="1" 
              fill="rgba(255, 255, 255, 1)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0" 
                dur="0.5s" 
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="45" cy="50" r="1" 
              fill="rgba(255, 255, 255, 1)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0" 
                dur="0.5s" 
                begin="0.2s"
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="55" cy="75" r="1" 
              fill="rgba(255, 255, 255, 1)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0" 
                dur="0.5s" 
                begin="0.4s"
                repeatCount="indefinite"/>
            </circle>
          </g>
        </svg>
      </div>
      
      {showText && (
        <div className="badge-text">{displayText}</div>
      )}
    </div>
  );
}
