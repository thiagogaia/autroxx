'use client';

import React, { useEffect, useRef, useState } from 'react';
import './discord-insignia.css';

interface DiscordInsigniaProps {
  className?: string;
  badgeType?: 'nitro' | 'partner' | 'moderator' | 'developer';
  showText?: boolean;
  text?: string;
  showTyping?: boolean;
}

const badgeTypes = {
  nitro: {
    text: 'ELITE GUARDIAN',
    gradient: 'linear-gradient(135deg, #7289da 0%, #5865f2 100%)',
    notification: '★'
  },
  partner: {
    text: 'COSMIC SHIELD',
    gradient: 'linear-gradient(135deg, #43b581 0%, #3ba55c 100%)',
    notification: '◊'
  },
  moderator: {
    text: 'MASTER PROTECTOR',
    gradient: 'linear-gradient(135deg, #f04747 0%, #d63031 100%)',
    notification: '♦'
  },
  developer: {
    text: 'LEGEND BEARER',
    gradient: 'linear-gradient(135deg, #faa61a 0%, #f39c12 100%)',
    notification: '※'
  }
};

export default function DiscordInsignia({ 
  className = '', 
  badgeType = 'nitro',
  showText = true,
  text,
  showTyping = true
}: DiscordInsigniaProps) {
  const badgeContainerRef = useRef<HTMLDivElement>(null);
  const discordBadgeRef = useRef<HTMLDivElement>(null);
  const statusParticlesRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState(badgeType);
  const [typingMessage, setTypingMessage] = useState('alguém está digitando');

  const selectedType = badgeTypes[currentType];
  const displayText = text || selectedType.text;

  const discordMessages = [
    'alguém está digitando',
    'nova mensagem',
    'usuário entrou',
    'boost ativado',
    'reação adicionada'
  ];

  // Cria partículas de status
  const createStatusParticles = (count: number = 5) => {
    if (!statusParticlesRef.current) return;
    
    const statusTypes = ['online', 'idle', 'dnd', 'offline'];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = `status-dot status-${statusTypes[Math.floor(Math.random() * statusTypes.length)]} active`;
      
      const angle = (360 / count) * i + Math.random() * 30;
      const distance = 80 + Math.random() * 40;
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance;
      
      particle.style.left = `calc(50% + ${x}px)`;
      particle.style.top = `calc(50% + ${y}px)`;
      particle.style.animationDelay = (i * 0.2) + 's';
      particle.style.animationDuration = (2 + Math.random() * 2) + 's';
      
      statusParticlesRef.current.appendChild(particle);
      
      setTimeout(() => particle.remove(), 4000);
    }
  };

  // Evento de clique
  const handleClick = () => {
    if (discordBadgeRef.current) {
      discordBadgeRef.current.classList.add('clicked');
      setTimeout(() => discordBadgeRef.current?.classList.remove('clicked'), 600);
    }
    
    createStatusParticles(12);
    
    // Animação da notificação
    if (notificationRef.current) {
      notificationRef.current.style.transform = 'scale(1.3) rotate(15deg)';
      setTimeout(() => {
        if (notificationRef.current) {
          notificationRef.current.style.transform = 'scale(1) rotate(0deg)';
        }
      }, 200);
    }
  };

  // Efeito de hover na notificação
  const handleNotificationMouseEnter = () => {
    if (notificationRef.current) {
      notificationRef.current.style.transform = 'scale(1.2)';
    }
  };

  const handleNotificationMouseLeave = () => {
    if (notificationRef.current) {
      notificationRef.current.style.transform = 'scale(1)';
    }
  };

  // Efeitos automáticos
  useEffect(() => {
    const autoEffects = () => {
      createStatusParticles(3);
    };

    const interval = setInterval(autoEffects, 6000);

    // Simulação de conexão Discord
    const simulateConnection = () => {
      const statuses = document.querySelectorAll('.status-dot');
      statuses.forEach(dot => {
        if (Math.random() > 0.7) {
          dot.style.transform = 'scale(1.3)';
          setTimeout(() => {
            dot.style.transform = 'scale(1)';
          }, 300);
        }
      });
    };

    const connectionInterval = setInterval(simulateConnection, 3000);

    // Inicialização
    setTimeout(() => createStatusParticles(6), 500);

    return () => {
      clearInterval(interval);
      clearInterval(connectionInterval);
    };
  }, []);

  // Atualiza mensagens de typing
  useEffect(() => {
    if (!showTyping) return;

    let messageIndex = 0;
    const updateTypingMessage = () => {
      setTypingMessage(discordMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % discordMessages.length;
    };

    const typingInterval = setInterval(updateTypingMessage, 4000);
    return () => clearInterval(typingInterval);
  }, [showTyping]);

  // Atualiza cores quando o tipo muda
  useEffect(() => {
    if (discordBadgeRef.current) {
      discordBadgeRef.current.style.background = selectedType.gradient;
    }
    if (notificationRef.current) {
      notificationRef.current.textContent = selectedType.notification;
    }
  }, [currentType]);

  return (
    <div 
      ref={badgeContainerRef}
      className={`badge-container ${className}`}
      onClick={handleClick}
    >
      <div className="discord-ring"></div>
      
      <div ref={statusParticlesRef} className="status-particles">
        {/* Partículas de status geradas dinamicamente */}
      </div>
      
      <div ref={discordBadgeRef} className="discord-badge">
        <div className="discord-wave"></div>
        <div className="boost-indicator">✨</div>
        <div 
          ref={notificationRef}
          className="discord-notification"
          onMouseEnter={handleNotificationMouseEnter}
          onMouseLeave={handleNotificationMouseLeave}
        >
          {selectedType.notification}
        </div>
        
        {/* Insígnia SVG Discord */}
        <svg className="discord-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradientes para o design */}
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(255,255,255,1)', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'rgba(255,255,255,0.9)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(255,255,255,0.8)', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(255,255,255,1)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(200,220,255,0.8)', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="innerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(255,255,255,0.6)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(255,255,255,0.2)', stopOpacity:1}} />
            </linearGradient>
            
            {/* Filtro de brilho */}
            <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Base do escudo */}
          <path id="shieldBase" 
            d="M50 10 L75 25 L75 50 Q75 65 50 85 Q25 65 25 50 L25 25 Z" 
            fill="url(#shieldGradient)" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="1"
            filter="url(#innerGlow)">
            <animate attributeName="opacity" 
              values="0.9;1;0.9" 
              dur="3s" 
              repeatCount="indefinite"/>
          </path>
          
          {/* Gema central */}
          <polygon id="centerGem" 
            points="50,25 60,35 50,50 40,35" 
            fill="url(#gemGradient)" 
            stroke="rgba(255,255,255,0.4)" 
            strokeWidth="0.5">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values="0 50 37.5;360 50 37.5" 
              dur="8s" 
              repeatCount="indefinite"/>
          </polygon>
          
          {/* Estrelas decorativas */}
          <g id="decorativeStars">
            {/* Estrela esquerda */}
            <path d="M35 40 L37 44 L41 44 L38 47 L39 51 L35 49 L31 51 L32 47 L29 44 L33 44 Z" 
              fill="rgba(255,255,255,0.8)" 
              stroke="rgba(255,255,255,0.4)" 
              strokeWidth="0.3">
              <animate attributeName="opacity" 
                values="0.6;1;0.6" 
                dur="2s" 
                begin="0s"
                repeatCount="indefinite"/>
            </path>
            
            {/* Estrela direita */}
            <path d="M65 40 L67 44 L71 44 L68 47 L69 51 L65 49 L61 51 L62 47 L59 44 L63 44 Z" 
              fill="rgba(255,255,255,0.8)" 
              stroke="rgba(255,255,255,0.4)" 
              strokeWidth="0.3">
              <animate attributeName="opacity" 
                values="0.6;1;0.6" 
                dur="2s" 
                begin="1s"
                repeatCount="indefinite"/>
            </path>
          </g>
          
          {/* Detalhes do escudo */}
          <g id="shieldDetails">
            {/* Linha central */}
            <line x1="50" y1="25" x2="50" y2="65" 
              stroke="rgba(255,255,255,0.4)" 
              strokeWidth="1" 
              opacity="0.6"/>
            
            {/* Linhas laterais */}
            <path d="M35 30 Q50 35 65 30" 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="0.8" 
              fill="none" 
              opacity="0.7">
              <animate attributeName="opacity" 
                values="0.5;0.9;0.5" 
                dur="4s" 
                repeatCount="indefinite"/>
            </path>
            
            <path d="M35 55 Q50 60 65 55" 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="0.8" 
              fill="none" 
              opacity="0.7">
              <animate attributeName="opacity" 
                values="0.5;0.9;0.5" 
                dur="4s" 
                begin="2s"
                repeatCount="indefinite"/>
            </path>
          </g>
          
          {/* Pontos de luz */}
          <g id="lightDots">
            <circle cx="42" cy="60" r="1.5" 
              fill="rgba(255,255,255,0.9)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0" 
                dur="1.5s" 
                begin="0s"
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="58" cy="60" r="1.5" 
              fill="rgba(255,255,255,0.9)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0" 
                dur="1.5s" 
                begin="0.5s"
                repeatCount="indefinite"/>
            </circle>
            
            <circle cx="50" cy="67" r="1.5" 
              fill="rgba(255,255,255,0.9)" 
              opacity="0">
              <animate attributeName="opacity" 
                values="0;1;0" 
                dur="1.5s" 
                begin="1s"
                repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Aura externa */}
          <path id="outerAura" 
            d="M50 8 L77 23 L77 50 Q77 67 50 87 Q23 67 23 50 L23 23 Z" 
            fill="none" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2" 
            opacity="0.5">
            <animate attributeName="stroke-width" 
              values="1;3;1" 
              dur="2.5s" 
              repeatCount="indefinite"/>
            <animate attributeName="opacity" 
              values="0.3;0.7;0.3" 
              dur="2.5s" 
              repeatCount="indefinite"/>
          </path>
        </svg>
      </div>
      
      {showText && (
        <div className="badge-text">{displayText}</div>
      )}
      
      {showTyping && (
        <div className="typing-indicator">
          {typingMessage}
          <div className="typing-dots">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      )}
    </div>
  );
}
