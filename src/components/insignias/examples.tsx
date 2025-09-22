// Exemplo de uso dos componentes Hydro

import { HydroBackGround, HydroInsignia } from '@/components/insignias';

// Uso básico
export function BasicHydroExample() {
  return (
    <HydroBackGround>
      <HydroInsignia />
    </HydroBackGround>
  );
}

// Uso com propriedades customizadas
export function CustomHydroExample() {
  return (
    <HydroBackGround className="custom-background">
      <HydroInsignia 
        waterType="tsunami"
        showText={true}
        text="CUSTOM TITLE"
      />
    </HydroBackGround>
  );
}

// Uso sem texto
export function HydroWithoutTextExample() {
  return (
    <HydroBackGround>
      <HydroInsignia 
        waterType="ice"
        showText={false}
      />
    </HydroBackGround>
  );
}

// Exemplo de uso dos componentes Discord

import { DiscordBackGround, DiscordInsignia } from '@/components/insignias';

// Uso básico Discord
export function BasicDiscordExample() {
  return (
    <DiscordBackGround>
      <DiscordInsignia />
    </DiscordBackGround>
  );
}

// Uso com propriedades customizadas Discord
export function CustomDiscordExample() {
  return (
    <DiscordBackGround className="custom-background">
      <DiscordInsignia 
        badgeType="partner"
        showText={true}
        text="CUSTOM BADGE"
        showTyping={true}
      />
    </DiscordBackGround>
  );
}

// Uso sem texto e typing Discord
export function DiscordMinimalExample() {
  return (
    <DiscordBackGround>
      <DiscordInsignia 
        badgeType="developer"
        showText={false}
        showTyping={false}
      />
    </DiscordBackGround>
  );
}

// Exemplo de uso dos componentes Space

import { SpaceBackGround, SpaceInsignia } from '@/components/insignias';

// Uso básico Space
export function BasicSpaceExample() {
  return (
    <SpaceBackGround>
      <SpaceInsignia />
    </SpaceBackGround>
  );
}

// Uso com propriedades customizadas Space
export function CustomSpaceExample() {
  return (
    <SpaceBackGround className="custom-background">
      <SpaceInsignia 
        rocketType="military"
        showText={true}
        text="CUSTOM ROCKET"
      />
    </SpaceBackGround>
  );
}

// Uso sem texto Space
export function SpaceMinimalExample() {
  return (
    <SpaceBackGround>
      <SpaceInsignia 
        rocketType="shuttle"
        showText={false}
      />
    </SpaceBackGround>
  );
}

// Exemplo de uso dos componentes Thunder

import { ThunderBackGround, ThunderInsignia } from '@/components/insignias';

// Uso básico Thunder
export function BasicThunderExample() {
  return (
    <ThunderBackGround>
      <ThunderInsignia />
    </ThunderBackGround>
  );
}

// Uso com propriedades customizadas Thunder
export function CustomThunderExample() {
  return (
    <ThunderBackGround className="custom-background">
      <ThunderInsignia 
        thunderType="storm"
        showText={true}
        text="CUSTOM THUNDER"
      />
    </ThunderBackGround>
  );
}

// Uso sem texto Thunder
export function ThunderMinimalExample() {
  return (
    <ThunderBackGround>
      <ThunderInsignia 
        thunderType="electric"
        showText={false}
      />
    </ThunderBackGround>
  );
}

// Exemplo de uso dos componentes Trophy

import { TrophyBackGround, TrophyInsignia } from '@/components/insignias';

// Uso básico Trophy
export function BasicTrophyExample() {
  return (
    <TrophyBackGround>
      <TrophyInsignia />
    </TrophyBackGround>
  );
}

// Uso com propriedades customizadas Trophy
export function CustomTrophyExample() {
  return (
    <TrophyBackGround className="custom-background">
      <TrophyInsignia 
        trophyType="epic"
        showText={true}
        text="CUSTOM TROPHY"
        level={50}
        xp={20000}
      />
    </TrophyBackGround>
  );
}

// Uso sem texto Trophy
export function TrophyMinimalExample() {
  return (
    <TrophyBackGround>
      <TrophyInsignia 
        trophyType="rare"
        showText={false}
      />
    </TrophyBackGround>
  );
}

// Exemplo de uso dos componentes Fire

import { FireBackGround, FireInsignia } from '@/components/insignias';

// Uso básico Fire
export function BasicFireExample() {
  return (
    <FireBackGround>
      <FireInsignia />
    </FireBackGround>
  );
}

// Uso com propriedades customizadas Fire
export function CustomFireExample() {
  return (
    <FireBackGround className="custom-background">
      <FireInsignia 
        fireType="hellfire"
        showText={true}
        text="CUSTOM FIRE"
      />
    </FireBackGround>
  );
}

// Uso sem texto Fire
export function FireMinimalExample() {
  return (
    <FireBackGround>
      <FireInsignia 
        fireType="blaze"
        showText={false}
      />
    </FireBackGround>
  );
}

