'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './medieval-insignia.module.css';

interface MedievalInsigniaProps {
  className?: string;
  medievalType?: 'knight' | 'wizard' | 'archer' | 'paladin';
  showText?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;
}

const medievalTypes = {
  knight: {
    text: 'KNIGHT NERD BADGE',
    subtitle: 'Insígnia exclusiva para guerreiros digitais • Recompensa NFT • Edição Limitada',
    colors: {
      primary: '#d4af37',
      secondary: 'rgba(212, 175, 55, 0.3)',
      accent: 'rgba(212, 175, 55, 0.1)',
      glow: 'rgba(212, 175, 55, 0.5)'
    }
  },
  wizard: {
    text: 'WIZARD NERD BADGE',
    subtitle: 'Insígnia exclusiva para magos digitais • Recompensa NFT • Edição Limitada',
    colors: {
      primary: '#8B5CF6',
      secondary: 'rgba(139, 92, 246, 0.3)',
      accent: 'rgba(139, 92, 246, 0.1)',
      glow: 'rgba(139, 92, 246, 0.5)'
    }
  },
  archer: {
    text: 'ARCHER NERD BADGE',
    subtitle: 'Insígnia exclusiva para arqueiros digitais • Recompensa NFT • Edição Limitada',
    colors: {
      primary: '#10B981',
      secondary: 'rgba(16, 185, 129, 0.3)',
      accent: 'rgba(16, 185, 129, 0.1)',
      glow: 'rgba(16, 185, 129, 0.5)'
    }
  },
  paladin: {
    text: 'PALADIN NERD BADGE',
    subtitle: 'Insígnia exclusiva para paladinos digitais • Recompensa NFT • Edição Limitada',
    colors: {
      primary: '#F59E0B',
      secondary: 'rgba(245, 158, 11, 0.3)',
      accent: 'rgba(245, 158, 11, 0.1)',
      glow: 'rgba(245, 158, 11, 0.5)'
    }
  }
};

