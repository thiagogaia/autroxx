'use client';

import React, { useState } from 'react';
import MedievalBackGround from '@/components/insignias/MedievalBackGround';
import MedievalInsignia from '@/components/insignias/MedievalInsignia';

type MedievalType = 'knight' | 'wizard' | 'archer' | 'paladin';

export default function MedievalDemoPage() {
  const [currentType, setCurrentType] = useState<MedievalType>('knight');

  const medievalTypes = {
    knight: { text: '⚔️ Knight', label: 'KNIGHT NERD BADGE', subtitle: 'Insígnia exclusiva para guerreiros digitais • Recompensa NFT • Edição Limitada' },
    wizard: { text: '🧙 Wizard', label: 'WIZARD NERD BADGE', subtitle: 'Insígnia exclusiva para magos digitais • Recompensa NFT • Edição Limitada' },
    archer: { text: '🏹 Archer', label: 'ARCHER NERD BADGE', subtitle: 'Insígnia exclusiva para arqueiros digitais • Recompensa NFT • Edição Limitada' },
    paladin: { text: '🛡️ Paladin', label: 'PALADIN NERD BADGE', subtitle: 'Insígnia exclusiva para paladinos digitais • Recompensa NFT • Edição Limitada' }
  };

  const changeMedievalType = (type: MedievalType) => {
    setCurrentType(type);
  };

  return (
    <MedievalBackGround>
      <div className="demo-info">
        <strong>NFT Medieval Badge</strong><br />
        Clique para ativar! Movimente o mouse para 3D
      </div>

      <MedievalInsignia 
        medievalType={currentType}
        showText={true}
        text={medievalTypes[currentType].label}
      />

      <div className="controls">
        {Object.entries(medievalTypes).map(([type, config]) => (
          <button
            key={type}
            className={`btn ${currentType === type ? 'active' : ''}`}
            onClick={() => changeMedievalType(type as MedievalType)}
            data-type={type}
          >
            {config.text}
          </button>
        ))}
      </div>

      <style jsx>{`
        .demo-info {
          position: absolute;
          top: 20px;
          left: 20px;
          color: #d4af37;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #d4af37;
        }

        .controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
        }

        .btn {
          background: linear-gradient(135deg, 
            rgba(212, 175, 55, 0.3) 0%, 
            rgba(212, 175, 55, 0.2) 100%);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.5);
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          margin: 0 6px;
          font-size: 14px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 5px 20px rgba(212, 175, 55, 0.4),
            0 0 30px rgba(212, 175, 55, 0.3);
          background: linear-gradient(135deg, 
            rgba(212, 175, 55, 0.5) 0%, 
            rgba(212, 175, 55, 0.3) 100%);
        }

        .btn.active {
          background: linear-gradient(135deg, 
            rgba(212, 175, 55, 0.6) 0%, 
            rgba(212, 175, 55, 0.4) 100%);
          border-color: rgba(212, 175, 55, 0.7);
          color: #ffffff;
        }
      `}</style>
    </MedievalBackGround>
  );
}