// Exemplo de uso dos componentes NFT

import { NFTBackGround, NFTInsignia } from '@/components/insignias';

// Uso básico NFT
export function BasicNFTExample() {
  return (
    <NFTBackGround>
      <NFTInsignia />
    </NFTBackGround>
  );
}

// Uso com propriedades customizadas NFT
export function CustomNFTExample() {
  return (
    <NFTBackGround className="custom-background">
      <NFTInsignia 
        nftType="cyber"
        showText={true}
        text="CUSTOM NFT"
      />
    </NFTBackGround>
  );
}

// Uso sem texto NFT
export function NFTMinimalExample() {
  return (
    <NFTBackGround>
      <NFTInsignia 
        nftType="neural"
        showText={false}
      />
    </NFTBackGround>
  );
}

// Exemplos de diferentes tamanhos NFT
export function NFTSizeExamples() {
  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Tamanho pequeno */}
      <div>
        <h3>Small (200px)</h3>
        <NFTInsignia 
          nftType="tech"
          size="small"
          showText={true}
        />
      </div>
      
      {/* Tamanho médio */}
      <div>
        <h3>Medium (400px)</h3>
        <NFTInsignia 
          nftType="cyber"
          size="medium"
          showText={true}
        />
      </div>
      
      {/* Tamanho grande */}
      <div>
        <h3>Large (600px)</h3>
        <NFTInsignia 
          nftType="neural"
          size="large"
          showText={true}
        />
      </div>
      
      {/* Tamanho extra grande */}
      <div>
        <h3>XLarge (800px)</h3>
        <NFTInsignia 
          nftType="quantum"
          size="xlarge"
          showText={true}
        />
      </div>
      
      {/* Tamanho customizado */}
      <div>
        <h3>Custom (300px)</h3>
        <NFTInsignia 
          nftType="tech"
          size={300}
          showText={true}
        />
      </div>
    </div>
  );
}

// Exemplo de NFT com tamanho responsivo
export function NFTResponsiveExample() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px',
      padding: '20px'
    }}>
      <NFTInsignia 
        nftType="tech"
        size="small"
        showText={true}
      />
      <NFTInsignia 
        nftType="cyber"
        size="medium"
        showText={true}
      />
      <NFTInsignia 
        nftType="neural"
        size="large"
        showText={true}
      />
    </div>
  );
}

// Exemplo de uso dos componentes Medieval

import { MedievalBackGround, MedievalInsignia } from '@/components/insignias';

// Uso básico Medieval
export function BasicMedievalExample() {
  return (
    <MedievalBackGround>
      <MedievalInsignia />
    </MedievalBackGround>
  );
}

// Uso com propriedades customizadas Medieval
export function CustomMedievalExample() {
  return (
    <MedievalBackGround className="custom-background">
      <MedievalInsignia 
        medievalType="wizard"
        showText={true}
        text="CUSTOM MEDIEVAL"
      />
    </MedievalBackGround>
  );
}

// Uso sem texto Medieval
export function MedievalMinimalExample() {
  return (
    <MedievalBackGround>
      <MedievalInsignia 
        medievalType="paladin"
        showText={false}
      />
    </MedievalBackGround>
  );
}

// Exemplos de diferentes tamanhos Medieval
export function MedievalSizeExamples() {
  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Tamanho pequeno */}
      <div>
        <h3>Small (200px)</h3>
        <MedievalInsignia 
          medievalType="knight"
          size="small"
          showText={true}
        />
      </div>
      
      {/* Tamanho médio */}
      <div>
        <h3>Medium (400px)</h3>
        <MedievalInsignia 
          medievalType="wizard"
          size="medium"
          showText={true}
        />
      </div>
      
      {/* Tamanho grande */}
      <div>
        <h3>Large (600px)</h3>
        <MedievalInsignia 
          medievalType="archer"
          size="large"
          showText={true}
        />
      </div>
      
      {/* Tamanho extra grande */}
      <div>
        <h3>XLarge (800px)</h3>
        <MedievalInsignia 
          medievalType="paladin"
          size="xlarge"
          showText={true}
        />
      </div>
      
      {/* Tamanho customizado */}
      <div>
        <h3>Custom (300px)</h3>
        <MedievalInsignia 
          medievalType="knight"
          size={300}
          showText={true}
        />
      </div>
    </div>
  );
}

// Exemplo de Medieval com tamanho responsivo
export function MedievalResponsiveExample() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px',
      padding: '20px'
    }}>
      <MedievalInsignia 
        medievalType="knight"
        size="small"
        showText={true}
      />
      <MedievalInsignia 
        medievalType="wizard"
        size="medium"
        showText={true}
      />
      <MedievalInsignia 
        medievalType="archer"
        size="large"
        showText={true}
      />
    </div>
  );
}
