'use client';

import React, { useEffect, useRef, useState } from 'react';
import './trophy-insignia.css';

interface TrophyInsigniaProps {
  className?: string;
  trophyType?: 'legendary' | 'epic' | 'rare' | 'common';
  showText?: boolean;
  text?: string;
  level?: number;
  xp?: number;
}

const trophyTypes = {
  legendary: {
    text: 'LEGENDARY TROPHY',
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#00ffff',
      glow: 'rgba(255, 215, 0, 0.8)'
    }
  },
  epic: {
    text: 'EPIC TROPHY',
    colors: {
      primary: '#9932CC',
      secondary: '#8A2BE2',
      accent: '#00ff00',
      glow: 'rgba(153, 50, 204, 0.8)'
    }
  },
  rare: {
    text: 'RARE TROPHY',
    colors: {
      primary: '#4169E1',
      secondary: '#0000FF',
      accent: '#00ffff',
      glow: 'rgba(65, 105, 225, 0.8)'
    }
  },
  common: {
    text: 'COMMON TROPHY',
    colors: {
      primary: '#C0C0C0',
      secondary: '#808080',
      accent: '#00ff00',
      glow: 'rgba(192, 192, 192, 0.8)'
    }
  }
};

const consoleMessages = [
  "> system.trophy.analyze()<br>> Status: LEGENDARY<br>> Nerdness Level: OVER 9000!<br>> Achievement: Ultimate Gaming Master",
  "> scanning.user.skills()<br>> Coding: EXPERT<br>> Gaming: LEGENDARY<br>> Memes: GODLIKE<br>> Status: CERTIFIED NERD",
  "> loading.achievement.data()<br>> Achievements: 1337<br>> Boss Battles Won: 999<br>> Code Lines: 1,000,000+<br>> Respect Level: MAXIMUM",
  "> analyzing.nerd.power()<br>> IQ: UNMEASURABLE<br>> Caffeine Level: CRITICAL<br>> Sleep Schedule: UNDEFINED<br>> Power Level: IT'S OVER 9000!"
];

