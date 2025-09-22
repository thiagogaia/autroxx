# NFTInsignia Component - Documentação

## Visão Geral

O componente `NFTInsignia` é uma insignia futurística com efeitos visuais avançados que simula um NFT digital com animações de rede neural, partículas de dados e efeitos holográficos.

## Características

- ✅ **Escopo CSS Isolado**: Usa CSS Modules para evitar conflitos de estilo
- ✅ **Tamanhos Configuráveis**: Suporte a tamanhos predefinidos e customizados
- ✅ **4 Tipos de NFT**: Tech, Cyber, Neural e Quantum
- ✅ **Efeitos Interativos**: Hover, click e animações 3D
- ✅ **Responsivo**: Adapta-se a diferentes tamanhos de tela

## Props

```typescript
interface NFTInsigniaProps {
  className?: string;                    // Classes CSS adicionais
  nftType?: 'tech' | 'cyber' | 'neural' | 'quantum';  // Tipo do NFT
  showText?: boolean;                    // Mostrar texto informativo
  text?: string;                         // Texto customizado
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;  // Tamanho da insignia
}
```

## Tamanhos Disponíveis

### Tamanhos Predefinidos

| Tamanho | Container | Logo | Node | Font |
|---------|-----------|------|------|------|
| `small` | 200px | 100px | 5px | 8px |
| `medium` | 400px | 200px | 10px | 12px |
| `large` | 600px | 300px | 15px | 16px |
| `xlarge` | 800px | 400px | 20px | 20px |

### Tamanho Customizado

Você pode passar um número para definir um tamanho customizado:

```tsx
<NFTInsignia size={300} />  // Container de 300px
```

O componente calculará automaticamente os tamanhos dos elementos internos:
- Logo: 50% do tamanho do container
- Node: 2.5% do tamanho do container
- Font: 3% do tamanho do container (mínimo 8px)

## Tipos de NFT

### Tech (Padrão)
- **Cor**: Ciano (#00ffff)
- **Tema**: Web3, AI, Sci-Fi, Digital Collectible
- **Texto**: "TECH NERD REWARD"

### Cyber
- **Cor**: Verde (#00ff00)
- **Tema**: Blockchain, Crypto, Digital Asset
- **Texto**: "CYBER WARRIOR"

### Neural
- **Cor**: Magenta (#ff00ff)
- **Tema**: AI, Machine Learning, Neural Network
- **Texto**: "NEURAL MASTER"

### Quantum
- **Cor**: Amarelo (#ffff00)
- **Tema**: Quantum, Physics, Future Tech
- **Texto**: "QUANTUM SAGE"

## Exemplos de Uso

### Uso Básico
```tsx
import { NFTInsignia } from '@/components/insignias';

function MyComponent() {
  return <NFTInsignia />;
}
```

### Com Tamanho Específico
```tsx
<NFTInsignia 
  nftType="cyber"
  size="large"
  showText={true}
/>
```

### Tamanho Customizado
```tsx
<NFTInsignia 
  nftType="neural"
  size={350}
  text="CUSTOM NFT"
/>
```

### Sem Texto
```tsx
<NFTInsignia 
  nftType="quantum"
  showText={false}
/>
```

### Grid Responsivo
```tsx
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
  gap: '20px' 
}}>
  <NFTInsignia nftType="tech" size="small" />
  <NFTInsignia nftType="cyber" size="medium" />
  <NFTInsignia nftType="neural" size="large" />
</div>
```

## Efeitos Visuais

### Animações
- **Rotação**: Logo central gira continuamente
- **Pulso**: Efeito de pulsação nos nós da rede neural
- **Partículas**: Partículas flutuantes com movimento orgânico
- **Streams**: Fluxos de dados animados
- **Holograma**: Efeito de varredura holográfica

### Interatividade
- **Hover**: Escala e rotação 3D
- **Click**: Efeito de "mint" com rotação completa
- **Mouse Move**: Rotação 3D baseada na posição do mouse

## CSS Modules

O componente usa CSS Modules para isolamento de escopo:

```css
/* Arquivo: nft-insignia.module.css */
.nftContainer {
  width: var(--nft-container-size, 400px);
  height: var(--nft-container-size, 400px);
  /* ... */
}
```

### Variáveis CSS Customizadas

O componente define automaticamente as seguintes variáveis CSS:

- `--nft-primary`: Cor primária do tipo selecionado
- `--nft-secondary`: Cor secundária (30% opacidade)
- `--nft-accent`: Cor de destaque (10% opacidade)
- `--nft-glow`: Cor do brilho (50% opacidade)
- `--nft-container-size`: Tamanho do container
- `--nft-logo-size`: Tamanho do logo central
- `--nft-node-size`: Tamanho dos nós da rede neural
- `--nft-font-size`: Tamanho da fonte

## Performance

- ✅ **CSS Modules**: Evita conflitos de estilo
- ✅ **Variáveis CSS**: Atualização eficiente de propriedades
- ✅ **Animações CSS**: Hardware-accelerated
- ✅ **Lazy Loading**: Carregamento otimizado

## Acessibilidade

- ✅ **Semântica**: Estrutura HTML adequada
- ✅ **Contraste**: Cores com bom contraste
- ✅ **Foco**: Estados de foco visíveis
- ✅ **ARIA**: Atributos de acessibilidade quando necessário

## Compatibilidade

- ✅ **React 18+**: Compatível com versões modernas
- ✅ **TypeScript**: Tipagem completa
- ✅ **CSS Modules**: Suporte nativo
- ✅ **Responsivo**: Funciona em todos os dispositivos

## Troubleshooting

### Problemas Comuns

1. **Estilos não aplicados**: Verifique se o CSS Modules está configurado
2. **Tamanho não muda**: Confirme se a prop `size` está sendo passada
3. **Animações lentas**: Verifique se há conflitos de CSS

### Debug

Para debugar o componente, você pode inspecionar as variáveis CSS:

```javascript
// No console do navegador
const element = document.querySelector('.nft-container');
console.log(getComputedStyle(element).getPropertyValue('--nft-container-size'));
```

## Changelog

### v2.0.0
- ✅ Adicionado suporte a tamanhos configuráveis
- ✅ Migrado para CSS Modules
- ✅ Melhorada a responsividade
- ✅ Adicionadas variáveis CSS customizadas

### v1.0.0
- ✅ Versão inicial com efeitos básicos
- ✅ 4 tipos de NFT
- ✅ Animações e interatividade
