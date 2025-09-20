'use client';

import React, { useState } from 'react';
import NFTBackGround from '@/components/insignias/NFTBackGround';
import NFTInsignia from '@/components/insignias/NFTInsignia';

type NFTType = 'tech' | 'cyber' | 'neural' | 'quantum';

export default function NFTDemoPage() {
  const [currentType, setCurrentType] = useState<NFTType>('tech');

  const nftTypes = {
    tech: { text: '🔧 Tech', label: 'TECH NERD REWARD', subtitle: 'Web3 • AI • Sci-Fi • Digital Collectible' },
    cyber: { text: '🤖 Cyber', label: 'CYBER WARRIOR', subtitle: 'Blockchain • Crypto • Digital Asset' },
    neural: { text: '🧠 Neural', label: 'NEURAL MASTER', subtitle: 'AI • Machine Learning • Neural Network' },
    quantum: { text: '⚛️ Quantum', label: 'QUANTUM SAGE', subtitle: 'Quantum • Physics • Future Tech' }
  };

  const changeNFTType = (type: NFTType) => {
    setCurrentType(type);
  };

  return (
    <NFTBackGround>
      <div className="demo-info">
        <strong>NFT Técnico-Digital Futurista</strong><br />
        Clique para efeito de mint! Movimente o mouse para 3D
      </div>

      <NFTInsignia 
        nftType={currentType}
        showText={true}
        text={nftTypes[currentType].label}
      />

      <div className="controls">
        {Object.entries(nftTypes).map(([type, config]) => (
          <button
            key={type}
            className={`btn ${currentType === type ? 'active' : ''}`}
            onClick={() => changeNFTType(type as NFTType)}
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
          color: #00ffff;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #00ffff;
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
            rgba(0, 255, 255, 0.3) 0%, 
            rgba(0, 255, 255, 0.2) 100%);
          color: #00ffff;
          border: 1px solid rgba(0, 255, 255, 0.5);
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          margin: 0 6px;
          font-size: 14px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 5px 20px rgba(0, 255, 255, 0.4),
            0 0 30px rgba(0, 255, 255, 0.3);
          background: linear-gradient(135deg, 
            rgba(0, 255, 255, 0.5) 0%, 
            rgba(0, 255, 255, 0.3) 100%);
        }

        .btn.active {
          background: linear-gradient(135deg, 
            rgba(0, 255, 255, 0.6) 0%, 
            rgba(0, 255, 255, 0.4) 100%);
          border-color: rgba(0, 255, 255, 0.7);
          color: #ffffff;
        }
      `}</style>
    </NFTBackGround>
  );
}
