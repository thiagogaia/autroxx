'use client';

import React, { useState } from 'react';
import SpaceBackGround from '@/components/insignias/SpaceBackGround';
import SpaceInsignia from '@/components/insignias/SpaceInsignia';

type RocketType = 'explorer' | 'military' | 'cargo' | 'shuttle';

export default function SpaceDemoPage() {
  const [currentType, setCurrentType] = useState<RocketType>('explorer');

  const rocketTypes = {
    explorer: { text: '🚀 Explorer', label: 'SPACE EXPLORER' },
    military: { text: '⚔️ Military', label: 'WAR ROCKET' },
    cargo: { text: '📦 Cargo', label: 'CARGO HAULER' },
    shuttle: { text: '🛸 Shuttle', label: 'STAR SHUTTLE' }
  };

  const changeRocketType = (type: RocketType) => {
    setCurrentType(type);
  };

  return (
    <SpaceBackGround>
      <div className="demo-info">
        <strong>Space Rocket Badge</strong><br />
        Clique para lançar o foguete
      </div>

      <SpaceInsignia 
        rocketType={currentType}
        showText={true}
        text={rocketTypes[currentType].label}
      />

      <div className="controls">
        {Object.entries(rocketTypes).map(([type, config]) => (
          <button
            key={type}
            className={`btn ${currentType === type ? 'active' : ''}`}
            onClick={() => changeRocketType(type as RocketType)}
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
          color: #ffa500;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
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
            rgba(255, 165, 0, 0.3) 0%, 
            rgba(255, 69, 0, 0.2) 100%);
          color: #ffa500;
          border: 1px solid rgba(255, 165, 0, 0.5);
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          margin: 0 6px;
          font-size: 14px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgba(255, 165, 0, 0.3);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 5px 20px rgba(255, 165, 0, 0.4),
            0 0 30px rgba(255, 69, 0, 0.3);
          background: linear-gradient(135deg, 
            rgba(255, 165, 0, 0.5) 0%, 
            rgba(255, 69, 0, 0.3) 100%);
        }

        .btn.active {
          background: linear-gradient(135deg, 
            rgba(255, 165, 0, 0.6) 0%, 
            rgba(255, 69, 0, 0.4) 100%);
          border-color: rgba(255, 165, 0, 0.7);
          color: #ffffff;
        }
      `}</style>
    </SpaceBackGround>
  );
}
