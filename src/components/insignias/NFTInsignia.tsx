'use client';

import React, { useEffect, useRef, useState } from 'react';
import './nft-insignia.css';

interface NFTInsigniaProps {
  className?: string;
  nftType?: 'tech' | 'cyber' | 'neural' | 'quantum';
  showText?: boolean;
  text?: string;
}

const nftTypes = {
  tech: {
    text: 'TECH NERD REWARD',
    subtitle: 'Web3 • AI • Sci-Fi • Digital Collectible',
    colors: {
      primary: '#00ffff',
      secondary: 'rgba(0, 255, 255, 0.3)',
      accent: 'rgba(0, 255, 255, 0.1)',
      glow: 'rgba(0, 255, 255, 0.5)'
    }
  },
  cyber: {
    text: 'CYBER WARRIOR',
    subtitle: 'Blockchain • Crypto • Digital Asset',
    colors: {
      primary: '#00ff00',
      secondary: 'rgba(0, 255, 0, 0.3)',
      accent: 'rgba(0, 255, 0, 0.1)',
      glow: 'rgba(0, 255, 0, 0.5)'
    }
  },
  neural: {
    text: 'NEURAL MASTER',
    subtitle: 'AI • Machine Learning • Neural Network',
    colors: {
      primary: '#ff00ff',
      secondary: 'rgba(255, 0, 255, 0.3)',
      accent: 'rgba(255, 0, 255, 0.1)',
      glow: 'rgba(255, 0, 255, 0.5)'
    }
  },
  quantum: {
    text: 'QUANTUM SAGE',
    subtitle: 'Quantum • Physics • Future Tech',
    colors: {
      primary: '#ffff00',
      secondary: 'rgba(255, 255, 0, 0.3)',
      accent: 'rgba(255, 255, 0, 0.1)',
      glow: 'rgba(255, 255, 0, 0.5)'
    }
  }
};

export default function NFTInsignia({ 
  className = '', 
  nftType = 'tech',
  showText = true,
  text
}: NFTInsigniaProps) {
  const nftContainerRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState(nftType);

  const selectedType = nftTypes[currentType];
  const displayText = text || selectedType.text;

  // Efeito de mint
  const handleMintEffect = () => {
    if (nftContainerRef.current) {
      nftContainerRef.current.style.animation = 'mintEffect 1s ease-out';
      setTimeout(() => {
        if (nftContainerRef.current) {
          nftContainerRef.current.style.animation = '';
        }
      }, 1000);
    }
  };

  // Efeito de mouse move para interatividade 3D
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!nftContainerRef.current) return;
    
    const rect = nftContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    nftContainerRef.current.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (nftContainerRef.current) {
      nftContainerRef.current.style.transform = '';
    }
  };

  // Atualiza cores quando o tipo muda
  useEffect(() => {
    if (nftContainerRef.current) {
      const colors = selectedType.colors;
      
      // Atualiza CSS custom properties
      nftContainerRef.current.style.setProperty('--nft-primary', colors.primary);
      nftContainerRef.current.style.setProperty('--nft-secondary', colors.secondary);
      nftContainerRef.current.style.setProperty('--nft-accent', colors.accent);
      nftContainerRef.current.style.setProperty('--nft-glow', colors.glow);
    }
  }, [currentType]);

  return (
    <div className="nft-wrapper">
      <div 
        ref={nftContainerRef}
        className={`nft-container ${className}`}
        onClick={handleMintEffect}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="grid-background"></div>
        <div className="blockchain-elements"></div>
        
        <div className="central-logo">
          <div className="neural-network">
            <div className="node"></div>
            <div className="node"></div>
            <div className="node"></div>
            <div className="node"></div>
            <div className="node"></div>
            <div className="node node-center"></div>
            <div className="connection"></div>
            <div className="connection"></div>
            <div className="connection"></div>
            <div className="connection connection-diagonal-1"></div>
            <div className="connection connection-diagonal-2"></div>
            <div className="connection connection-diagonal-3"></div>
            <div className="connection connection-diagonal-4"></div>
            <div className="ai-core">
              <div className="ai-pulse"></div>
              <div className="ai-ring"></div>
            </div>
          </div>
        </div>

        <div className="corner-elements corner-tl"></div>
        <div className="corner-elements corner-tr"></div>
        <div className="corner-elements corner-bl"></div>
        <div className="corner-elements corner-br"></div>

        <div className="data-particles particle-1"></div>
        <div className="data-particles particle-2"></div>
        <div className="data-particles particle-3"></div>
        <div className="data-particles particle-4"></div>
        <div className="data-particles particle-5"></div>
        <div className="data-particles particle-6"></div>

        <div className="ai-data-streams">
          <div className="data-stream stream-1"></div>
          <div className="data-stream stream-2"></div>
          <div className="data-stream stream-3"></div>
        </div>

        <div className="tech-text">
          NEURAL NETWORK<br />
          AUTHENTICATED
        </div>

        <div className="hologram-effect"></div>
      </div>

      {showText && (
        <div className="info-panel">
          <div className="title">{displayText}</div>
          <div className="subtitle">{selectedType.subtitle}</div>
        </div>
      )}
    </div>
  );
}
