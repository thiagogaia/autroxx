# MedievalInsignia Component - Documentação

## Visão Geral

O componente `MedievalInsignia` é uma insignia medieval com design de escudo heráldico, cristais mágicos e runas antigas. Possui efeitos visuais avançados com animações de rotação, pulsação e brilho dourado.

## Características

- ✅ **Escopo CSS Isolado**: Usa CSS Modules para evitar conflitos de estilo
- ✅ **Tamanhos Configuráveis**: Suporte a tamanhos predefinidos e customizados
- ✅ **4 Tipos Medievais**: Knight, Wizard, Archer e Paladin
- ✅ **Efeitos Interativos**: Hover, click e animações 3D
- ✅ **Responsivo**: Adapta-se a diferentes tamanhos de tela

## Props

```typescript
interface MedievalInsigniaProps {
  className?: string;                    // Classes CSS adicionais
  medievalType?: 'knight' | 'wizard' | 'archer' | 'paladin';  // Tipo medieval
  showText?: boolean;                    // Mostrar texto informativo
  text?: string;                         // Texto customizado
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;  // Tamanho da insignia
}
```

## Tamanhos Disponíveis

### Tamanhos Predefinidos

| Tamanho | Container | Shield | Crystal | Rune | Font |
|---------|-----------|--------|---------|------|------|
| `small` | 200px | 60px | 6px | 8px | 10px |
| `medium` | 400px | 120px | 12px | 16px | 18px |
| `large` | 600px | 180px | 18px | 24px | 24px |
| `xlarge` | 800px | 240px | 24px | 32px | 32px |

### Tamanho Customizado

Você pode passar um número para definir um tamanho customizado:

```tsx
<MedievalInsignia size={300} />  // Container de 300px
```

O componente calculará automaticamente os tamanhos dos elementos internos:
- Shield: 30% do tamanho do container
- Crystal: 3% do tamanho do container
- Rune: 4% do tamanho do container (mínimo 8px)
- Font: 4.5% do tamanho do container (mínimo 10px)

## Tipos Medievais

