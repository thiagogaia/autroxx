'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type BadgeType = 'elite' | 'royal' | 'mystic' | 'cosmic' | 'legendary' | 'discord';

export interface BadgeCardProps {
  type: BadgeType;
  title: string;
  description?: string;
  className?: string;
  onClick?: () => void;
  isUnlocked?: boolean;
  showAnimation?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;
}

const badgeThemes = {
  elite: {
    name: 'DIAMOND ELITE',
    description: 'Elite Cristalino',
    colors: {
      main: ['rgba(255,255,255,0.9)', 'rgba(230,240,255,0.8)', 'rgba(200,220,255,0.7)', 'rgba(255,255,255,0.8)', 'rgba(240,248,255,0.9)'],
      facet1: ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.1)'],
      facet2: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)'],
      glow: 'rgba(255,255,255,0.4)',
      rays: 'rgba(200,220,255,0.6)'
    }
  },
  royal: {
    name: 'ROYAL CROWN',
    description: 'Coroa Real',
    colors: {
      main: ['rgba(255,215,0,0.9)', 'rgba(255,235,130,0.8)', 'rgba(255,200,50,0.7)', 'rgba(255,215,0,0.8)', 'rgba(255,240,150,0.9)'],
      facet1: ['rgba(255,255,100,0.6)', 'rgba(255,215,0,0.1)'],
      facet2: ['rgba(255,235,130,0.4)', 'rgba(255,215,0,0.1)'],
      glow: 'rgba(255,215,0,0.4)',
      rays: 'rgba(255,165,0,0.6)'
    }
  },
  mystic: {
    name: 'MYSTIC CRYSTAL',
    description: 'Cristal Místico',
    colors: {
      main: ['rgba(255,100,255,0.9)', 'rgba(255,150,255,0.8)', 'rgba(200,50,255,0.7)', 'rgba(255,100,255,0.8)', 'rgba(255,180,255,0.9)'],
      facet1: ['rgba(255,150,255,0.6)', 'rgba(255,100,255,0.1)'],
      facet2: ['rgba(255,180,255,0.4)', 'rgba(255,100,255,0.1)'],
      glow: 'rgba(255,100,255,0.4)',
      rays: 'rgba(255,20,147,0.6)'
    }
  },
  cosmic: {
    name: 'COSMIC STONE',
    description: 'Pedra Cósmica',
    colors: {
      main: ['rgba(100,255,200,0.9)', 'rgba(150,255,220,0.8)', 'rgba(50,255,150,0.7)', 'rgba(100,255,200,0.8)', 'rgba(180,255,240,0.9)'],
      facet1: ['rgba(150,255,220,0.6)', 'rgba(100,255,200,0.1)'],
      facet2: ['rgba(180,255,240,0.4)', 'rgba(100,255,200,0.1)'],
      glow: 'rgba(100,255,200,0.4)',
      rays: 'rgba(0,255,255,0.6)'
    }
  },
  legendary: {
    name: 'LEGENDARY CORE',
    description: 'Núcleo Lendário',
    colors: {
      main: ['rgba(255,69,0,0.9)', 'rgba(255,140,0,0.8)', 'rgba(255,99,71,0.7)', 'rgba(255,69,0,0.8)', 'rgba(255,160,122,0.9)'],
      facet1: ['rgba(255,140,0,0.6)', 'rgba(255,69,0,0.1)'],
      facet2: ['rgba(255,160,122,0.4)', 'rgba(255,69,0,0.1)'],
      glow: 'rgba(255,69,0,0.4)',
      rays: 'rgba(255,20,147,0.6)'
    }
  },
  discord: {
    name: 'ELITE GUARDIAN',
    description: 'Guardião Elite',
    colors: {
      main: ['rgba(114,137,218,0.9)', 'rgba(88,101,242,0.8)', 'rgba(114,137,218,0.7)', 'rgba(88,101,242,0.8)', 'rgba(114,137,218,0.9)'],
      facet1: ['rgba(114,137,218,0.6)', 'rgba(88,101,242,0.1)'],
      facet2: ['rgba(88,101,242,0.4)', 'rgba(114,137,218,0.1)'],
      glow: 'rgba(114,137,218,0.4)',
      rays: 'rgba(88,101,242,0.6)'
    }
  }
};

