'use client';

import React, { useState } from 'react';
import TrophyBackGround from '@/components/insignias/TrophyBackGround';
import TrophyInsignia from '@/components/insignias/TrophyInsignia';

type TrophyType = 'legendary' | 'epic' | 'rare' | 'common';

export default function TrophyDemoPage() {
  const [currentType, setCurrentType] = useState<TrophyType>('legendary');

  const trophyTypes = {
    legendary: { text: '🏆 Legendary', label: 'LEGENDARY TROPHY', level: 42, xp: 13337 },
    epic: { text: '💜 Epic', label: 'EPIC TROPHY', level: 35, xp: 8500 },
    rare: { text: '💙 Rare', label: 'RARE TROPHY', level: 25, xp: 5000 },
    common: { text: '⚪ Common', label: 'COMMON TROPHY', level: 10, xp: 1500 }
  };

  const changeTrophyType = (type: TrophyType) => {
    setCurrentType(type);
  };

  return (
    <TrophyBackGround>
      <div className="demo-info">
        <strong>Epic Trophy Badge</strong><br />
        Clique para efeitos épicos! Use SPACE, ENTER ou Ctrl+K
      </div>

      <TrophyInsignia 
        trophyType={currentType}
        showText={true}
        text={trophyTypes[currentType].label}
        level={trophyTypes[currentType].level}
        xp={trophyTypes[currentType].xp}
      />

      <div className="controls">
        {Object.entries(trophyTypes).map(([type, config]) => (
          <button
            key={type}
            className={`btn ${currentType === type ? 'active' : ''}`}
            onClick={() => changeTrophyType(type as TrophyType)}
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
          color: #FFD700;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #FFD700;
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
            rgba(255, 215, 0, 0.3) 0%, 
            rgba(0, 255, 255, 0.2) 100%);
          color: #FFD700;
          border: 1px solid rgba(255, 215, 0, 0.5);
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          margin: 0 6px;
          font-size: 14px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 5px 20px rgba(255, 215, 0, 0.4),
            0 0 30px rgba(0, 255, 255, 0.3);
          background: linear-gradient(135deg, 
            rgba(255, 215, 0, 0.5) 0%, 
            rgba(0, 255, 255, 0.3) 100%);
        }

        .btn.active {
          background: linear-gradient(135deg, 
            rgba(255, 215, 0, 0.6) 0%, 
            rgba(0, 255, 255, 0.4) 100%);
          border-color: rgba(255, 215, 0, 0.7);
          color: #ffffff;
        }
      `}</style>
    </TrophyBackGround>
  );
}
