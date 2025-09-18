# Task Manager MVP - Next.js + shadcn/ui

Sistema de gerenciamento de tarefas desenvolvido com Next.js 14, TypeScript e shadcn/ui.

## 🚀 Funcionalidades

- ✅ **Sistema de Status**: A fazer, Fazendo, Concluído com animações
- 🔥 **Sistema de Prioridades**: Baixa, Normal, Média, Alta com efeitos visuais
- 🚫 **Controle de Impedimentos**: Modal para adicionar motivos de bloqueio
- 📊 **Métricas em Tempo Real**: Performance, tempo médio, taxa de conclusão
- 🎯 **Filtros Inteligentes**: Abas para visualizar tarefas por prioridade
- ⏱️ **Tracking de Tempo**: Registro automático de início e fim das tarefas
- 🎨 **UI Moderna**: Componentes shadcn/ui com Tailwind CSS

## 🛠️ Tecnologias

- **Next.js 14** - App Router
- **TypeScript** - Tipagem estática
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Context API** - Gerenciamento de estado
- **useReducer** - Estado complexo

## 📦 Instalação

### 1. Clonar projeto Next.js
```bash
git clone git@thigato.com
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Instalar componentes necessários
```bash
npm install
```

### 4. Estrutura de pastas
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── TaskFilter.tsx
│   ├── TaskForm.tsx
│   ├── TaskItem.tsx
│   ├── TaskList.tsx
│   ├── Metrics.tsx
│   └── ImpedimentDialog.tsx
├── contexts/
│   └── TaskContext.tsx
├── types/
│   └── task.ts
└── lib/
    ├── utils.ts
    └── mock-data.ts
```

### 5. Executar o projeto
```bash
npm run dev
```

## 🎨 Funcionalidades Principais

### Context API com useReducer
- **Estado centralizado** para todas as tarefas
- **Actions bem definidas** para cada operação
- **Tipagem TypeScript** completa

### Componentes shadcn/ui
- **Button** - Botões com variantes
- **Input** - Campos de entrada
- **Select** - Dropdowns customizáveis
- **Checkbox** - Checkboxes estilizados
- **Table** - Tabelas responsivas
- **Card** - Containers de conteúdo
- **Dialog** - Modais acessíveis
- **Tabs** - Navegação por abas
- **Textarea** - Campos de texto grandes

### Animações Tailwind
- **animate-spin** - Loading nos status "fazendo"
- **animate-pulse** - Tarefas de alta prioridade
- **animate-bounce** - Ícones de impedimento
- **hover:bg-muted/50** - Efeitos de hover

## 📱 Layout Responsivo

- **Desktop**: Grid completo com 6 colunas
- **Tablet**: Layout adaptativo
- **Mobile**: Stack vertical otimizado

## 🔧 Customizações

### Adicionar novos status
1. Edite `types/task.ts`
2. Atualize `STATUS_CONFIG` em `lib/mock-data.ts`
3. Implemente a lógica no reducer

### Adicionar novas prioridades
1. Edite `TaskPriority` em `types/task.ts`
2. Atualize `PRIORIDADE_CONFIG`
3. Ajuste os filtros conforme necessário

### Personalizar métricas
Edite o componente `Metrics.tsx` para adicionar novas métricas calculadas.

## 🎯 Próximos Passos

- [ ] Persistência de dados (localStorage/API)
- [ ] Drag & Drop para reordenar tarefas
- [ ] Notificações push
- [ ] Colaboração em tempo real
- [ ] Exportação de relatórios
- [ ] Temas personalizáveis

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

Desenvolvido com ❤️ usando Next.js e shadcn/ui