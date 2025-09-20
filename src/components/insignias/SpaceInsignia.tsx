'use client';

import React, { useEffect, useRef, useState } from 'react';
import './space-insignia.css';

interface SpaceInsigniaProps {
  className?: string;
  rocketType?: 'explorer' | 'military' | 'cargo' | 'shuttle';
  showText?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large' | 'custom';
  customSize?: number; // em pixels, usado quando size='custom'
}

const rocketTypes = {
  explorer: {
    text: 'SPACE EXPLORER',
    colors: {
      primary: 'rgba(255, 165, 0, 0.8)',
      secondary: 'rgba(255, 69, 0, 0.7)',
      accent: 'rgba(139, 69, 19, 0.6)'
    }
  },
  military: {
    text: 'WAR ROCKET',
    colors: {
      primary: 'rgba(220, 20, 60, 0.8)',
      secondary: 'rgba(178, 34, 34, 0.7)',
      accent: 'rgba(139, 0, 0, 0.6)'
    }
  },
  cargo: {
    text: 'CARGO HAULER',
    colors: {
      primary: 'rgba(70, 130, 180, 0.8)',
      secondary: 'rgba(100, 149, 237, 0.7)',
      accent: 'rgba(25, 25, 112, 0.6)'
    }
  },
  shuttle: {
    text: 'STAR SHUTTLE',
    colors: {
      primary: 'rgba(147, 112, 219, 0.8)',
      secondary: 'rgba(138, 43, 226, 0.7)',
      accent: 'rgba(75, 0, 130, 0.6)'
    }
  }
};