export default function TrophyInsignia({ 
  className = '', 
  trophyType = 'legendary',
  showText = true,
  text,
  level = 42,
  xp = 13337
}: TrophyInsigniaProps) {
  const badgeContainerRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const levelUpRef = useRef<HTMLDivElement>(null);
  const binaryRainRef = useRef<HTMLDivElement>(null);
  const consoleTextRef = useRef<HTMLDivElement>(null);
  
  const [currentType, setCurrentType] = useState(trophyType);
  const [currentLevel, setCurrentLevel] = useState(level);
  const [currentXp, setCurrentXp] = useState(xp);
  const [clickCount, setClickCount] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const selectedType = trophyTypes[currentType];
  const displayText = text || selectedType.text;

  // Cria sparkles
  const createSparkle = () => {
    if (!sparklesRef.current) return;
    
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.innerHTML = Math.random() > 0.5 ? '✨' : '⭐';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    sparklesRef.current.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 2000);
  };

  // Cria partículas Matrix
  const createParticle = () => {
    if (!particlesRef.current) return;
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = (Math.random() - 0.5) * 200 + 'px';
    particle.style.top = (Math.random() - 0.5) * 200 + 'px';
    particle.style.animationDelay = Math.random() * 2 + 's';
    particlesRef.current.appendChild(particle);
    
    setTimeout(() => particle.remove(), 3000);
  };

  // Cria chuva binária
  const createBinaryDigit = () => {
    if (!binaryRainRef.current) return;
    
    const digit = document.createElement('div');
    digit.className = 'binary-digit';
    digit.textContent = Math.random() > 0.5 ? '1' : '0';
    digit.style.left = Math.random() * 100 + '%';
    digit.style.animationDelay = Math.random() * 2 + 's';
    binaryRainRef.current.appendChild(digit);
    
    setTimeout(() => digit.remove(), 5000);
  };

  // Efeito de som (removido)
  const playSound = () => {
    // Som removido conforme solicitado
  };

  // Level up
  const triggerLevelUp = () => {
    setCurrentLevel(prev => prev + 1);
    setCurrentXp(Math.random() * 5000 + 10000);
    
    if (levelUpRef.current) {
      levelUpRef.current.style.opacity = '1';
      levelUpRef.current.style.animation = 'levelUp 2s ease-out';
      
      setTimeout(() => {
        if (levelUpRef.current) {
          levelUpRef.current.style.opacity = '0';
        }
      }, 2000);
    }
  };

  // Cicla mensagens do console
  const cycleConsoleText = () => {
    setMessageIndex(prev => (prev + 1) % consoleMessages.length);
  };

  // Evento de clique
  const handleClick = () => {
    setClickCount(prev => prev + 1);
    
    playSound();
    
    // Cria múltiplos efeitos
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createSparkle(), i * 100);
      setTimeout(() => createParticle(), i * 50);
    }
    
    if (clickCount % 3 === 0) {
      triggerLevelUp();
    }
    
    cycleConsoleText();
  };

  // Efeitos de hover
  const handleMouseEnter = () => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => createSparkle(), i * 100);
    }
    
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createParticle(), i * 50);
    }
  };

  // Efeitos automáticos
  useEffect(() => {
    // Chuva binária automática
    const binaryInterval = setInterval(createBinaryDigit, 200);
    
    // Partículas ambientes
    const ambientInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        createSparkle();
      }
    }, 1000);

    return () => {
      clearInterval(binaryInterval);
      clearInterval(ambientInterval);
    };
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
      }
      
      if (e.code === 'Enter') {
        e.preventDefault();
        triggerLevelUp();
      }
      
      if (e.code === 'KeyK' && e.ctrlKey) {
        e.preventDefault();
        cycleConsoleText();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clickCount]);

  return (
    <div 
      ref={badgeContainerRef}
      className={`badge-container ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Stats Panel */}
      <div className="stats-panel">
        <div>🏆 ACHIEVEMENT UNLOCKED</div>
        <div>Level: <span>{currentLevel}</span></div>
        <div>XP: <span>{currentXp.toFixed(0)}</span> / 15,000</div>
        <div className="xp-bar">
          <div className="xp-fill"></div>
        </div>
        <div>Legendary Status: ACTIVATED</div>
      </div>

      {/* Trophy SVG */}
      <svg className="trophy-badge" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: selectedType.colors.primary}} />
            <stop offset="30%" style={{stopColor: selectedType.colors.secondary}} />
            <stop offset="70%" style={{stopColor: selectedType.colors.secondary}} />
            <stop offset="100%" style={{stopColor: selectedType.colors.primary}} />
          </linearGradient>
          
          <radialGradient id="bgGradient" cx="50%" cy="50%">
            <stop offset="0%" style={{stopColor: '#1a1a2e'}} />
            <stop offset="50%" style={{stopColor: '#16213e'}} />
            <stop offset="100%" style={{stopColor: '#0f3460'}} />
          </radialGradient>
          
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="hologram" x="-20%" y="-20%" width="140%" height="140%">
            <feColorMatrix type="matrix" values="0 1 1 0 0  0 1 1 0 0  0 1 1 0 0  0 0 0 1 0"/>
          </filter>
        </defs>
        
        {/* Outer ring with rotation */}
        <circle cx="150" cy="150" r="145" fill="none" stroke="url(#goldGradient)" strokeWidth="3" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" values="0 150 150;360 150 150" dur="20s" repeatCount="indefinite"/>
        </circle>
        
        {/* Main background */}
        <circle cx="150" cy="150" r="135" fill="url(#bgGradient)" stroke={selectedType.colors.accent} strokeWidth="2" filter="url(#neonGlow)"/>
        
        {/* Hexagonal tech pattern */}
        <g stroke={selectedType.colors.accent} strokeWidth="1" fill="none" opacity="0.3">
          <polygon points="150,80 180,95 180,125 150,140 120,125 120,95"/>
          <polygon points="150,160 180,175 180,205 150,220 120,205 120,175"/>
          <polygon points="90,120 120,135 120,165 90,180 60,165 60,135"/>
          <polygon points="210,120 240,135 240,165 210,180 180,165 180,135"/>
        </g>
        
        {/* Trophy */}
        <g filter="url(#neonGlow)">
          <ellipse cx="150" cy="120" rx="50" ry="35" fill="url(#goldGradient)" stroke={selectedType.colors.primary} strokeWidth="2"/>
          <ellipse cx="150" cy="110" rx="45" ry="25" fill={selectedType.colors.primary}/>
          
          {/* Handles */}
          <ellipse cx="110" cy="130" rx="12" ry="20" fill="none" stroke="url(#goldGradient)" strokeWidth="4"/>
          <ellipse cx="190" cy="130" rx="12" ry="20" fill="none" stroke="url(#goldGradient)" strokeWidth="4"/>
          
          {/* Stem */}
          <rect x="140" y="155" width="20" height="40" fill="url(#goldGradient)"/>
          
          {/* Base */}
          <rect x="120" y="195" width="60" height="20" rx="3" fill="#8B4513"/>
          <rect x="130" y="215" width="40" height="12" rx="2" fill="#654321"/>
        </g>
        
        {/* Holographic text */}
        <text x="150" y="130" fontFamily="Arial" fontSize="24" fontWeight="bold" textAnchor="middle" fill={selectedType.colors.accent} filter="url(#hologram)">1ST</text>
        
        {/* Circuit pattern */}
        <g stroke={selectedType.colors.accent} strokeWidth="1" fill="none" opacity="0.5">
          <path d="M 50 50 L 80 50 L 80 80 M 220 50 L 250 50 L 250 80 M 50 220 L 80 220 L 80 250 M 220 220 L 250 220 L 250 250"/>
          <circle cx="65" cy="65" r="3" fill={selectedType.colors.accent}/>
          <circle cx="235" cy="65" r="3" fill={selectedType.colors.accent}/>
          <circle cx="65" cy="235" r="3" fill={selectedType.colors.accent}/>
          <circle cx="235" cy="235" r="3" fill={selectedType.colors.accent}/>
        </g>
      </svg>

      {/* Sparkles */}
      <div ref={sparklesRef} className="sparkles"></div>
      
      {/* Particles */}
      <div ref={particlesRef} className="particles"></div>
      
      {/* Level up notification */}
      <div ref={levelUpRef} className="level-up">+100 XP<br />LEVEL UP!</div>
      
      {/* Sound effect - removido */}
      
      {/* Console text */}
      <div className="console-text">
        <div className="typing" ref={consoleTextRef} dangerouslySetInnerHTML={{ __html: consoleMessages[messageIndex] }}></div>
      </div>
      
      {/* Binary rain */}
      <div ref={binaryRainRef} className="binary"></div>
      
      {showText && (
        <div className="badge-text">{displayText}</div>
      )}
    </div>
  );
}
