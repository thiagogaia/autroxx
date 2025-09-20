'use client';

import { Achievement } from '@/types/gamification';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import SpaceInsignia from './insignias/SpaceInsignia';

interface SVGInsigniaProps {
  achievement: Achievement;
  className?: string;
}

export function SVGInsignia({ achievement, className }: SVGInsigniaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Debug: verificar estado da conquista
  console.log('SVGInsignia - Achievement:', {
    id: achievement.id,
    name: achievement.name,
    unlocked: achievement.unlocked,
    progress: achievement.progress,
    maxProgress: achievement.maxProgress
  });

  const getAchievementTheme = (type: string) => {
    const themes = {
      'produtividade': {
        name: 'SPEED CORE',
        icon: 'speed',
        colors: {
          main: ['rgba(255, 215, 0, 0.9)', 'rgba(255, 235, 130, 0.8)', 'rgba(255, 200, 50, 0.7)', 'rgba(255, 215, 0, 0.8)', 'rgba(255, 240, 150, 0.9)'],
          facet1: ['rgba(255, 255, 100, 0.6)', 'rgba(255, 215, 0, 0.1)'],
          facet2: ['rgba(255, 235, 130, 0.4)', 'rgba(255, 215, 0, 0.1)'],
          glow: 'rgba(255, 215, 0, 0.4)',
          rays: 'rgba(255, 165, 0, 0.6)'
        },
        description: 'Núcleo de velocidade'
      },
      'qualidade': {
        name: 'CRYSTAL GUARDIAN',
        icon: 'crystal',
        colors: {
          main: ['rgba(255, 255, 255, 0.9)', 'rgba(230, 240, 255, 0.8)', 'rgba(200, 220, 255, 0.7)', 'rgba(255, 255, 255, 0.8)', 'rgba(240, 248, 255, 0.9)'],
          facet1: ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.1)'],
          facet2: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)'],
          glow: 'rgba(0, 255, 136, 0.4)',
          rays: 'rgba(41, 204, 255, 0.6)'
        },
        description: 'Guardião cristalino'
      },
      'eficiencia': {
        name: 'WATER SAGE',
        icon: 'water',
        colors: {
          main: ['rgba(100, 255, 200, 0.9)', 'rgba(150, 255, 220, 0.8)', 'rgba(50, 255, 150, 0.7)', 'rgba(100, 255, 200, 0.8)', 'rgba(180, 255, 240, 0.9)'],
          facet1: ['rgba(150, 255, 220, 0.6)', 'rgba(100, 255, 200, 0.1)'],
          facet2: ['rgba(180, 255, 240, 0.4)', 'rgba(100, 255, 200, 0.1)'],
          glow: 'rgba(0, 191, 255, 0.4)',
          rays: 'rgba(0, 255, 255, 0.6)'
        },
        description: 'Sábio das águas'
      },
      'consistencia': {
        name: 'FLAME KEEPER',
        icon: 'fire',
        colors: {
          main: ['rgba(255, 100, 50, 0.9)', 'rgba(255, 150, 100, 0.8)', 'rgba(255, 80, 30, 0.7)', 'rgba(255, 100, 50, 0.8)', 'rgba(255, 180, 120, 0.9)'],
          facet1: ['rgba(255, 150, 100, 0.6)', 'rgba(255, 100, 50, 0.1)'],
          facet2: ['rgba(255, 180, 120, 0.4)', 'rgba(255, 100, 50, 0.1)'],
          glow: 'rgba(255, 107, 53, 0.4)',
          rays: 'rgba(255, 69, 0, 0.6)'
        },
        description: 'Guardião da chama'
      },
      'especializacao': {
        name: 'NEURAL CORE',
        icon: 'neural',
        colors: {
          main: ['rgba(255, 100, 255, 0.9)', 'rgba(255, 150, 255, 0.8)', 'rgba(200, 50, 255, 0.7)', 'rgba(255, 100, 255, 0.8)', 'rgba(255, 180, 255, 0.9)'],
          facet1: ['rgba(255, 150, 255, 0.6)', 'rgba(255, 100, 255, 0.1)'],
          facet2: ['rgba(255, 180, 255, 0.4)', 'rgba(255, 100, 255, 0.1)'],
          glow: 'rgba(157, 78, 221, 0.4)',
          rays: 'rgba(255, 20, 147, 0.6)'
        },
        description: 'Núcleo neural'
      }
    };
    return themes[type as keyof typeof themes] || themes.produtividade;
  };

  const theme = getAchievementTheme(achievement.type);
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  // Criar partículas no clique
  const createSparkles = (x: number, y: number, count: number = 8) => {
    if (!containerRef.current) return;
    
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
      
      containerRef.current.appendChild(sparkle);
      
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

  // Eventos de interação
  const handleClick = (e: React.MouseEvent) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      createSparkles(x, y, 12);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isHovered) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createMouseTrail(x, y);
    }
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

  return (
    <div className={cn(
      "relative group cursor-pointer",
      className
    )}>
      {/* Container da insignia */}
      <div 
        ref={containerRef}
        className="relative w-80 h-80 flex flex-col items-center justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      >
        
        {/* Pedestal */}
        <div className="absolute w-48 h-12 bg-gradient-to-r from-white/10 via-white/15 to-white/10 rounded-full bottom-20 shadow-lg transition-all duration-300" />
        
        {/* Anel de dispersão de luz */}
        <div 
          className={cn(
            "absolute w-56 h-56 rounded-full transition-all duration-300",
            isHovered ? "opacity-70" : "opacity-40"
          )}
          style={{
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
                "absolute w-1 h-16 bg-gradient-to-t from-transparent via-white/60 to-transparent transition-all duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              style={{
                top: i % 2 === 0 ? '60px' : '120px',
                left: i % 2 === 0 ? '50%' : (i === 1 ? '60px' : 'auto'),
                right: i === 3 ? '60px' : 'auto',
                transform: i % 2 === 0 ? 'translateX(-50%)' : `rotate(${i * 90}deg)`,
                animationDelay: `${i * 0.5}s`,
                animation: isHovered ? 'rayPulse 2s ease-in-out infinite' : 'none'
              }}
            />
          ))}
        </div>
        
        {/* Renderizar SpaceInsignia para Primeira Missão desbloqueada, senão SVG padrão */}
        {achievement.id === 'first_task' && achievement.unlocked ? (
          <div className={cn(
            "w-40 h-40 transition-all duration-300 drop-shadow-lg",
            isHovered && "scale-105",
            isClicked && "animate-diamondPulse"
          )}>
            <SpaceInsignia 
              className="w-full h-full"
              rocketType="explorer"
              showText={false}
              size="small"
            />
          </div>
        ) : (
          <svg 
            ref={svgRef}
            className={cn(
              "w-40 h-40 transition-all duration-300 drop-shadow-lg",
              isHovered && "scale-105 rotate-1",
              isClicked && "animate-diamondPulse"
            )}
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
        
        {/* Texto da insignia */}
        <div className={cn(
          "absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center transition-all duration-300",
          achievement.unlocked ? "text-white" : "text-gray-500",
          isHovered && "transform -translate-x-1/2 -translate-y-1"
        )}>
          <div className={cn(
            "font-bold text-sm tracking-wider",
            achievement.unlocked && "text-shadow-lg"
          )}>
            {achievement.unlocked ? theme.name : achievement.name}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {achievement.unlocked ? theme.description : achievement.description}
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-48">
          <Progress 
            value={progressPercentage} 
            className={cn(
              "h-2",
              achievement.unlocked ? "bg-white/20" : "bg-gray-700"
            )}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{achievement.progress}/{achievement.maxProgress}</span>
            {achievement.unlocked && (
              <span className="text-yellow-400">+{achievement.xpReward} XP</span>
            )}
          </div>
        </div>

        {/* Data de desbloqueio */}
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="absolute -bottom-28 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
            Desbloqueada em {achievement.unlockedAt.toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
