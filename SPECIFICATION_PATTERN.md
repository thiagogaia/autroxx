# Specification/Query Object Pattern

Este documento descreve a implementação do padrão **Specification/Query Object** no Task Manager MVP, que abstrai filtros, paginação e regras de consulta para permitir múltipla compatibilidade com diferentes sistemas de banco de dados.

## 🎯 Objetivos

- **Abstração completa**: Separar lógica de consulta da implementação específica do banco
- **Flexibilidade**: Trocar de backend sem alterar código de domínio
- **Type Safety**: Garantir type safety com TypeScript
- **Compatibilidade**: Manter compatibilidade com sistema atual
- **Escalabilidade**: Suportar consultas complexas e filtros compostos

## 🏗️ Arquitetura

### Componentes Principais

1. **Domain Types** (`src/types/domain.ts`)
   - Contratos e tipos comuns
   - Interfaces Repository
   - Tipos Specification/Query Object

2. **Query Utils** (`src/lib/query-utils.ts`)
   - Funções utilitárias para filtros, ordenação e paginação
   - Conversores de filtros antigos para novo padrão

3. **Repository Interface** (`src/lib/repository.ts`)
   - Interface genérica Repository
   - Factory para criação de instâncias

4. **Implementações**
   - `LocalStorageTaskRepository` (`src/lib/localstorage-repo.ts`)
   - `SqliteTaskRepository` (`src/lib/sqlite-repo.ts`)

5. **Hooks Personalizados** (`src/hooks/useTaskRepository.ts`)
   - Abstração para uso em componentes React
   - Queries específicas para tarefas

## 📋 Tipos Principais

### Specification
```typescript
export type Spec<T> = {
  and?: Spec<T>[];
  or?: Spec<T>[];
  not?: Spec<T>;
  where?: FilterRule<T>[];
};
```

### Query Object
```typescript
export type Query<T> = { 
  spec?: Spec<T>; 
  page?: PageRequest 
};
```

### Repository Interface
```typescript
export interface Repository<T extends { id: ID }> {
  get(id: ID): Promise<T | null>;
  search(query?: Query<T>): Promise<Page<T>>;
  save(entity: T): Promise<T>;
  update(id: ID, patch: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
  count(query?: Query<T>): Promise<number>;
}
```

## 🔍 Operadores de Filtro

| Operador | Descrição | Exemplo |
|----------|-----------|---------|
| `eq` | Igual | `{ field: 'status', op: 'eq', value: 'ativo' }` |
| `neq` | Diferente | `{ field: 'status', op: 'neq', value: 'inativo' }` |
| `gt` | Maior que | `{ field: 'preco', op: 'gt', value: 100 }` |
| `lt` | Menor que | `{ field: 'preco', op: 'lt', value: 500 }` |
| `gte` | Maior ou igual | `{ field: 'idade', op: 'gte', value: 18 }` |
| `lte` | Menor ou igual | `{ field: 'idade', op: 'lte', value: 65 }` |
| `contains` | Contém | `{ field: 'titulo', op: 'contains', value: 'bug' }` |
| `in` | Está em | `{ field: 'categoria', op: 'in', value: ['dev', 'qa'] }` |
| `between` | Entre | `{ field: 'data', op: 'between', value: [inicio, fim] }` |
| `is_null` | É nulo | `{ field: 'deleted_at', op: 'is_null', value: null }` |
| `is_not_null` | Não é nulo | `{ field: 'updated_at', op: 'is_not_null', value: null }` |

## 💡 Exemplos de Uso

### Consulta Simples
```typescript
const tasks = await repository.search({
  spec: {
    where: [{ field: 'statusAtual', op: 'eq', value: 'a_fazer' }]
  }
});
```

### Consulta com Paginação e Ordenação
```typescript
const result = await repository.search({
  spec: {
    where: [{ field: 'prioridade', op: 'eq', value: 'alta' }]
  },
  page: {
    page: 1,
    size: 10,
    sort: [{ field: 'dataCadastro', dir: 'desc' }]
  }
});
```

### Consulta Composta (AND/OR)
```typescript
const urgentTasks = await repository.search({
  spec: {
    and: [
      { where: [{ field: 'prioridade', op: 'eq', value: 'alta' }] },
      { where: [{ field: 'statusAtual', op: 'neq', value: 'concluido' }] }
    ]
  }
});
```

### Consulta com OR
```typescript
const blockedOrUrgent = await repository.search({
  spec: {
    or: [
      { where: [{ field: 'impedimento', op: 'eq', value: true }] },
      { where: [{ field: 'prioridade', op: 'eq', value: 'alta' }] }
    ]
  }
});
```

### Busca por Texto
```typescript
const searchResults = await repository.search({
  spec: {
    where: [{ field: 'titulo', op: 'contains', value: 'bug' }]
  }
});
```