export default function SpaceInsignia({ 
  className = '', 
  rocketType = 'explorer',
  showText = true,
  text,
  size = 'medium',
  customSize = 200
}: SpaceInsigniaProps) {
  const badgeContainerRef = useRef<HTMLDivElement>(null);
  const spaceBadgeRef = useRef<HTMLDivElement>(null);
  const fuelParticlesRef = useRef<HTMLDivElement>(null);
  const vaporTrailRef = useRef<HTMLDivElement>(null);
  const planetsRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState(rocketType);

  const selectedType = rocketTypes[currentType];
  const displayText = text || selectedType.text;

  // Calcular tamanhos baseado na prop size
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          container: 120,
          badge: 80,
          rocket: 60,
          orbital: 100,
          textSize: 12
        };
      case 'medium':
        return {
          container: 200,
          badge: 120,
          rocket: 90,
          orbital: 160,
          textSize: 16
        };
      case 'large':
        return {
          container: 300,
          badge: 160,
          rocket: 120,
          orbital: 220,
          textSize: 18
        };
      case 'custom':
        const scale = customSize / 200; // escala baseada no medium
        return {
          container: customSize,
          badge: Math.round(120 * scale),
          rocket: Math.round(90 * scale),
          orbital: Math.round(160 * scale),
          textSize: Math.round(16 * scale)
        };
      default:
        return {
          container: 200,
          badge: 120,
          rocket: 90,
          orbital: 160,
          textSize: 16
        };
    }
  };

  const sizeConfig = getSizeConfig();

  // Cria partículas de combustível
  const createFuelParticles = (count: number = 8) => {
    if (!fuelParticlesRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'fuel-particle';
      
      const angle = (360 / count) * i + Math.random() * 45;
      const distance = 70 + Math.random() * 30;
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance + 20; // Bias para baixo
      
      particle.style.left = `calc(50% + ${x}px)`;
      particle.style.top = `calc(50% + ${y}px)`;
      particle.style.animationDelay = (i * 0.2) + 's';
      particle.style.animationDuration = (1.5 + Math.random() * 1) + 's';
      
      fuelParticlesRef.current.appendChild(particle);
      
      setTimeout(() => particle.remove(), 3000);
    }
  };

  // Cria trilha de vapor
  const createVaporTrail = (count: number = 12) => {
    if (!vaporTrailRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const vapor = document.createElement('div');
      vapor.className = 'vapor';
      
      const x = Math.random() * 60 - 30;
      const y = Math.random() * 40 + 60;
      
      vapor.style.left = `calc(50% + ${x}px)`;
      vapor.style.top = `calc(50% + ${y}px)`;
      vapor.style.animationDelay = (Math.random() * 2) + 's';
      vapor.style.animationDuration = (3 + Math.random() * 2) + 's';
      
      vaporTrailRef.current.appendChild(vapor);
      
      setTimeout(() => vapor.remove(), 5000);
    }
  };

  // Lançamento do foguete
  const createRocketLaunch = () => {
    createFuelParticles(15);
    createVaporTrail(20);
    
    // Onda de propulsão
    if (badgeContainerRef.current) {
      const propulsionWave = document.createElement('div');
      propulsionWave.className = 'propulsion-wave';
      badgeContainerRef.current.appendChild(propulsionWave);
      
      setTimeout(() => propulsionWave.remove(), 1500);
    }
  };

  // Cria planetas flutuantes
  const createFloatingPlanet = () => {
    if (!planetsRef.current) return;
    
    const planet = document.createElement('div');
    planet.className = 'planet';
    
    const colors = [
      'radial-gradient(ellipse at 30% 30%, #ff6b6b, #c44569)',
      'radial-gradient(ellipse at 30% 30%, #4834d4, #686de0)',
      'radial-gradient(ellipse at 30% 30%, #00d2d3, #01a3a4)',
      'radial-gradient(ellipse at 30% 30%, #feca57, #ff9ff3)',
      'radial-gradient(ellipse at 30% 30%, #48dbfb, #0abde3)',
      'radial-gradient(ellipse at 30% 30%, #ff9ff3, #54a0ff)',
      'radial-gradient(ellipse at 30% 30%, #5f27cd, #00d2d3)'
    ];
    
    const size = 15 + Math.random() * 35;
    planet.style.width = size + 'px';
    planet.style.height = size + 'px';
    planet.style.background = colors[Math.floor(Math.random() * colors.length)];
    planet.style.top = Math.random() * 70 + 15 + '%';
    planet.style.left = Math.random() * 70 + 15 + '%';
    planet.style.animation = 'planetFloat ' + (10 + Math.random() * 15) + 's ease-in-out infinite';
    planet.style.animationDelay = Math.random() * 8 + 's';
    
    planetsRef.current.appendChild(planet);
    
    setTimeout(() => planet.remove(), 30000);
  };

  // Evento de clique
  const handleClick = (e: React.MouseEvent) => {
    // Só executa se não clicou em um botão
    if (!(e.target as HTMLElement).closest('.btn')) {
      if (spaceBadgeRef.current) {
        spaceBadgeRef.current.classList.add('clicked');
        setTimeout(() => spaceBadgeRef.current?.classList.remove('clicked'), 1000);
      }
      
      createRocketLaunch();
    }
  };

  // Movimento do mouse cria partículas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (Math.random() > 0.6 && fuelParticlesRef.current) {
      const rect = badgeContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const particle = document.createElement('div');
      particle.className = 'fuel-particle';
      particle.style.left = `calc(50% + ${x}px)`;
      particle.style.top = `calc(50% + ${y}px)`;
      particle.style.animationDuration = '1.5s';
      
      fuelParticlesRef.current.appendChild(particle);
      
      setTimeout(() => particle.remove(), 1500);
    }
  };

  // Efeitos automáticos
  useEffect(() => {
    const autoEffects = () => {
      createFuelParticles(5);
      createVaporTrail(8);
    };

    const interval = setInterval(autoEffects, 4000);
    const planetInterval = setInterval(createFloatingPlanet, 6000);

    // Inicialização
    setTimeout(() => {
      createFuelParticles(10);
      createVaporTrail(15);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(planetInterval);
    };
  }, []);

  // Atualiza cores quando o tipo muda
  useEffect(() => {
    if (spaceBadgeRef.current) {
      const colors = selectedType.colors;
      spaceBadgeRef.current.style.background = `radial-gradient(ellipse at 30% 30%, 
        ${colors.primary} 0%,
        ${colors.secondary} 30%,
        ${colors.accent} 60%,
        rgba(25, 25, 112, 0.8) 100%)`;
    }
  }, [currentType]);

  return (
    <div 
      ref={badgeContainerRef}
      className={`badge-container ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{
        width: `${sizeConfig.container}px`,
        height: `${sizeConfig.container}px`
      }}
    >
      <div 
        className="orbital-ring"
        style={{
          width: `${sizeConfig.orbital}px`,
          height: `${sizeConfig.orbital}px`
        }}
      ></div>
      
      <div ref={planetsRef} className="planets">
        <div className="planet planet-1"></div>
        <div className="planet planet-2"></div>
        <div className="planet planet-3"></div>
      </div>
      
      <div ref={fuelParticlesRef} className="fuel-particles">
        {/* Partículas de combustível geradas dinamicamente */}
      </div>
      
      <div ref={vaporTrailRef} className="vapor-trail">
        {/* Vapor gerado dinamicamente */}
      </div>
      
      <div 
        ref={spaceBadgeRef} 
        className="space-badge"
        style={{
          width: `${sizeConfig.badge}px`,
          height: `${sizeConfig.badge}px`
        }}
      >
        {/* Foguete SVG */}
        <svg 
          className="rocket-symbol" 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: `${sizeConfig.rocket}px`,
            height: `${sizeConfig.rocket}px`
          }}
        >
          <defs>
            {/* Gradientes para o foguete */}
            <linearGradient id="rocketBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(220, 220, 220, 1)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgba(180, 180, 200, 0.9)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(150, 150, 180, 0.8)', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="noseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(255, 200, 100, 1)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(255, 150, 50, 0.9)', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="flameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(255, 255, 100, 1)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgba(255, 165, 0, 0.9)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(255, 69, 0, 0.8)', stopOpacity:1}} />
            </linearGradient>
            
            <radialGradient id="windowGradient" cx="30%" cy="30%">
              <stop offset="0%" style={{stopColor:'rgba(173, 216, 230, 1)', stopOpacity:1}} />
              <stop offset="70%" style={{stopColor:'rgba(100, 149, 237, 0.8)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(25, 25, 112, 0.6)', stopOpacity:1}} />
            </radialGradient>
            
            {/* Filtros para brilho */}
            <filter id="rocketGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Chamas do foguete (base) */}
          <g id="rocketFlames">
            {/* Chama principal com formato orgânico */}
            <path d="M50,75 Q45,80 46,88 Q48,95 50,100 Q52,95 54,88 Q55,80 50,75 Z" 
              fill="url(#flameGradient)" 
              filter="url(#rocketGlow)">
              <animate attributeName="d" 
                values="M50,75 Q45,80 46,88 Q48,95 50,100 Q52,95 54,88 Q55,80 50,75 Z;
                        M50,75 Q44,82 45,90 Q47,98 50,105 Q53,98 55,90 Q56,82 50,75 Z;
                        M50,75 Q46,79 47,87 Q49,94 50,98 Q51,94 53,87 Q54,79 50,75 Z;
                        M50,75 Q45,81 46,89 Q48,96 50,102 Q52,96 54,89 Q55,81 50,75 Z;
                        M50,75 Q45,80 46,88 Q48,95 50,100 Q52,95 54,88 Q55,80 50,75 Z" 
                dur="0.8s" 
                repeatCount="indefinite"/>
            </path>
            
            {/* Chama lateral esquerda */}
            <path d="M45,78 Q41,82 42,88 Q43,92 45,95 Q47,92 46,86 Q45,82 45,78 Z" 
              fill="url(#flameGradient)" 
              opacity="0.8">
              <animate attributeName="d" 
                values="M45,78 Q41,82 42,88 Q43,92 45,95 Q47,92 46,86 Q45,82 45,78 Z;
                        M45,78 Q40,84 41,90 Q42,95 45,98 Q48,94 47,87 Q46,83 45,78 Z;
                        M45,78 Q42,81 43,87 Q44,91 45,94 Q46,91 45,85 Q45,81 45,78 Z;
                        M45,78 Q41,82 42,88 Q43,92 45,95 Q47,92 46,86 Q45,82 45,78 Z" 
                dur="0.6s" 
                begin="0.2s"
                repeatCount="indefinite"/>
            </path>
            
            {/* Chama lateral direita */}
            <path d="M55,78 Q59,82 58,88 Q57,92 55,95 Q53,92 54,86 Q55,82 55,78 Z" 
              fill="url(#flameGradient)" 
              opacity="0.8">
              <animate attributeName="d" 
                values="M55,78 Q59,82 58,88 Q57,92 55,95 Q53,92 54,86 Q55,82 55,78 Z;
                        M55,78 Q60,84 59,90 Q58,95 55,98 Q52,94 53,87 Q54,83 55,78 Z;
                        M55,78 Q58,81 57,87 Q56,91 55,94 Q54,91 55,85 Q55,81 55,78 Z;
                        M55,78 Q59,82 58,88 Q57,92 55,95 Q53,92 54,86 Q55,82 55,78 Z" 
                dur="0.6s" 
                begin="0.4s"
                repeatCount="indefinite"/>
            </path>
            
            {/* Línguas de fogo pequenas */}
            <g id="flameWisps">
              <path d="M48,90 Q46,93 47,96 Q48,94 49,92 Q48,91 48,90 Z" 
                fill="rgba(255, 255, 150, 0.9)" 
                opacity="0">
                <animate attributeName="opacity" 
                  values="0;0.9;0.7;0.5;0" 
                  dur="1.2s" 
                  repeatCount="indefinite"/>
                <animate attributeName="d" 
                  values="M48,90 Q46,93 47,96 Q48,94 49,92 Q48,91 48,90 Z;
                          M48,88 Q45,92 46,98 Q49,95 50,90 Q49,89 48,88 Z;
                          M48,90 Q46,93 47,96 Q48,94 49,92 Q48,91 48,90 Z" 
                  dur="1.2s" 
                  repeatCount="indefinite"/>
              </path>
              
              <path d="M52,90 Q54,93 53,96 Q52,94 51,92 Q52,91 52,90 Z" 
                fill="rgba(255, 200, 100, 0.9)" 
                opacity="0">
                <animate attributeName="opacity" 
                  values="0;0.9;0.6;0.4;0" 
                  dur="1.2s" 
                  begin="0.6s"
                  repeatCount="indefinite"/>
                <animate attributeName="d" 
                  values="M52,90 Q54,93 53,96 Q52,94 51,92 Q52,91 52,90 Z;
                          M52,88 Q55,92 54,98 Q51,95 50,90 Q51,89 52,88 Z;
                          M52,90 Q54,93 53,96 Q52,94 51,92 Q52,91 52,90 Z" 
                  dur="1.2s" 
                  begin="0.6s"
                  repeatCount="indefinite"/>
              </path>
            </g>
            
            {/* Núcleo interno da chama */}
            <path d="M50,76 Q47,79 48,85 Q49,90 50,94 Q51,90 52,85 Q53,79 50,76 Z" 
              fill="rgba(255, 255, 200, 0.8)" 
              opacity="0.7">
              <animate attributeName="opacity" 
                values="0.7;0.9;0.6;0.8;0.7" 
                dur="0.5s" 
                repeatCount="indefinite"/>
              <animate attributeName="d" 
                values="M50,76 Q47,79 48,85 Q49,90 50,94 Q51,90 52,85 Q53,79 50,76 Z;
                        M50,76 Q46,80 47,86 Q48,92 50,96 Q52,92 53,86 Q54,80 50,76 Z;
                        M50,76 Q47,79 48,85 Q49,90 50,94 Q51,90 52,85 Q53,79 50,76 Z" 
                dur="0.5s" 
                repeatCount="indefinite"/>
            </path>
            
            {/* Partículas flutuantes */}
            <circle cx="47" cy="95" r="1.5" 
              fill="rgba(255, 255, 100, 0.9)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0.8;0.4;0" 
                dur="1.5s" 
                repeatCount="indefinite"/>
              <animate attributeName="cy" 
                values="95;102;108;115" 
                dur="1.5s" 
                repeatCount="indefinite"/>
              <animate attributeName="r" 
                values="1.5;2;1;0.5" 
                dur="1.5s" 
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="53" cy="93" r="1.2" 
              fill="rgba(255, 165, 0, 0.9)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0.7;0.3;0" 
                dur="1.8s" 
                begin="0.5s"
                repeatCount="indefinite"/>
              <animate attributeName="cy" 
                values="93;100;107;115" 
                dur="1.8s" 
                begin="0.5s"
                repeatCount="indefinite"/>
              <animate attributeName="r" 
                values="1.2;1.8;0.8;0.3" 
                dur="1.8s" 
                begin="0.5s"
                repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Corpo principal do foguete */}
          <rect id="rocketBody" 
            x="42" y="25" 
            width="16" height="50" 
            rx="2" ry="2"
            fill="url(#rocketBodyGradient)" 
            stroke="rgba(255, 255, 255, 0.4)" 
            strokeWidth="1"
            filter="url(#rocketGlow)">
            <animate attributeName="height" 
              values="50;52;48;50" 
              dur="3s" 
              repeatCount="indefinite"/>
          </rect>
          
          {/* Bico do foguete */}
          <polygon id="rocketNose" 
            points="50,10 58,25 42,25" 
            fill="url(#noseGradient)" 
            stroke="rgba(255, 200, 100, 0.6)" 
            strokeWidth="1"
            filter="url(#rocketGlow)">
            <animate attributeName="opacity" 
              values="0.9;1;0.9" 
              dur="2s" 
              repeatCount="indefinite"/>
          </polygon>
          
          {/* Janela/visor */}
          <circle id="rocketWindow" 
            cx="50" cy="35" r="6" 
            fill="url(#windowGradient)" 
            stroke="rgba(173, 216, 230, 0.8)" 
            strokeWidth="1">
            <animate attributeName="opacity" 
              values="0.8;1;0.8" 
              dur="4s" 
              repeatCount="indefinite"/>
          </circle>
          
          {/* Reflexo na janela */}
          <ellipse cx="47" cy="32" rx="2" ry="3" 
            fill="rgba(255, 255, 255, 0.8)" 
            opacity="0.6">
            <animate attributeName="opacity" 
              values="0.6;1;0.6" 
              dur="3s" 
              repeatCount="indefinite"/>
          </ellipse>
          
          {/* Aletas estabilizadoras */}
          <g id="rocketFins">
            {/* Aleta esquerda (maior) */}
            <polygon points="42,58 36,72 42,78" 
              fill="url(#rocketBodyGradient)" 
              stroke="rgba(255, 255, 255, 0.3)" 
              strokeWidth="0.5">
              <animateTransform 
                attributeName="transform" 
                type="rotate" 
                values="0 39 68;-5 39 68;0 39 68" 
                dur="4s" 
                repeatCount="indefinite"/>
            </polygon>
            
            {/* Aleta direita (maior) */}
            <polygon points="58,58 64,72 58,78" 
              fill="url(#rocketBodyGradient)" 
              stroke="rgba(255, 255, 255, 0.3)" 
              strokeWidth="0.5">
              <animateTransform 
                attributeName="transform" 
                type="rotate" 
                values="0 61 68;5 61 68;0 61 68" 
                dur="4s" 
                begin="2s"
                repeatCount="indefinite"/>
            </polygon>
            
            {/* Aletas traseiras adicionais */}
            <polygon points="46,70 44,78 48,78" 
              fill="url(#rocketBodyGradient)" 
              stroke="rgba(255, 255, 255, 0.2)" 
              strokeWidth="0.3"
              opacity="0.8"/>
            
            <polygon points="54,70 52,78 56,78" 
              fill="url(#rocketBodyGradient)" 
              stroke="rgba(255, 255, 255, 0.2)" 
              strokeWidth="0.3"
              opacity="0.8"/>
          </g>
          
          {/* Detalhes tecnológicos */}
          <g id="techDetails">
            {/* Listras do corpo */}
            <rect x="43" y="45" width="14" height="1" 
              fill="rgba(255, 200, 100, 0.6)" 
              opacity="0.8">
              <animate attributeName="opacity" 
                values="0.8;1;0.8" 
                dur="2s" 
                repeatCount="indefinite"/>
            </rect>
            
            <rect x="43" y="55" width="14" height="1" 
              fill="rgba(255, 200, 100, 0.6)" 
              opacity="0.8">
              <animate attributeName="opacity" 
                values="0.8;1;0.8" 
                dur="2s" 
                begin="1s"
                repeatCount="indefinite"/>
            </rect>
            
            {/* Propulsores laterais */}
            <circle cx="40" cy="65" r="2" 
              fill="rgba(255, 100, 100, 0.8)" 
              stroke="rgba(255, 200, 100, 0.6)" 
              strokeWidth="0.5">
              <animate attributeName="r" 
                values="2;2.5;2" 
                dur="1.5s" 
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="60" cy="65" r="2" 
              fill="rgba(255, 100, 100, 0.8)" 
              stroke="rgba(255, 200, 100, 0.6)" 
              strokeWidth="0.5">
              <animate attributeName="r" 
                values="2;2.5;2" 
                dur="1.5s" 
                begin="0.7s"
                repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Trilha de estrelas */}
          <g id="starTrail">
            <circle cx="35" cy="20" r="1" 
              fill="rgba(255, 255, 255, 0.9)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"/>
              <animateTransform 
                attributeName="transform" 
                type="translate" 
                values="0 0;-10 -10;0 0" 
                dur="2s" 
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="65" cy="30" r="1" 
              fill="rgba(255, 255, 255, 0.9)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0" 
                dur="2s" 
                begin="1s"
                repeatCount="indefinite"/>
              <animateTransform 
                attributeName="transform" 
                type="translate" 
                values="0 0;10 -10;0 0" 
                dur="2s" 
                begin="1s"
                repeatCount="indefinite"/>
            </circle>
          </g>
        </svg>
      </div>
      
      {showText && (
        <div 
          className="badge-text"
          style={{
            fontSize: `${sizeConfig.textSize}px`
          }}
        >
          {displayText}
        </div>
      )}
    </div>
  );
}
