# Task Manager MVP - Next.js + shadcn/ui + localStorage

Sistema de gerenciamento de tarefas desenvolvido com Next.js 14, TypeScript, shadcn/ui e persistência local.

## 🚀 Funcionalidades

- ✅ **Sistema de Status**: A fazer, Fazendo, Concluído com animações
- 🔥 **Sistema de Prioridades**: Baixa, Normal, Média, Alta com efeitos visuais
- 🚫 **Controle de Impedimentos**: Modal para adicionar motivos de bloqueio
- 📊 **Métricas em Tempo Real**: Performance, tempo médio, taxa de conclusão
- 🎯 **Filtros Inteligentes**: Abas para visualizar tarefas por prioridade
- ⏱️ **Tracking de Tempo**: Registro automático de início e fim das tarefas
- 🗃️ **Persistência Local**: Dados salvos no localStorage do navegador
- 🔄 **Gerenciamento de Dados**: Exportar, importar, limpar e adicionar exemplos
- 🗑️ **Exclusão de Tarefas**: Botão para remover tarefas individuais
- 🎨 **UI Moderna**: Componentes shadcn/ui com Tailwind CSS
- 📱 **Estado Vazio**: Interface amigável quando não há tarefas

## 🛠️ Tecnologias

- **Next.js 14** - App Router
- **TypeScript** - Tipagem estática
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Context API + useReducer** - Gerenciamento de estado
- **localStorage** - Persistência de dados
- **Lucide React** - Ícones

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
│   ├── ImpedimentDialog.tsx
│   ├── EmptyState.tsx
│   └── DataManagement.tsx
├── contexts/
│   └── TaskContext.tsx
├── hooks/
│   └── useLocalStorage.ts
├── types/
│   └── task.ts
└── lib/
    ├── utils.ts
    ├── mock-data.ts
    └── storage.ts
```

### 5. Executar o projeto
```bash
npm run dev
```

## 🎨 Funcionalidades Principais

### Persistência com localStorage
- **Salvamento Automático**: Todas as alterações são salvas automaticamente
- **Hook Personalizado**: `useLocalStorage` para hidratação segura no Next.js
- **Serialização Inteligente**: Converte `Date` objects para strings e vice-versa
- **Recuperação de Dados**: Carregamento automático ao inicializar a aplicação

### Gerenciamento de Dados
- **Exportar**: Baixa um arquivo JSON com backup completo
- **Importar**: Carrega tarefas de arquivo JSON externo
- **Dados de Exemplo**: Adiciona tarefas de demonstração
- **Limpeza Completa**: Remove todos os dados com confirmação dupla

### Context API com useReducer
- **Estado Centralizado**: Gerencia todas as tarefas e filtros
- **Actions Tipadas**: Operações bem definidas com TypeScript
- **Persistência Automática**: Sincronização com localStorage
- **Performance**: Re-renders otimizados

### Interface Responsiva
- **Estado Vazio**: Tela amigável quando não há tarefas
- **Filtros Vazios**: Mensagem quando filtro não retorna resultados
- **Loading States**: Indicadores visuais para operações assíncronas
- **Animações**: Feedback visual para ações do usuário

## 🔧 Recursos Avançados

### Serialização de Dados
```typescript
// Converte Dates para ISO strings
const serializeTasks = (tasks: Task[]) => {
  return tasks.map(task => ({
    ...task,
    dataInicio: task.dataInicio.toISOString(),
    dataFim: task.dataFim?.toISOString() || null
  }));
};
```

### Hook de localStorage Seguro
```typescript
// Hidratação segura no Next.js
const [data, setData, isLoaded] = useLocalStorage('key', defaultValue);
```

### Actions do Reducer
- `LOAD_TASKS` - Carregar dados do localStorage
- `ADD_TASK` - Adicionar nova tarefa
- `UPDATE_STATUS` - Alterar status da tarefa
- `UPDATE_PRIORITY` - Modificar prioridade
- `SET_IMPEDIMENT` - Definir impedimento
- `REMOVE_IMPEDIMENT` - Remover impedimento
- `DELETE_TASK` - Excluir tarefa
- `SET_FILTER` - Alterar filtro ativo

## 📊 Métricas Disponíveis

1. **Tarefas Concluídas** - Total de tarefas finalizadas
2. **Em Andamento** - Tarefas sendo executadas
3. **Tempo Médio** - Duração média das tarefas concluídas
4. **Taxa de Impedimento** - Percentual de tarefas bloqueadas
5. **Finalizadas Hoje** - Produtividade do dia atual
6. **Alta Prioridade** - Contagem de tarefas urgentes
7. **Total de Tarefas** - Contador geral
8. **Taxa de Conclusão** - Percentual de finalização

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

## 🎯 Próximos Passos Inicial

- [x] Persistência de dados (localStorage/API)
- [x] Drag & Drop para reordenar tarefas
- [ ] Notificações push
- [ ] Colaboração em tempo real
- [ ] Exportação de relatórios
- [ ] Temas personalizáveis

## 🎯 Próximos Passos (Roadmap)

### Imediato (localStorage)
- [x] Persistência local
- [x] Exportar/Importar dados
- [x] Estado vazio
- [x] Exclusão de tarefas

### Futuro (API Integration)
- [ ] Backend REST API
- [ ] Autenticação de usuários
- [ ] Sincronização em tempo real
- [ ] Colaboração em equipe
- [ ] Notificações push
- [ ] Relatórios avançados

### Melhorias UX
- [x] Drag & Drop para reordenar
- [ ] Atalhos de teclado
- [ ] Temas personalizáveis
- [ ] PWA (Progressive Web App)
- [ ] Backup automático na nuvem

## 🔒 Dados e Privacidade

- **Armazenamento Local**: Todos os dados ficam no seu navegador
- **Sem Servidor**: Nenhuma informação é enviada para servidores externos
- **Controle Total**: Você pode exportar, importar e limpar seus dados
- **Privacidade**: Suas tarefas permanecem completamente privadas

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

Desenvolvido com ❤️ usando Next.js e shadcn/ui