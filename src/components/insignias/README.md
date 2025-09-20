# Componentes de Insígnias - Sistema Aquático, Discord, Espacial, Elétrico, Troféu, Fogo, NFT e Medieval

Este diretório contém componentes React/NextJS para criar insígnias interativas com efeitos visuais avançados, incluindo temas aquáticos, Discord, espacial, elétrico, troféu, fogo, NFT e medieval.

## Componentes Aquáticos (Hydro)

### HydroBackGround
Componente de fundo que cria um ambiente oceânico com ondas animadas.

**Props:**
- `children`: Conteúdo a ser renderizado dentro do fundo
- `className`: Classe CSS adicional (opcional)

**Uso:**
```tsx
<HydroBackGround>
  <HydroInsignia />
</HydroBackGround>
```

### HydroInsignia
Componente principal da insígnia com efeitos aquáticos interativos.

**Props:**
- `className`: Classe CSS adicional (opcional)
- `waterType`: Tipo de água - 'hydro' | 'tsunami' | 'ice' | 'storm' (padrão: 'hydro')
- `showText`: Mostrar texto da insígnia (padrão: true)
- `text`: Texto customizado (opcional)

**Uso:**
```tsx
<HydroInsignia 
  waterType="tsunami"
  showText={true}
  text="CUSTOM TITLE"
/>
```

## Componentes Discord

### DiscordBackGround
Componente de fundo que cria um ambiente estilo Discord com padrão de bolinhas.

**Props:**
- `children`: Conteúdo a ser renderizado dentro do fundo
- `className`: Classe CSS adicional (opcional)

**Uso:**
```tsx
<DiscordBackGround>
  <DiscordInsignia />
</DiscordBackGround>
```

### DiscordInsignia
Componente principal da insígnia com efeitos Discord interativos.

**Props:**
- `className`: Classe CSS adicional (opcional)
- `badgeType`: Tipo de badge - 'nitro' | 'partner' | 'moderator' | 'developer' (padrão: 'nitro')
- `showText`: Mostrar texto da insígnia (padrão: true)
- `text`: Texto customizado (opcional)
- `showTyping`: Mostrar indicador de digitação (padrão: true)

**Uso:**
```tsx
<DiscordInsignia 
  badgeType="partner"
  showText={true}
  text="CUSTOM BADGE"
  showTyping={true}
/>
```

## Componentes Espaciais (Space)

### SpaceBackGround
Componente de fundo que cria um ambiente espacial com campo de estrelas animado.

**Props:**
- `children`: Conteúdo a ser renderizado dentro do fundo
- `className`: Classe CSS adicional (opcional)

**Uso:**
```tsx
<SpaceBackGround>
  <SpaceInsignia />
</SpaceBackGround>
```

### SpaceInsignia
Componente principal da insígnia com efeitos de foguete espacial interativos.

**Props:**
- `className`: Classe CSS adicional (opcional)
- `rocketType`: Tipo de foguete - 'explorer' | 'military' | 'cargo' | 'shuttle' (padrão: 'explorer')
- `showText`: Mostrar texto da insígnia (padrão: true)
- `text`: Texto customizado (opcional)

**Uso:**
```tsx
<SpaceInsignia 
  rocketType="military"
  showText={true}
  text="CUSTOM ROCKET"
/>
```

## Componentes Elétricos (Thunder)

### ThunderBackGround
Componente de fundo que cria um ambiente de tempestade com nuvens e relâmpagos.

**Props:**
- `children`: Conteúdo a ser renderizado dentro do fundo
- `className`: Classe CSS adicional (opcional)

**Uso:**
```tsx
<ThunderBackGround>
  <ThunderInsignia />
</ThunderBackGround>
```

### ThunderInsignia
Componente principal da insígnia com efeitos de raio elétrico interativos.

**Props:**
- `className`: Classe CSS adicional (opcional)
- `thunderType`: Tipo de trovão - 'lord' | 'storm' | 'lightning' | 'electric' (padrão: 'lord')
- `showText`: Mostrar texto da insígnia (padrão: true)
- `text`: Texto customizado (opcional)

**Uso:**
```tsx
<ThunderInsignia 
  thunderType="storm"
  showText={true}
  text="CUSTOM THUNDER"
/>
```

## Componentes de Troféu (Trophy)

### TrophyBackGround
Componente de fundo que cria um ambiente de gradiente épico.

**Props:**
- `children`: Conteúdo a ser renderizado dentro do fundo
- `className`: Classe CSS adicional (opcional)

