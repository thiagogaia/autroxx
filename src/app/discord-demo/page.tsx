'use client';

import React, { useState } from 'react';
import DiscordBackGround from '@/components/insignias/DiscordBackGround';
import DiscordInsignia from '@/components/insignias/DiscordInsignia';

type BadgeType = 'nitro' | 'partner' | 'moderator' | 'developer';

export default function DiscordDemoPage() {
  const [currentType, setCurrentType] = useState<BadgeType>('nitro');

  const badgeTypes = {
    nitro: { text: '⭐ Elite', label: 'ELITE GUARDIAN' },
    partner: { text: '◊ Cosmic', label: 'COSMIC SHIELD' },
    moderator: { text: '♦ Master', label: 'MASTER PROTECTOR' },
    developer: { text: '※ Legend', label: 'LEGEND BEARER' }
  };

  const changeBadge = (type: BadgeType) => {
    setCurrentType(type);
  };

  return (
    <DiscordBackGround>
      <div className="demo-info">
        <strong>Discord Official Badge</strong><br />
        Clique para interagir • Hover para efeitos
      </div>

      <DiscordInsignia 
        badgeType={currentType}
        showText={true}
        text={badgeTypes[currentType].label}
        showTyping={true}
      />

      <div className="controls">
        {Object.entries(badgeTypes).map(([type, config]) => (
          <button
            key={type}
            className={`btn ${currentType === type ? 'active' : ''}`}
            onClick={() => changeBadge(type as BadgeType)}
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
          color: #b9bbbe;
          font-size: 14px;
          font-weight: 500;
        }

        .controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
        }

        .btn {
          background: #4f545c;
          color: #ffffff;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin: 0 4px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn:hover {
          background: #5865f2;
          transform: translateY(-1px);
        }

        .btn.active {
          background: #5865f2;
        }
      `}</style>
    </DiscordBackGround>
  );
}
