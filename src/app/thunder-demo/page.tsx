'use client';

import React, { useState } from 'react';
import ThunderBackGround from '@/components/insignias/ThunderBackGround';
import ThunderInsignia from '@/components/insignias/ThunderInsignia';

type ThunderType = 'lord' | 'storm' | 'lightning' | 'electric';

export default function ThunderDemoPage() {
  const [currentType, setCurrentType] = useState<ThunderType>('lord');

  const thunderTypes = {
    lord: { text: '⚡ Thunder', label: 'THUNDER LORD' },
    storm: { text: '🌩️ Storm', label: 'STORM MASTER' },
    lightning: { text: '⚡ Lightning', label: 'LIGHTNING SAGE' },
    electric: { text: '🔋 Electric', label: 'ELECTRIC KING' }
  };

  const changeThunderType = (type: ThunderType) => {
    setCurrentType(type);
  };

  return (
    <ThunderBackGround>
      <div className="demo-info">
        <strong>Thunder Strike Badge</strong><br />
        Clique para invocar o trovão
      </div>

      <ThunderInsignia 
        thunderType={currentType}
        showText={true}
        text={thunderTypes[currentType].label}
      />

      <div className="controls">
        {Object.entries(thunderTypes).map(([type, config]) => (
          <button
            key={type}
            className={`btn ${currentType === type ? 'active' : ''}`}
            onClick={() => changeThunderType(type as ThunderType)}
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
          color: #ffff00;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
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
            rgba(255, 255, 0, 0.3) 0%, 
            rgba(138, 43, 226, 0.2) 100%);
          color: #ffff00;
          border: 1px solid rgba(255, 255, 0, 0.5);
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          margin: 0 6px;
          font-size: 14px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgba(255, 255, 0, 0.3);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 5px 20px rgba(255, 255, 0, 0.4),
            0 0 30px rgba(138, 43, 226, 0.3);
          background: linear-gradient(135deg, 
            rgba(255, 255, 0, 0.5) 0%, 
            rgba(138, 43, 226, 0.3) 100%);
        }

        .btn.active {
          background: linear-gradient(135deg, 
            rgba(255, 255, 0, 0.6) 0%, 
            rgba(138, 43, 226, 0.4) 100%);
          border-color: rgba(255, 255, 0, 0.7);
          color: #ffffff;
        }
      `}</style>
    </ThunderBackGround>
  );
}