**Uso:**
```tsx
<TrophyBackGround>
  <TrophyInsignia />
</TrophyBackGround>
```

### TrophyInsignia
Componente principal da insígnia com efeitos de troféu épico e sistema de gamificação.

**Props:**
- `className`: Classe CSS adicional (opcional)
- `trophyType`: Tipo de troféu - 'legendary' | 'epic' | 'rare' | 'common' (padrão: 'legendary')
- `showText`: Mostrar texto da insígnia (padrão: true)
- `text`: Texto customizado (opcional)
- `level`: Nível do jogador (padrão: 42)
- `xp`: Experiência atual (padrão: 13337)

**Uso:**
```tsx
<TrophyInsignia 
  trophyType="epic"
  showText={true}
  text="CUSTOM TROPHY"
  level={50}
  xp={20000}
/>
```

## Componentes de Fogo (Fire)

### FireBackGround
Componente de fundo que cria um ambiente escuro com gradiente radial.

**Props:**
- `children`: Conteúdo a ser renderizado dentro do fundo
- `className`: Classe CSS adicional (opcional)

**Uso:**
```tsx
<FireBackGround>
  <FireInsignia />
</FireBackGround>
```

### FireInsignia
Componente principal da insígnia com efeitos de fogo realistas e animações avançadas.

**Props:**
- `className`: Classe CSS adicional (opcional)
- `fireType`: Tipo de fogo - 'inferno' | 'hellfire' | 'blaze' | 'ember' (padrão: 'inferno')
- `showText`: Mostrar texto da insígnia (padrão: true)
- `text`: Texto customizado (opcional)

**Uso:**
```tsx
<FireInsignia 
  fireType="hellfire"
  showText={true}
  text="CUSTOM FIRE"
/>
```

## Componentes NFT (NFT)

### NFTBackGround
Componente de fundo que cria um ambiente futurista com gradiente radial.

**Props:**
- `children`: Conteúdo a ser renderizado dentro do fundo
- `className`: Classe CSS adicional (opcional)

**Uso:**
```tsx
<NFTBackGround>
  <NFTInsignia />
</NFTBackGround>
```

### NFTInsignia
Componente principal da insígnia NFT com efeitos técnicos e interatividade 3D.

**Props:**
- `className`: Classe CSS adicional (opcional)
- `nftType`: Tipo de NFT - 'tech' | 'cyber' | 'neural' | 'quantum' (padrão: 'tech')
- `showText`: Mostrar texto da insígnia (padrão: true)
- `text`: Texto customizado (opcional)

**Uso:**
```tsx
<NFTInsignia 
  nftType="cyber"
  showText={true}
  text="CUSTOM NFT"
/>
```

## Componentes Medieval (Medieval)

### MedievalBackGround
Componente de fundo que cria um ambiente medieval com gradiente escuro.

**Props:**
- `children`: Conteúdo a ser renderizado dentro do fundo
- `className`: Classe CSS adicional (opcional)

**Uso:**
```tsx
<MedievalBackGround>
  <MedievalInsignia />
</MedievalBackGround>
```

### MedievalInsignia
Componente principal da insígnia medieval com escudo, espada e efeitos heráldicos.

**Props:**
- `className`: Classe CSS adicional (opcional)
- `medievalType`: Tipo de medieval - 'knight' | 'wizard' | 'archer' | 'paladin' (padrão: 'knight')
- `showText`: Mostrar texto da insígnia (padrão: true)
- `text`: Texto customizado (opcional)

**Uso:**
```tsx
<MedievalInsignia 
  medievalType="wizard"
  showText={true}
  text="CUSTOM MEDIEVAL"
/>
```

## Tipos de Água (Hydro)

- **hydro**: Azul clássico - "HYDRO MASTER"
- **tsunami**: Azul escuro - "TSUNAMI LORD"  
- **ice**: Azul gelo - "FROST SAGE"
- **storm**: Azul tempestade - "STORM BRINGER"

## Tipos de Badge (Discord)

- **nitro**: Azul Discord - "ELITE GUARDIAN"
- **partner**: Verde - "COSMIC SHIELD"
- **moderator**: Vermelho - "MASTER PROTECTOR"
- **developer**: Laranja - "LEGEND BEARER"

## Tipos de Foguete (Space)

- **explorer**: Laranja - "SPACE EXPLORER" 🚀
- **military**: Vermelho - "WAR ROCKET" ⚔️
- **cargo**: Azul - "CARGO HAULER" 📦
- **shuttle**: Roxo - "STAR SHUTTLE" 🛸

## Tipos de Trovão (Thunder)