export function BadgeCard({ 
  type, 
  title, 
  description, 
  className, 
  onClick, 
  isUnlocked = true,
  showAnimation = true,
  size = 'medium'
}: BadgeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mouseTrailTimeout, setMouseTrailTimeout] = useState<NodeJS.Timeout | null>(null);

  const theme = badgeThemes[type];

  // Configuração de tamanhos
  const getSizeConfig = () => {
    if (typeof size === 'number') {
      return {
        containerSize: size,
        badgeSize: size * 0.5,
        pedestalSize: size * 0.6,
        pedestalHeight: size * 0.15,
        raySize: size * 0.2,
        sparkleSize: size * 0.05
      };
    }
    
    const sizeMap = {
      small: { containerSize: 200, badgeSize: 100, pedestalSize: 120, pedestalHeight: 30, raySize: 40, sparkleSize: 10 },
      medium: { containerSize: 320, badgeSize: 160, pedestalSize: 192, pedestalHeight: 48, raySize: 64, sparkleSize: 16 },
      large: { containerSize: 480, badgeSize: 240, pedestalSize: 288, pedestalHeight: 72, raySize: 96, sparkleSize: 24 },
      xlarge: { containerSize: 640, badgeSize: 320, pedestalSize: 384, pedestalHeight: 96, raySize: 128, sparkleSize: 32 }
    };
    
    return sizeMap[size];
  };

  const sizeConfig = getSizeConfig();

  // Criar partículas no clique
  const createSparkles = (x: number, y: number, count: number = 8) => {
    if (!sparklesRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle active';
      
      const angle = (360 / count) * i;
      const distance = 30 + Math.random() * 40;
      const offsetX = Math.cos(angle * Math.PI / 180) * distance;
      const offsetY = Math.sin(angle * Math.PI / 180) * distance;
      
      sparkle.style.left = (x + offsetX) + 'px';
      sparkle.style.top = (y + offsetY) + 'px';
      sparkle.style.animationDelay = (i * 0.1) + 's';
      
      sparklesRef.current.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 2000);
    }
  };

  // Trilha do mouse
  const createMouseTrail = (x: number, y: number) => {
    if (!containerRef.current) return;
    
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    
    containerRef.current.appendChild(trail);
    
    setTimeout(() => trail.remove(), 1000);
  };

  // Partículas aleatórias
  const createRandomSparkle = () => {
    if (!sparklesRef.current || !showAnimation) return;
    
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle active';
    sparkle.style.left = (Math.random() * 200 - 100) + 'px';
    sparkle.style.top = (Math.random() * 200 - 100) + 'px';
    sparkle.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
    
    sparklesRef.current.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 2500);
  };

  // Eventos de interação
  const handleClick = (e: React.MouseEvent) => {
    if (!isUnlocked) return;
    
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      createSparkles(x, y, 12);
    }
    
    onClick?.();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isHovered || !isUnlocked) return;
    
    if (mouseTrailTimeout) {
      clearTimeout(mouseTrailTimeout);
    }
    
    const timeout = setTimeout(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createMouseTrail(x, y);
      }
    }, 100);
    
    setMouseTrailTimeout(timeout);
  };

  // Atualizar gradientes SVG
  useEffect(() => {
    if (!svgRef.current) return;
    
    const updateGradients = () => {
      const diamondGradient = svgRef.current?.querySelector('#diamondGradient');
      const facetGradient1 = svgRef.current?.querySelector('#facetGradient1');
      const facetGradient2 = svgRef.current?.querySelector('#facetGradient2');
      
      if (diamondGradient) {
        const stops = diamondGradient.querySelectorAll('stop');
        theme.colors.main.forEach((color, index) => {
          if (stops[index]) {
            (stops[index] as SVGStopElement).style.stopColor = color;
          }
        });
      }
      
      if (facetGradient1) {
        const stops = facetGradient1.querySelectorAll('stop');
        theme.colors.facet1.forEach((color, index) => {
          if (stops[index]) {
            (stops[index] as SVGStopElement).style.stopColor = color;
          }
        });
      }
      
      if (facetGradient2) {
        const stops = facetGradient2.querySelectorAll('stop');
        theme.colors.facet2.forEach((color, index) => {
          if (stops[index]) {
            (stops[index] as SVGStopElement).style.stopColor = color;
          }
        });
      }
    };
    
    updateGradients();
  }, [theme.colors]);

  // Partículas aleatórias automáticas
  useEffect(() => {
    if (!showAnimation) return;
    
    const interval = setInterval(createRandomSparkle, 3000);
    return () => clearInterval(interval);
  }, [showAnimation]);

  return (
    <div className={cn(
      "relative group",
      isUnlocked ? "cursor-pointer" : "cursor-default",
      className
    )}>
      {/* Container da insignia */}
      <div 
        ref={containerRef}
        className="relative flex flex-col items-center justify-center"
        style={{
          width: `${sizeConfig.containerSize}px`,
          height: `${sizeConfig.containerSize}px`
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      >
        {/* Pedestal */}
        <div 
          className="absolute bg-gradient-to-r from-white/10 via-white/15 to-white/10 rounded-full shadow-lg transition-all duration-300"
          style={{
            width: `${sizeConfig.pedestalSize}px`,
            height: `${sizeConfig.pedestalHeight}px`,
            bottom: `${sizeConfig.containerSize * 0.25}px`
          }}
        />
        
        {/* Anel de dispersão de luz */}
        <div 
          className={cn(
            "absolute rounded-full transition-all duration-300",
            isHovered ? "opacity-70" : "opacity-40"
          )}
          style={{
            width: `${sizeConfig.containerSize * 0.7}px`,
            height: `${sizeConfig.containerSize * 0.7}px`,
            background: `conic-gradient(
              ${theme.colors.glow} 0deg,
              ${theme.colors.rays} 60deg,
              ${theme.colors.glow} 120deg,
              ${theme.colors.rays} 180deg,
              ${theme.colors.glow} 240deg,
              ${theme.colors.rays} 300deg,
              ${theme.colors.glow} 360deg
            )`,
            filter: 'blur(8px)',
            animation: isHovered ? 'prismRotate 8s linear infinite' : 'prismRotate 12s linear infinite'
          }}
        />
        
        {/* Raios de luz */}
        <div className="absolute w-full h-full pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute bg-gradient-to-t from-transparent via-white/60 to-transparent transition-all duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              style={{
                width: '4px',
                height: `${sizeConfig.raySize}px`,
                top: i % 2 === 0 ? `${sizeConfig.containerSize * 0.375}px` : `${sizeConfig.containerSize * 0.625}px`,
                left: i % 2 === 0 ? '50%' : (i === 1 ? `${sizeConfig.containerSize * 0.375}px` : 'auto'),
                right: i === 3 ? `${sizeConfig.containerSize * 0.375}px` : 'auto',
                transform: i % 2 === 0 ? 'translateX(-50%)' : `rotate(${i * 90}deg)`,
                animationDelay: `${i * 0.5}s`,
                animation: isHovered ? 'rayPulse 2s ease-in-out infinite' : 'none'
              }}
            />
          ))}
        </div>
        
        {/* Container de partículas */}
        <div ref={sparklesRef} className="absolute w-full h-full pointer-events-none" />
        
        {/* SVG da insignia */}
        {type === 'discord' ? (
          <div className="relative flex items-center justify-center" style={{ width: `${sizeConfig.badgeSize}px`, height: `${sizeConfig.badgeSize}px` }}>
            {/* Badge Discord circular */}
            <div 
              className={cn(
                "relative rounded-full transition-all duration-300 flex items-center justify-center",
                "bg-gradient-to-br from-[#7289da] to-[#5865f2]",
                "shadow-lg shadow-[#5865f2]/40",
                isHovered && isUnlocked && "scale-105 -translate-y-1",
                isClicked && "animate-discordPulse",
                !isUnlocked && "opacity-50 grayscale"
              )}
              style={{
                width: `${sizeConfig.badgeSize * 0.8}px`,
                height: `${sizeConfig.badgeSize * 0.8}px`,
                boxShadow: isHovered ? 
                  '0 12px 32px rgba(88, 101, 242, 0.5), 0 6px 16px rgba(88, 101, 242, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)' :
                  '0 8px 24px rgba(88, 101, 242, 0.4), 0 4px 12px rgba(88, 101, 242, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Efeito de onda Discord */}
              <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/20 via-white/10 to-transparent scale-0 animate-waveRipple" />
              
              {/* Boost indicator */}
              <div className="absolute top-2 left-2 w-5 h-5 bg-gradient-to-br from-[#ff73fa] to-[#f570ea] rounded animate-boostShine flex items-center justify-center text-xs">
                ✨
              </div>
              
              {/* Notificação */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#f04747] rounded-full flex items-center justify-center text-white text-xs font-bold animate-notificationPulse">
                ★
              </div>
              
              {/* SVG do escudo Discord */}
              <svg 
                className="transition-all duration-300 drop-shadow-lg"
                style={{ width: `${sizeConfig.badgeSize * 0.4}px`, height: `${sizeConfig.badgeSize * 0.4}px` }}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,1)', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,0.9)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.8)', stopOpacity: 1 }} />
                  </linearGradient>
                  
                  <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,1)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(200,220,255,0.8)', stopOpacity: 1 }} />
                  </linearGradient>
                  
                  <filter id="innerGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Base do escudo */}
                <path 
                  d="M50 10 L75 25 L75 50 Q75 65 50 85 Q25 65 25 50 L25 25 Z" 
                  fill="url(#shieldGradient)" 
                  stroke="rgba(255,255,255,0.3)" 
                  strokeWidth="1"
                  filter="url(#innerGlow)"
                >
                  <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite"/>
                </path>
                
                {/* Gema central */}
                <polygon 
                  points="50,25 60,35 50,50 40,35" 
                  fill="url(#gemGradient)" 
                  stroke="rgba(255,255,255,0.4)" 
                  strokeWidth="0.5"
                >
                  <animateTransform 
                    attributeName="transform" 
                    type="rotate" 
                    values="0 50 37.5;360 50 37.5" 
                    dur="8s" 
                    repeatCount="indefinite"/>
                </polygon>
                
                {/* Estrelas decorativas */}
                <path d="M35 40 L37 44 L41 44 L38 47 L39 51 L35 49 L31 51 L32 47 L29 44 L33 44 Z" 
                  fill="rgba(255,255,255,0.8)" 
                  stroke="rgba(255,255,255,0.4)" 
                  strokeWidth="0.3">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0s" repeatCount="indefinite"/>
                </path>
                
                <path d="M65 40 L67 44 L71 44 L68 47 L69 51 L65 49 L61 51 L62 47 L59 44 L63 44 Z" 
                  fill="rgba(255,255,255,0.8)" 
                  stroke="rgba(255,255,255,0.4)" 
                  strokeWidth="0.3">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="1s" repeatCount="indefinite"/>
                </path>
                
                {/* Detalhes do escudo */}
                <line x1="50" y1="25" x2="50" y2="65" stroke="rgba(255,255,255,0.4)" strokeWidth="1" opacity="0.6"/>
                
                <path d="M35 30 Q50 35 65 30" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" opacity="0.7">
                  <animate attributeName="opacity" values="0.5;0.9;0.5" dur="4s" repeatCount="indefinite"/>
                </path>
                
                <path d="M35 55 Q50 60 65 55" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" opacity="0.7">
                  <animate attributeName="opacity" values="0.5;0.9;0.5" dur="4s" begin="2s" repeatCount="indefinite"/>
                </path>
                
                {/* Pontos de luz */}
                <circle cx="42" cy="60" r="1.5" fill="rgba(255,255,255,0.9)" opacity="0">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0s" repeatCount="indefinite"/>
                </circle>
                
                <circle cx="58" cy="60" r="1.5" fill="rgba(255,255,255,0.9)" opacity="0">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
                </circle>
                
                <circle cx="50" cy="67" r="1.5" fill="rgba(255,255,255,0.9)" opacity="0">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="1s" repeatCount="indefinite"/>
                </circle>
                
                {/* Aura externa */}
                <path 
                  d="M50 8 L77 23 L77 50 Q77 67 50 87 Q23 67 23 50 L23 23 Z" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="2" 
                  opacity="0.5"
                >
                  <animate attributeName="strokeWidth" values="1;3;1" dur="2.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite"/>
                </path>
              </svg>
              
              {/* Anel orbital Discord */}
              <div className="absolute inset-0 w-full h-full border-2 border-transparent rounded-full bg-gradient-to-r from-[#7289da]/30 to-[#5865f2]/20 animate-ringRotate" 
                style={{
                  background: 'linear-gradient(135deg, rgba(114, 137, 218, 0.3), rgba(88, 101, 242, 0.2))',
                  mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'subtract',
                  maskComposite: 'exclude'
                }}
              />
            </div>
            
            {/* Indicador de digitação Discord */}
            <div className={cn(
              "absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-center text-xs text-gray-400 transition-all duration-300",
              isHovered && isUnlocked ? "opacity-100" : "opacity-0"
            )}>
              alguém está digitando
              <div className="flex ml-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-typingBounce" style={{ animationDelay: '0s' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-typingBounce ml-0.5" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-typingBounce ml-0.5" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        ) : (
          <svg 
            ref={svgRef}
            className={cn(
              "transition-all duration-300 drop-shadow-lg",
              isHovered && isUnlocked && "scale-105 rotate-1",
              isClicked && "animate-diamondPulse",
              !isUnlocked && "opacity-50 grayscale"
            )}
            style={{ width: `${sizeConfig.badgeSize}px`, height: `${sizeConfig.badgeSize}px` }}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
          <defs>
            {/* Gradientes para a insignia */}
            <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: theme.colors.main[0], stopOpacity: 1 }} />
              <stop offset="25%" style={{ stopColor: theme.colors.main[1], stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: theme.colors.main[2], stopOpacity: 1 }} />
              <stop offset="75%" style={{ stopColor: theme.colors.main[3], stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: theme.colors.main[4], stopOpacity: 1 }} />
            </linearGradient>
            
            {/* Gradiente das facetas */}
            <linearGradient id="facetGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: theme.colors.facet1[0], stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: theme.colors.facet1[1], stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="facetGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: theme.colors.facet2[0], stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: theme.colors.facet2[1], stopOpacity: 1 }} />
            </linearGradient>
            
            {/* Reflexo principal */}
            <linearGradient id="reflectionGradient" x1="0%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.9)', stopOpacity: 1 }} />
              <stop offset="60%" style={{ stopColor: 'rgba(255,255,255,0.5)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
            </linearGradient>
            
            {/* Filtros para brilho */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Corpo principal da insignia */}
          <polygon 
            points="100,30 160,100 100,170 40,100" 
            fill="url(#diamondGradient)" 
            stroke="rgba(255,255,255,0.4)" 
            strokeWidth="1"
            filter="url(#glow)"
          />
          
          {/* Facetas com animações */}
          <polygon 
            points="100,30 160,100 100,100" 
            fill="url(#facetGradient1)" 
            opacity="0.6"
          >
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite"/>
          </polygon>
          
          <polygon 
            points="160,100 100,170 100,100" 
            fill="url(#facetGradient2)" 
            opacity="0.5"
          >
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" begin="1s" repeatCount="indefinite"/>
          </polygon>
          
          <polygon 
            points="100,170 40,100 100,100" 
            fill="url(#facetGradient1)" 
            opacity="0.4"
          >
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" begin="2s" repeatCount="indefinite"/>
          </polygon>
          
          <polygon 
            points="40,100 100,30 100,100" 
            fill="url(#facetGradient2)" 
            opacity="0.3"
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" begin="0.5s" repeatCount="indefinite"/>
          </polygon>
          
          {/* Reflexo principal */}
          <polygon 
            points="85,45 130,50 110,120 75,110" 
            fill="url(#reflectionGradient)" 
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
          </polygon>
          
          {/* Linhas de separação */}
          <line x1="100" y1="30" x2="100" y2="170" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" opacity="0.7"/>
          <line x1="40" y1="100" x2="160" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" opacity="0.7"/>
        </svg>
        )}
        
        
      </div>
    </div>
  );
}