export default function MedievalInsignia({ 
  className = '', 
  medievalType = 'knight',
  showText = true,
  text,
  size = 'medium'
}: MedievalInsigniaProps) {
  const nftContainerRef = useRef<HTMLDivElement>(null);
  const shieldContainerRef = useRef<HTMLDivElement>(null);
  const shieldSvgRef = useRef<SVGSVGElement>(null);
  const [currentType, setCurrentType] = useState(medievalType);

  const selectedType = medievalTypes[currentType];
  const displayText = text || selectedType.text;

  // Configuração de tamanhos
  const getSizeConfig = () => {
    if (typeof size === 'number') {
      return {
        containerSize: size,
        shieldSize: size * 0.3,
        crystalSize: size * 0.03,
        runeSize: Math.max(8, size * 0.04),
        fontSize: Math.max(10, size * 0.045)
      };
    }
    
    const sizeMap = {
      small: { containerSize: 200, shieldSize: 60, crystalSize: 6, runeSize: 8, fontSize: 10 },
      medium: { containerSize: 400, shieldSize: 120, crystalSize: 12, runeSize: 16, fontSize: 18 },
      large: { containerSize: 600, shieldSize: 180, crystalSize: 18, runeSize: 24, fontSize: 24 },
      xlarge: { containerSize: 800, shieldSize: 240, crystalSize: 24, runeSize: 32, fontSize: 32 }
    };
    
    return sizeMap[size];
  };

  const sizeConfig = getSizeConfig();

  // Efeito de ativação
  const handleActivation = () => {
    if (!nftContainerRef.current || !shieldContainerRef.current || !shieldSvgRef.current) return;

    const container = nftContainerRef.current;
    const shieldContainer = shieldContainerRef.current;
    const shieldSvg = shieldSvgRef.current;

    // Efeito de ativação
    container.style.animation = 'none';
    container.style.transform = 'scale(1.15)';
    container.style.filter = 'drop-shadow(0 0 50px rgba(212, 175, 55, 1))';

    // Ativar escudo dourado
    const shieldPath = shieldSvg.querySelector('path[fill="url(#shieldGradient)"]') as SVGPathElement;
    if (shieldPath) {
      shieldPath.style.fill = '#d4af37';
    }

    // Efeito sonoro visual
    createActivationEffect();

    setTimeout(() => {
      container.style.transform = 'scale(1)';
      container.style.filter = 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.8))';
      if (shieldPath) {
        shieldPath.style.fill = 'url(#shieldGradient)';
      }
    }, 300);
  };

  // Criar efeito de partículas
  const createActivationEffect = () => {
    if (!nftContainerRef.current) return;

    for (let i = 0; i < 20; i++) {
      createParticle();
    }
  };

  const createParticle = () => {
    if (!nftContainerRef.current) return;

    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = '#d4af37';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.8)';

    nftContainerRef.current.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 2 + Math.random() * 3;
    const life = 1000 + Math.random() * 500;

    let x = 0;
    let y = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / life;

      if (progress >= 1) {
        particle.remove();
        return;
      }

      x += Math.cos(angle) * velocity;
      y += Math.sin(angle) * velocity;

      particle.style.transform = `translate(${x}px, ${y}px)`;
      particle.style.opacity = (1 - progress).toString();

      requestAnimationFrame(animate);
    };

    animate();
  };

  // Efeito de mouse move para interatividade 3D
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!nftContainerRef.current || !shieldContainerRef.current) return;

    const rect = nftContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;

    shieldContainerRef.current.style.transform = `perspective(1000px) rotateY(${deltaX * 10}deg) rotateX(${-deltaY * 10}deg)`;
  };

  const handleMouseLeave = () => {
    if (shieldContainerRef.current) {
      shieldContainerRef.current.style.transform = '';
    }
  };

  // Atualiza cores e tamanhos quando o tipo ou tamanho muda
  useEffect(() => {
    if (nftContainerRef.current) {
      const colors = selectedType.colors;
      
      // Atualiza CSS custom properties para cores
      nftContainerRef.current.style.setProperty('--medieval-primary', colors.primary);
      nftContainerRef.current.style.setProperty('--medieval-secondary', colors.secondary);
      nftContainerRef.current.style.setProperty('--medieval-accent', colors.accent);
      nftContainerRef.current.style.setProperty('--medieval-glow', colors.glow);
      
      // Atualiza CSS custom properties para tamanhos
      nftContainerRef.current.style.setProperty('--medieval-container-size', `${sizeConfig.containerSize}px`);
      nftContainerRef.current.style.setProperty('--medieval-shield-size', `${sizeConfig.shieldSize}px`);
      nftContainerRef.current.style.setProperty('--medieval-crystal-size', `${sizeConfig.crystalSize}px`);
      nftContainerRef.current.style.setProperty('--medieval-rune-size', `${sizeConfig.runeSize}px`);
      nftContainerRef.current.style.setProperty('--medieval-font-size', `${sizeConfig.fontSize}px`);
    }
  }, [currentType, sizeConfig]);

  return (
    <div className={styles.medievalWrapper}>
      <div 
        ref={nftContainerRef}
        className={`${styles.nftContainer} ${className}`}
        onClick={handleActivation}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        
        <div className={styles.interactiveGlow}></div>
        
        <div className={styles.outerRing}></div>
        <div className={styles.middleRing}></div>
        
        <div className={styles.innerCircle}>
          <div ref={shieldContainerRef} className={styles.shieldContainer}>
            <svg ref={shieldSvgRef} className={styles.shieldSvg} viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#1e3c72', stopOpacity:1}} />
                  <stop offset="30%" style={{stopColor:'#2a5298', stopOpacity:1}} />
                  <stop offset="70%" style={{stopColor:'#3d6cb9', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#1e3c72', stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#d4af37', stopOpacity:1}} />
                  <stop offset="25%" style={{stopColor:'#f4e99b', stopOpacity:1}} />
                  <stop offset="50%" style={{stopColor:'#d4af37', stopOpacity:1}} />
                  <stop offset="75%" style={{stopColor:'#f4e99b', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#d4af37', stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="shieldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:0.3}} />
                  <stop offset="50%" style={{stopColor:'#ffffff', stopOpacity:0.1}} />
                  <stop offset="100%" style={{stopColor:'#ffffff', stopOpacity:0}} />
                </linearGradient>
                <linearGradient id="swordBlade" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#e8e8e8', stopOpacity:1}} />
                  <stop offset="30%" style={{stopColor:'#ffffff', stopOpacity:1}} />
                  <stop offset="70%" style={{stopColor:'#c0c0c0', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#a0a0a0', stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="swordEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:0.8}} />
                  <stop offset="100%" style={{stopColor:'#ffffff', stopOpacity:0}} />
                </linearGradient>
                <linearGradient id="crossguard" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#d4af37', stopOpacity:1}} />
                  <stop offset="50%" style={{stopColor:'#f4e99b', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#b8860b', stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#8B4513', stopOpacity:1}} />
                  <stop offset="30%" style={{stopColor:'#A0522D', stopOpacity:1}} />
                  <stop offset="70%" style={{stopColor:'#8B4513', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#654321', stopOpacity:1}} />
                </linearGradient>
                <radialGradient id="pommelGradient" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" style={{stopColor:'#f4e99b', stopOpacity:1}} />
                  <stop offset="50%" style={{stopColor:'#d4af37', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#b8860b', stopOpacity:1}} />
                </radialGradient>
                <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
                  <feOffset dx="2" dy="2" result="offset"/>
                  <feFlood floodColor="#000000" floodOpacity="0.3"/>
                  <feComposite in2="offset" operator="in"/>
                </filter>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Shield outer border with rounded bottom */}
              <path d="M60 5 L110 5 Q115 5 115 10 L115 85 Q115 95 110 100 L65 130 Q60 135 55 130 L10 100 Q5 95 5 85 L5 10 Q5 5 10 5 Z" 
                    fill="url(#shieldBorder)" stroke="none"/>
              
              {/* Shield main body with rounded bottom */}
              <path d="M60 8 L107 8 Q111 8 111 12 L111 84 Q111 92 107 97 L63 127 Q60 130 57 127 L13 97 Q9 92 9 84 L9 12 Q9 8 13 8 Z" 
                    fill="url(#shieldGradient)" stroke="none"/>
              
              {/* Shield highlight effect */}
              <path d="M60 8 L107 8 Q111 8 111 12 L111 84 Q111 92 107 97 L63 127 Q60 130 57 127 L13 97 Q9 92 9 84 L9 12 Q9 8 13 8 Z" 
                    fill="url(#shieldHighlight)" stroke="none"/>
              
              {/* Inner decorative border */}
              <path d="M60 15 L100 15 Q103 15 103 18 L103 80 Q103 85 100 88 L63 115 Q60 118 57 115 L20 88 Q17 85 17 80 L17 18 Q17 15 20 15 Z" 
                    fill="none" stroke="url(#shieldBorder)" strokeWidth="0.8" opacity="0.7"/>
              
              {/* Central heraldic division lines */}
              <path d="M30 25 Q60 30 90 25" stroke="url(#shieldBorder)" strokeWidth="0.6" opacity="0.4" fill="none"/>
              <path d="M25 45 Q60 50 95 45" stroke="url(#shieldBorder)" strokeWidth="0.6" opacity="0.4" fill="none"/>
              
              {/* Central sword assembly */}
              <g transform="translate(60, 50)">
                {/* Sword blade main */}
                <ellipse cx="0" cy="-20" rx="3" ry="25" fill="url(#swordBlade)"/>
                
                {/* Sword blade center ridge */}
                <ellipse cx="0" cy="-20" rx="0.5" ry="24" fill="url(#swordEdge)"/>
                
                {/* Sword tip */}
                <ellipse cx="0" cy="-45" rx="2" ry="5" fill="url(#swordBlade)"/>
                
                {/* Crossguard */}
                <ellipse cx="0" cy="5" rx="15" ry="2.5" fill="url(#crossguard)" filter="url(#glow)"/>
                <ellipse cx="0" cy="4.5" rx="15" ry="1" fill="#ffffff" opacity="0.3"/>
                
                {/* Handle grip */}
                <ellipse cx="0" cy="15" rx="2" ry="8" fill="url(#handleGradient)"/>
                
                {/* Handle binding */}
                <ellipse cx="0" cy="12" rx="2.2" ry="1" fill="#d4af37" opacity="0.8"/>
                <ellipse cx="0" cy="15" rx="2.2" ry="1" fill="#d4af37" opacity="0.8"/>
                <ellipse cx="0" cy="18" rx="2.2" ry="1" fill="#d4af37" opacity="0.8"/>
                
                {/* Pommel */}
                <ellipse cx="0" cy="25" rx="4" ry="3" fill="url(#pommelGradient)" filter="url(#glow)"/>
                <ellipse cx="0" cy="24" rx="3" ry="2" fill="#ffffff" opacity="0.2"/>
                <circle cx="0" cy="25" r="1.5" fill="#d4af37"/>
                <circle cx="0" cy="24.5" r="0.8" fill="#ffffff" opacity="0.6"/>
              </g>
              
              {/* Decorative corner gems */}
              <circle cx="25" cy="25" r="3" fill="url(#pommelGradient)" filter="url(#glow)"/>
              <circle cx="95" cy="25" r="3" fill="url(#pommelGradient)" filter="url(#glow)"/>
              <circle cx="25" cy="25" r="1.5" fill="#00ffff" opacity="0.8"/>
              <circle cx="95" cy="25" r="1.5" fill="#00ffff" opacity="0.8"/>
              
              {/* Side decorative elements */}
              <ellipse cx="20" cy="50" rx="2" ry="3" fill="#d4af37" opacity="0.6"/>
              <ellipse cx="100" cy="50" rx="2" ry="3" fill="#d4af37" opacity="0.6"/>
              
              {/* Bottom decorative curves */}
              <path d="M35 85 Q60 90 85 85" stroke="url(#shieldBorder)" strokeWidth="0.8" opacity="0.5" fill="none"/>
              <path d="M40 95 Q60 98 80 95" stroke="url(#shieldBorder)" strokeWidth="0.6" opacity="0.4" fill="none"/>
            </svg>
          </div>
        </div>
        
        <div className={styles.decorativeElements}>
          <div className={styles.crystal}></div>
          <div className={styles.crystal}></div>
          <div className={styles.crystal}></div>
          <div className={styles.crystal}></div>
          <div className={styles.rune}>ᚱ</div>
          <div className={styles.rune}>ᚦ</div>
          <div className={styles.rune}>ᚨ</div>
          <div className={styles.rune}>ᚺ</div>
        </div>
        
        
      </div>
    </div>
  );
}
