'use client';

import React, { useState } from 'react';
import FireBackGround from '@/components/insignias/FireBackGround';
import FireInsignia from '@/components/insignias/FireInsignia';

type FireType = 'inferno' | 'hellfire' | 'blaze' | 'ember';

export default function FireDemoPage() {
  const [currentType, setCurrentType] = useState<FireType>('inferno');

  const fireTypes = {
    inferno: { text: '🔥 Inferno', label: 'INFERNO MASTER' },
    hellfire: { text: '👹 Hellfire', label: 'HELLFIRE LORD' },
    blaze: { text: '⚡ Blaze', label: 'BLAZE WARRIOR' },
    ember: { text: '🪵 Ember', label: 'EMBER SAGE' }
  };

  const changeFireType = (type: FireType) => {
    setCurrentType(type);
  };

  return (
    <FireBackGround>
      <div className="demo-info">
        <strong>Fire Insignia</strong><br />
        Efeitos visuais avançados de fogo
      </div>

      <FireInsignia 
        fireType={currentType}
        showText={true}
        text={fireTypes[currentType].label}
      />

      <div className="controls">
        {Object.entries(fireTypes).map(([type, config]) => (
          <button
            key={type}
            className={`btn ${currentType === type ? 'active' : ''}`}
            onClick={() => changeFireType(type as FireType)}
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
          color: #ff4500;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 0 10px rgba(255, 69, 0, 0.5);
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #ff4500;
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
            rgba(255, 69, 0, 0.3) 0%, 
            rgba(255, 140, 0, 0.2) 100%);
          color: #ff4500;
          border: 1px solid rgba(255, 69, 0, 0.5);
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          margin: 0 6px;
          font-size: 14px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgba(255, 69, 0, 0.3);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 5px 20px rgba(255, 69, 0, 0.4),
            0 0 30px rgba(255, 140, 0, 0.3);
          background: linear-gradient(135deg, 
            rgba(255, 69, 0, 0.5) 0%, 
            rgba(255, 140, 0, 0.3) 100%);
        }

        .btn.active {
          background: linear-gradient(135deg, 
            rgba(255, 69, 0, 0.6) 0%, 
            rgba(255, 140, 0, 0.4) 100%);
          border-color: rgba(255, 69, 0, 0.7);
          color: #ffffff;
        }
      `}</style>
    </FireBackGround>
  );
}
