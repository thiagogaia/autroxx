'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './nft-insignia.module.css';

interface NFTInsigniaProps {
  className?: string;
  nftType?: 'tech' | 'cyber' | 'neural' | 'quantum';
  showText?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;
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
  text,
  size = 'medium'
}: NFTInsigniaProps) {
  const nftContainerRef = useRef<HTMLDivElement>(null);
  const [currentType, setCurrentType] = useState(nftType);

  const selectedType = nftTypes[currentType];
  const displayText = text || selectedType.text;

  // Configuração de tamanhos
  const getSizeConfig = () => {
    if (typeof size === 'number') {
      return {
        containerSize: size,
        logoSize: size * 0.5,
        nodeSize: size * 0.025,
        fontSize: Math.max(8, size * 0.03)
      };
    }
    
    const sizeMap = {
      small: { containerSize: 200, logoSize: 100, nodeSize: 5, fontSize: 8 },
      medium: { containerSize: 400, logoSize: 200, nodeSize: 10, fontSize: 12 },
      large: { containerSize: 600, logoSize: 300, nodeSize: 15, fontSize: 16 },
      xlarge: { containerSize: 800, logoSize: 400, nodeSize: 20, fontSize: 20 }
    };
    
    return sizeMap[size];
  };

  const sizeConfig = getSizeConfig();

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

  // Atualiza cores e tamanhos quando o tipo ou tamanho muda
  useEffect(() => {
    if (nftContainerRef.current) {
      const colors = selectedType.colors;
      
      // Atualiza CSS custom properties para cores
      nftContainerRef.current.style.setProperty('--nft-primary', colors.primary);
      nftContainerRef.current.style.setProperty('--nft-secondary', colors.secondary);
      nftContainerRef.current.style.setProperty('--nft-accent', colors.accent);
      nftContainerRef.current.style.setProperty('--nft-glow', colors.glow);
      
      // Atualiza CSS custom properties para tamanhos
      nftContainerRef.current.style.setProperty('--nft-container-size', `${sizeConfig.containerSize}px`);
      nftContainerRef.current.style.setProperty('--nft-logo-size', `${sizeConfig.logoSize}px`);
      nftContainerRef.current.style.setProperty('--nft-node-size', `${sizeConfig.nodeSize}px`);
      nftContainerRef.current.style.setProperty('--nft-font-size', `${sizeConfig.fontSize}px`);
    }
  }, [currentType, sizeConfig]);

  return (
    <div className={styles.nftWrapper}>
      <div 
        ref={nftContainerRef}
        className={`${styles.nftContainer} ${className}`}
        onClick={handleMintEffect}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.gridBackground}></div>
        <div className={styles.blockchainElements}></div>
        
        <div className={styles.centralLogo}>
          <div className={styles.neuralNetwork}>
            <div className={styles.node}></div>
            <div className={styles.node}></div>
            <div className={styles.node}></div>
            <div className={styles.node}></div>
            <div className={styles.node}></div>
            <div className={`${styles.node} ${styles.nodeCenter}`}></div>
            <div className={styles.connection}></div>
            <div className={styles.connection}></div>
            <div className={styles.connection}></div>
            <div className={`${styles.connection} ${styles.connectionDiagonal1}`}></div>
            <div className={`${styles.connection} ${styles.connectionDiagonal2}`}></div>
            <div className={`${styles.connection} ${styles.connectionDiagonal3}`}></div>
            <div className={`${styles.connection} ${styles.connectionDiagonal4}`}></div>
            <div className={styles.aiCore}>
              <div className={styles.aiPulse}></div>
              <div className={styles.aiRing}></div>
            </div>
          </div>
        </div>

        <div className={`${styles.cornerElements} ${styles.cornerTl}`}></div>
        <div className={`${styles.cornerElements} ${styles.cornerTr}`}></div>
        <div className={`${styles.cornerElements} ${styles.cornerBl}`}></div>
        <div className={`${styles.cornerElements} ${styles.cornerBr}`}></div>

        <div className={`${styles.dataParticles} ${styles.particle1}`}></div>
        <div className={`${styles.dataParticles} ${styles.particle2}`}></div>
        <div className={`${styles.dataParticles} ${styles.particle3}`}></div>
        <div className={`${styles.dataParticles} ${styles.particle4}`}></div>
        <div className={`${styles.dataParticles} ${styles.particle5}`}></div>
        <div className={`${styles.dataParticles} ${styles.particle6}`}></div>

        <div className={styles.aiDataStreams}>
          <div className={`${styles.dataStream} ${styles.stream1}`}></div>
          <div className={`${styles.dataStream} ${styles.stream2}`}></div>
          <div className={`${styles.dataStream} ${styles.stream3}`}></div>
        </div>

        <div className={styles.techText}>
          NEURAL NETWORK<br />
          AUTHENTICATED
        </div>

        <div className={styles.hologramEffect}></div>
      </div>

      {showText && (
        <div className={styles.infoPanel}>
          <div className={styles.title}>{displayText}</div>
          <div className={styles.subtitle}>{selectedType.subtitle}</div>
        </div>
      )}
    </div>
  );
}