- **lord**: Amarelo/Roxo - "THUNDER LORD" ⚡
- **storm**: Azul - "STORM MASTER" 🌩️
- **lightning**: Rosa/Roxo - "LIGHTNING SAGE" ⚡
- **electric**: Ciano - "ELECTRIC KING" 🔋

## Tipos de Troféu (Trophy)

- **legendary**: Dourado/Ciano - "LEGENDARY TROPHY" 🏆
- **epic**: Roxo/Ciano - "EPIC TROPHY" 💜
- **rare**: Azul/Ciano - "RARE TROPHY" 💙
- **common**: Prata/Ciano - "COMMON TROPHY" ⚪

## Tipos de Fogo (Fire)

- **inferno**: Laranja/Vermelho - "INFERNO MASTER" 🔥
- **hellfire**: Vermelho/Branco - "HELLFIRE LORD" 👹
- **blaze**: Amarelo/Laranja - "BLAZE WARRIOR" ⚡
- **ember**: Marrom/Laranja - "EMBER SAGE" 🪵

## Tipos de NFT (NFT)

- **tech**: Ciano - "TECH NERD REWARD" 🔧
- **cyber**: Verde - "CYBER WARRIOR" 🤖
- **neural**: Magenta - "NEURAL MASTER" 🧠
- **quantum**: Amarelo - "QUANTUM SAGE" ⚛️

## Tipos de Medieval (Medieval)

- **knight**: Dourado - "KNIGHT NERD BADGE" ⚔️
- **wizard**: Roxo - "WIZARD NERD BADGE" 🧙
- **archer**: Verde - "ARCHER NERD BADGE" 🏹
- **paladin**: Laranja - "PALADIN NERD BADGE" 🛡️

## Funcionalidades

### Hydro
- ✅ Animações aquáticas fluidas
- ✅ Efeitos de clique com ondas de choque
- ✅ Gotas de água flutuantes
- ✅ Partículas de vapor
- ✅ Reflexos de luz na água
- ✅ Ondas internas animadas
- ✅ SVG animado com gradientes
- ✅ Interação com mouse
- ✅ Efeitos automáticos
- ✅ Responsivo

### Discord
- ✅ Design autêntico do Discord
- ✅ Partículas de status (online, idle, dnd, offline)
- ✅ Notificações animadas
- ✅ Indicador de boost
- ✅ Efeito de digitação
- ✅ Anel orbital rotativo
- ✅ SVG de escudo com gema central
- ✅ Gradientes dinâmicos por tipo
- ✅ Efeitos de hover e clique
- ✅ Responsivo

### Space
- ✅ Campo de estrelas animado
- ✅ Foguete SVG complexo com chamas animadas
- ✅ Partículas de combustível
- ✅ Trilha de vapor
- ✅ Planetas flutuantes
- ✅ Anel orbital rotativo
- ✅ Efeitos de lançamento
- ✅ Ondas de propulsão
- ✅ Movimento orbital do foguete
- ✅ Gradientes dinâmicos por tipo
- ✅ Responsivo

### Thunder
- ✅ Nuvens de tempestade animadas
- ✅ Flashes de relâmpago de fundo
- ✅ Raio SVG complexo com ramificações
- ✅ Faíscas elétricas
- ✅ Ondas de choque elétricas
- ✅ Anel elétrico rotativo
- ✅ Efeitos de trovão no clique
- ✅ Campo elétrico ao redor
- ✅ Pontos de energia elétrica
- ✅ Gradientes dinâmicos por tipo
- ✅ Responsivo

### Trophy
- ✅ Gradiente épico de fundo
- ✅ Troféu SVG com animações 3D
- ✅ Sistema de gamificação (Level/XP)
- ✅ Painel de estatísticas no hover
- ✅ Barra de XP animada
- ✅ Sparkles e partículas Matrix
- ✅ Chuva binária de fundo
- ✅ Console de texto com efeito typing
- ✅ Efeitos de som simulados
- ✅ Level up animations
- ✅ Atalhos de teclado (SPACE, ENTER, Ctrl+K)
- ✅ Easter egg Konami Code
- ✅ Padrões hexagonais tech
- ✅ Circuitos elétricos
- ✅ Gradientes dinâmicos por tipo
- ✅ Responsivo