### Filtro por Data
```typescript
const recentTasks = await repository.search({
  spec: {
    where: [{ 
      field: 'dataCadastro', 
      op: 'between', 
      value: [yesterday, today] 
    }]
  }
});
```

## 🔄 Migração de Filtros Antigos

O sistema inclui funções para converter filtros do formato antigo para o novo padrão:

```typescript
import { taskFiltersToSpec, taskFiltersToPageRequest } from '@/lib/query-utils';

const oldFilters = {
  statusFilter: 'urgente',
  titleSearch: 'bug',
  priorityFilter: ['alta', 'media'],
  sortBy: 'dataCadastro',
  sortOrder: 'desc'
};

const spec = taskFiltersToSpec(oldFilters);
const pageRequest = taskFiltersToPageRequest(oldFilters);
const query = { spec, page: pageRequest };
```

## 🏭 Factory Pattern

Para trocar de backend, basta alterar a factory:

```typescript
import { RepositoryFactory } from '@/lib/repository';
import { LocalStorageTaskRepository } from '@/lib/localstorage-repo';
import { SqliteTaskRepository } from '@/lib/sqlite-repo';

// Usar LocalStorage (desenvolvimento)
RepositoryFactory.setTaskRepository(new LocalStorageTaskRepository());

// Usar SQLite (produção)
RepositoryFactory.setTaskRepository(new SqliteTaskRepository(db));
```

## 🎣 Hooks Personalizados

### useTaskRepository
Hook básico para operações CRUD:

```typescript
const { getTask, saveTask, updateTask, deleteTask, searchTasks } = useTaskRepository();
```

### useTaskQueries
Hook com queries específicas para tarefas:

```typescript
const { 
  getTasksByStatus, 
  getTasksByPriority, 
  searchTasksByTitle,
  getUrgentIncompleteTasks 
} = useTaskQueries();
```

### useAdvancedTaskFilters
Hook para filtros avançados:

```typescript
const { applyAdvancedFilters } = useAdvancedTaskFilters();

const result = await applyAdvancedFilters({
  status: ['a_fazer', 'fazendo'],
  priority: ['alta'],
  title: 'bug',
  sortBy: 'dataCadastro',
  sortOrder: 'desc'
});
```

## 🧪 Testando a Implementação

### Página de Demonstração
Acesse `/repository-demo` para ver o padrão em ação com:
- Busca por texto
- Filtros por status e prioridade
- Consultas complexas
- Operações CRUD

### Exemplos Programáticos
```typescript
import { runExamples } from '@/lib/example-usage';

// Executar todos os exemplos
await runExamples();
```

## 🔧 Implementando Novo Backend

Para implementar um novo backend (ex: PostgreSQL, MongoDB):

1. **Implementar a interface Repository**:
```typescript
export class PostgresTaskRepository implements ITaskRepository {
  async search(query?: Query<Task>): Promise<Page<Task>> {
    const { sql, params } = this.buildSQL(query);
    const result = await this.db.query(sql, params);
    return this.mapResult(result);
  }
  
  // ... outros métodos
}
```

2. **Converter Specification para SQL/Query específico**:
```typescript
private buildSQL(query?: Query<Task>) {
  const whereClause = this.buildWhereClause(query?.spec);
  const orderClause = this.buildOrderClause(query?.page?.sort);
  const limitClause = this.buildLimitClause(query?.page);
  
  return {
    sql: `SELECT * FROM tasks ${whereClause.sql} ${orderClause} ${limitClause}`,
    params: whereClause.params
  };
}
```

3. **Registrar na Factory**:
```typescript
RepositoryFactory.setTaskRepository(new PostgresTaskRepository(db));
```

## 📈 Benefícios

- ✅ **Flexibilidade**: Troca de backend sem alterar código de domínio
- ✅ **Type Safety**: TypeScript garante tipos corretos
- ✅ **Reutilização**: Mesma interface para diferentes backends
- ✅ **Testabilidade**: Fácil mock e teste unitário
- ✅ **Manutenibilidade**: Código mais limpo e organizado
- ✅ **Escalabilidade**: Suporta consultas complexas
- ✅ **Compatibilidade**: Migração gradual do sistema atual

## 🚀 Próximos Passos

1. **Migração Gradual**: Substituir gradualmente o TaskContext atual
2. **Novos Backends**: Implementar PostgreSQL, MongoDB, etc.
3. **Cache Layer**: Adicionar camada de cache
4. **Query Optimization**: Otimizar consultas complexas
5. **Monitoring**: Adicionar métricas e logs
6. **Documentation**: Expandir documentação e exemplos

---

Esta implementação demonstra como o padrão Specification/Query Object pode ser aplicado para criar sistemas flexíveis e escaláveis, mantendo a compatibilidade com código existente.