### Knight (Padrão)
- **Cor**: Dourado (#d4af37)
- **Tema**: Guerreiros digitais, Recompensa NFT, Edição Limitada
- **Texto**: "KNIGHT NERD BADGE"

### Wizard
- **Cor**: Roxo (#8B5CF6)
- **Tema**: Magos digitais, Recompensa NFT, Edição Limitada
- **Texto**: "WIZARD NERD BADGE"

### Archer
- **Cor**: Verde (#10B981)
- **Tema**: Arqueiros digitais, Recompensa NFT, Edição Limitada
- **Texto**: "ARCHER NERD BADGE"

### Paladin
- **Cor**: Laranja (#F59E0B)
- **Tema**: Paladinos digitais, Recompensa NFT, Edição Limitada
- **Texto**: "PALADIN NERD BADGE"

## Exemplos de Uso

### Uso Básico
```tsx
import { MedievalInsignia } from '@/components/insignias';

function MyComponent() {
  return <MedievalInsignia />;
}
```

### Com Tamanho Específico
```tsx
<MedievalInsignia 
  medievalType="wizard"
  size="large"
  showText={true}
/>
```

### Tamanho Customizado
```tsx
<MedievalInsignia 
  medievalType="archer"
  size={350}
  text="CUSTOM MEDIEVAL"
/>
```

### Sem Texto
```tsx
<MedievalInsignia 
  medievalType="paladin"
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
  <MedievalInsignia medievalType="knight" size="small" />
  <MedievalInsignia medievalType="wizard" size="medium" />
  <MedievalInsignia medievalType="archer" size="large" />
</div>
```

## Efeitos Visuais

### Animações
- **Rotação**: Anéis externos e médios giram em direções opostas
- **Pulsação**: Escudo central pulsa suavemente
- **Cristais**: Cristais mágicos piscam com efeito twinkle
- **Runas**: Runas antigas brilham com efeito glow
- **Brilho**: Efeito de brilho interativo no hover

### Interatividade
- **Hover**: Escala e efeito de brilho
- **Click**: Efeito de ativação com partículas douradas
- **Mouse Move**: Rotação 3D do escudo baseada na posição do mouse

### Elementos Visuais
- **Escudo Heráldico**: SVG detalhado com gradientes e sombras
- **Cristais Mágicos**: 4 cristais posicionados nos pontos cardeais
- **Runas Antigas**: 4 runas viking posicionadas nos cantos
- **Anéis Decorativos**: Anéis externos e médios com gradientes conic

## CSS Modules

O componente usa CSS Modules para isolamento de escopo:

```css
/* Arquivo: medieval-insignia.module.css */
.nftContainer {
  width: var(--medieval-container-size, 400px);
  height: var(--medieval-container-size, 400px);
  /* ... */
}
```

### Variáveis CSS Customizadas

O componente define automaticamente as seguintes variáveis CSS:

- `--medieval-primary`: Cor primária do tipo selecionado
- `--medieval-secondary`: Cor secundária (30% opacidade)
- `--medieval-accent`: Cor de destaque (10% opacidade)
- `--medieval-glow`: Cor do brilho (50% opacidade)
- `--medieval-container-size`: Tamanho do container
- `--medieval-shield-size`: Tamanho do escudo
- `--medieval-crystal-size`: Tamanho dos cristais
- `--medieval-rune-size`: Tamanho das runas
- `--medieval-font-size`: Tamanho da fonte

## SVG Detalhado

O escudo é renderizado como SVG com elementos detalhados:

- **Gradientes**: Múltiplos gradientes para profundidade visual
- **Sombras**: Filtros SVG para sombras internas e externas
- **Espada Central**: Espada heráldica com guarda, cabo e pomo
- **Elementos Decorativos**: Gemas, curvas e divisões heráldicas

## Performance

- ✅ **CSS Modules**: Evita conflitos de estilo
- ✅ **Variáveis CSS**: Atualização eficiente de propriedades
- ✅ **Animações CSS**: Hardware-accelerated
- ✅ **SVG Otimizado**: Elementos vetoriais escaláveis

## Acessibilidade

- ✅ **Semântica**: Estrutura HTML adequada
- ✅ **Contraste**: Cores com bom contraste
- ✅ **Foco**: Estados de foco visíveis
- ✅ **ARIA**: Atributos de acessibilidade quando necessário

## Compatibilidade

- ✅ **React 18+**: Compatível com versões modernas
- ✅ **TypeScript**: Tipagem completa
- ✅ **CSS Modules**: Suporte nativo
- ✅ **SVG**: Suporte universal
- ✅ **Responsivo**: Funciona em todos os dispositivos

## Troubleshooting

### Problemas Comuns

1. **Estilos não aplicados**: Verifique se o CSS Modules está configurado
2. **Tamanho não muda**: Confirme se a prop `size` está sendo passada
3. **SVG não renderiza**: Verifique se o navegador suporta SVG
4. **Animações lentas**: Verifique se há conflitos de CSS

### Debug

Para debugar o componente, você pode inspecionar as variáveis CSS:

```javascript
// No console do navegador
const element = document.querySelector('.nft-container');
console.log(getComputedStyle(element).getPropertyValue('--medieval-container-size'));
```

## Changelog

### v2.0.0
- ✅ Adicionado suporte a tamanhos configuráveis
- ✅ Migrado para CSS Modules
- ✅ Melhorada a responsividade
- ✅ Adicionadas variáveis CSS customizadas
- ✅ Otimizado SVG com gradientes avançados

### v1.0.0
- ✅ Versão inicial com efeitos básicos
- ✅ 4 tipos medievais
- ✅ Animações e interatividade
- ✅ Escudo SVG detalhado