### Fire
- ✅ Fundo escuro com gradiente radial
- ✅ Aura de calor externa com pulso
- ✅ Chama externa com dança realista
- ✅ Chama média com tremulação
- ✅ Núcleo interno com intensidade variável
- ✅ Núcleo super quente incandescente
- ✅ Brasas flutuantes dinâmicas
- ✅ Pontos de calor com cintilação
- ✅ Badge base com bordas brilhantes
- ✅ Efeito de cintilação das bordas
- ✅ Gradientes dinâmicos por tipo
- ✅ Animações complexas de fogo
- ✅ Responsivo

### NFT
- ✅ Fundo futurista com gradiente radial
- ✅ Container NFT com bordas ciano
- ✅ Grid de fundo animado
- ✅ Logo central com rotação e pulso
- ✅ Rede neural com nós e conexões
- ✅ Elementos de canto decorativos
- ✅ Partículas de dados flutuantes
- ✅ Efeito holográfico de varredura
- ✅ Elementos blockchain animados
- ✅ Texto técnico com brilho
- ✅ Efeito de mint no clique
- ✅ Interatividade 3D com mouse
- ✅ Gradientes dinâmicos por tipo
- ✅ Responsivo

### Medieval
- ✅ Fundo medieval com gradiente escuro
- ✅ Anéis concêntricos rotativos
- ✅ Escudo heráldico com espada central
- ✅ Cristais mágicos cintilantes
- ✅ Runas nórdicas com brilho
- ✅ Badge Web3 animado
- ✅ Efeito de ativação com partículas
- ✅ Interatividade 3D com mouse
- ✅ Gradientes dinâmicos por tipo
- ✅ Efeitos de hover aprimorados
- ✅ Responsivo

## Demonstrações

- **Hydro**: Acesse `/hydro-demo` para ver uma demonstração completa dos componentes aquáticos
- **Discord**: Acesse `/discord-demo` para ver uma demonstração completa dos componentes Discord
- **Space**: Acesse `/space-demo` para ver uma demonstração completa dos componentes espaciais
- **Thunder**: Acesse `/thunder-demo` para ver uma demonstração completa dos componentes elétricos
- **Trophy**: Acesse `/trophy-demo` para ver uma demonstração completa dos componentes de troféu
- **Fire**: Acesse `/fire-demo` para ver uma demonstração completa dos componentes de fogo
- **NFT**: Acesse `/nft-demo` para ver uma demonstração completa dos componentes NFT
- **Medieval**: Acesse `/medieval-demo` para ver uma demonstração completa dos componentes medievais

## Arquivos

### Hydro
- `HydroBackGround.tsx` - Componente de fundo aquático
- `HydroInsignia.tsx` - Componente da insígnia aquática
- `hydro-background.css` - Estilos do fundo aquático
- `hydro-insignia.css` - Estilos da insígnia aquática

### Discord
- `DiscordBackGround.tsx` - Componente de fundo Discord
- `DiscordInsignia.tsx` - Componente da insígnia Discord
- `discord-background.css` - Estilos do fundo Discord
- `discord-insignia.css` - Estilos da insígnia Discord

### Space
- `SpaceBackGround.tsx` - Componente de fundo espacial
- `SpaceInsignia.tsx` - Componente da insígnia espacial
- `space-background.css` - Estilos do fundo espacial
- `space-insignia.css` - Estilos da insígnia espacial

### Thunder
- `ThunderBackGround.tsx` - Componente de fundo elétrico
- `ThunderInsignia.tsx` - Componente da insígnia elétrica
- `thunder-background.css` - Estilos do fundo elétrico
- `thunder-insignia.css` - Estilos da insígnia elétrica

### Trophy
- `TrophyBackGround.tsx` - Componente de fundo épico
- `TrophyInsignia.tsx` - Componente da insígnia de troféu
- `trophy-background.css` - Estilos do fundo épico
- `trophy-insignia.css` - Estilos da insígnia de troféu

### Fire
- `FireBackGround.tsx` - Componente de fundo escuro
- `FireInsignia.tsx` - Componente da insígnia de fogo
- `fire-background.css` - Estilos do fundo escuro
- `fire-insignia.css` - Estilos da insígnia de fogo

### NFT
- `NFTBackGround.tsx` - Componente de fundo futurista
- `NFTInsignia.tsx` - Componente da insígnia NFT
- `nft-background.css` - Estilos do fundo futurista
- `nft-insignia.css` - Estilos da insígnia NFT

### Medieval
- `MedievalBackGround.tsx` - Componente de fundo medieval
- `MedievalInsignia.tsx` - Componente da insígnia medieval
- `medieval-background.css` - Estilos do fundo medieval
- `medieval-insignia.css` - Estilos da insígnia medieval

### Gerais
- `index.ts` - Exportações
- `examples.tsx` - Exemplos de uso
