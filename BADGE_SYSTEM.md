# Sistema de Insígnias - BadgeCard

## Visão Geral

O Sistema de Insígnias é um componente React avançado que cria cartões de premiação com aparência de céu noturno estrelado e efeitos interativos sofisticados. Baseado no exemplo fornecido, o sistema oferece uma experiência visual imersiva para recompensar usuários por suas conquistas.

## Características Principais

### 🎨 Design Visual
- **Céu Noturno Estrelado**: Fundo com gradiente radial simulando o espaço sideral
- **Estrelas Animadas**: Partículas que piscam e se movem de forma realista
- **Nebulosa de Fundo**: Efeitos de nebulosa com cores dinâmicas
- **Aurora Boreal**: Ondas de luz que atravessam o fundo
- **Constelações**: Padrões geométricos que conectam as estrelas

### ⚡ Interatividade
- **Hover Effects**: Escala suave, rotação e intensificação de brilho
- **Click Animations**: Pulso dinâmico com explosão de partículas
- **Mouse Trail**: Trilha luminosa que segue o cursor
- **Sparkles**: Partículas que flutuam aleatoriamente e no clique

### 💎 Tipos de Insígnias
- **Elite**: Cristal transparente clássico
- **Royal**: Dourado luxuoso
- **Mystic**: Roxo mágico
- **Cosmic**: Verde-azul etéreo
- **Legendary**: Laranja-vermelho épico
- **Discord**: Design circular estilo Discord com escudo animado

## Estrutura do Projeto

```
src/
├── components/
│   └── BadgeCard.tsx          # Componente principal
├── contexts/
│   └── BadgeContext.tsx       # Contexto de gerenciamento
├── types/
│   └── badge.ts              # Definições de tipos
├── app/
│   ├── badge-card.css        # Estilos e animações
│   └── badge-demo/
│       └── page.tsx          # Página de demonstração
```

## Componentes

### BadgeCard

Componente principal que renderiza a insígnia com todos os efeitos visuais.

```tsx
<BadgeCard
  type="elite"
  title="Diamond Elite"
  description="Elite Cristalino"
  isUnlocked={true}
  showAnimation={true}
  onClick={() => console.log('Badge clicado!')}
/>
```

#### Props
- `type`: Tipo da insígnia (elite, royal, mystic, cosmic, legendary, discord)
- `title`: Título da insígnia
- `description`: Descrição da insígnia
- `isUnlocked`: Se a insígnia está desbloqueada
- `showAnimation`: Se deve mostrar animações automáticas
- `onClick`: Callback para clique na insígnia

### Badge Discord Especial

O tipo `discord` possui um design único baseado no estilo visual do Discord:

```tsx
<BadgeCard
  type="discord"
  title="Elite Guardian"
  description="Guardião Elite do Discord"
  isUnlocked={true}
  showAnimation={true}
  onClick={() => console.log('Discord badge clicado!')}
/>
```

#### Características Especiais do Discord Badge:
- **Design Circular**: Formato circular com gradiente azul Discord
- **Escudo Animado**: SVG do escudo com gema central rotativa
- **Indicador de Boost**: Ícone de boost no canto superior esquerdo
- **Notificação**: Badge de notificação no canto superior direito
- **Anel Orbital**: Anel rotativo ao redor do badge
- **Indicador de Digitação**: Aparece no hover com animação de pontos
- **Efeito de Onda**: Ondas concêntricas no clique

### BadgeContext

Contexto React para gerenciar o estado global das insígnias.

```tsx
const { badgeCollection, notifications, stats } = useBadge();
```

#### Funcionalidades
- Gerenciamento de coleção de badges
- Sistema de notificações
- Estatísticas de progresso
- Verificação automática de progresso
- Persistência no localStorage

## Tipos TypeScript

### BadgeConfig
```tsx
interface BadgeConfig {
  id: string;
  type: BadgeType;
  rarity: BadgeRarity;
  category: BadgeCategory;
  title: string;
  description: string;
  unlockConditions: BadgeUnlockCondition[];
  rewards: BadgeReward[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  theme: BadgeTheme;
}
```

### BadgeCollection
```tsx
interface BadgeCollection {
  badges: BadgeConfig[];
  totalBadges: number;
  unlockedBadges: number;
  completionPercentage: number;
  categories: Record<BadgeCategory, number>;
  rarities: Record<BadgeRarity, number>;
}
```

## Efeitos CSS

### Animações Principais
- `twinkle`: Piscar das estrelas de fundo
- `sparkleFloat`: Flutuação das partículas
- `trailFade`: Fade da trilha do mouse
- `prismRotate`: Rotação do prisma de luz
- `rayPulse`: Pulso dos raios de luz
- `diamondPulse`: Pulso do diamante no clique
- `nebulaFloat`: Movimento da nebulosa
- `auroraWave`: Onda da aurora boreal

### Animações Discord
- `discordPulse`: Pulso específico do badge Discord
- `waveRipple`: Ondas concêntricas no clique
- `ringRotate`: Rotação do anel orbital
- `notificationPulse`: Pulso da notificação
- `boostShine`: Brilho do indicador de boost
- `typingBounce`: Animação dos pontos de digitação
- `patternShift`: Movimento do padrão de fundo

### Responsividade
- Adaptação automática para diferentes tamanhos de tela
- Otimização para dispositivos móveis
- Suporte a `prefers-reduced-motion`

## Uso

### 1. Instalação
O sistema já está integrado ao projeto. Para usar:

```tsx
import { BadgeCard } from '@/components/BadgeCard';
import { BadgeProvider } from '@/contexts/BadgeContext';
```

### 2. Configuração
Envolva sua aplicação com o BadgeProvider:

```tsx
<BadgeProvider>
  <YourApp />
</BadgeProvider>
```

### 3. Demonstração
Acesse `/badge-demo` para ver uma demonstração completa do sistema ou `/discord-badge-demo` para uma demonstração específica dos badges Discord.

## Personalização

### Temas Customizados
Você pode criar novos temas modificando `BADGE_THEMES` em `types/badge.ts`:

```tsx
const customTheme: BadgeTheme = {
  name: 'CUSTOM BADGE',
  description: 'Badge Personalizado',
  colors: {
    main: ['rgba(255,0,0,0.9)', 'rgba(255,100,100,0.8)', ...],
    facet1: ['rgba(255,50,50,0.6)', 'rgba(255,0,0,0.1)'],
    facet2: ['rgba(255,150,150,0.4)', 'rgba(255,0,0,0.1)'],
    glow: 'rgba(255,0,0,0.4)',
    rays: 'rgba(255,100,100,0.6)'
  }
};
```

### Condições de Desbloqueio
Crie condições personalizadas para desbloquear badges:

```tsx
const customCondition: BadgeUnlockCondition = {
  type: 'custom',
  value: 100,
  description: 'Complete 100 tarefas personalizadas',
  currentValue: 0
};
```

## Performance

### Otimizações
- Animações CSS otimizadas com `transform` e `opacity`
- Throttling para eventos de mouse
- Cleanup automático de partículas
- Lazy loading de componentes pesados

### Acessibilidade
- Suporte a `prefers-reduced-motion`
- Contraste adequado para texto
- Navegação por teclado
- Screen reader friendly

## Integração com Gamificação

O sistema se integra perfeitamente com o sistema de gamificação existente:

```tsx
// No contexto de gamificação
const { processTaskCompletion } = useGamification();
const { checkBadgeProgress } = useBadge();

// Verificar progresso dos badges após completar tarefa
const handleTaskComplete = (task: Task, allTasks: Task[]) => {
  processTaskCompletion(task, allTasks);
  checkBadgeProgress(task, allTasks);
};
```

## Próximos Passos

1. **Integração com Notificações**: Sistema de notificações toast
2. **Animações Avançadas**: Mais efeitos de partículas
3. **Sons**: Efeitos sonoros para interações
4. **Exportação**: Sistema para exportar badges como imagens
5. **Social**: Compartilhamento de conquistas

## Troubleshooting

### Problemas Comuns

1. **Animações não funcionam**: Verifique se o CSS está importado
2. **Performance lenta**: Reduza a frequência de partículas
3. **Responsividade**: Teste em diferentes dispositivos
4. **TypeScript errors**: Verifique as importações dos tipos

### Debug
Use o console do navegador para debug:
```tsx
console.log('Badge clicado:', badgeId);
console.log('Progresso:', progress);
```

## Contribuição

Para contribuir com o sistema:
1. Mantenha a consistência visual
2. Teste em diferentes dispositivos
3. Documente novas funcionalidades
4. Siga os padrões de código existentes
