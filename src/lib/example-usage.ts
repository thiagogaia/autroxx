// example-usage.ts — Exemplo de uso do padrão Specification/Query Object

import { LocalStorageTaskRepository } from '@/lib/localstorage-repo';
import { SqliteTaskRepository } from '@/lib/sqlite-repo';
import { Task, Query, createAndSpec, Spec } from '@/types/domain';
import { taskFiltersToSpec, taskFiltersToPageRequest } from '@/lib/query-utils';

/**
 * Exemplo de uso do padrão Specification/Query Object
 * Demonstra como trocar de backend sem alterar o código de domínio
 */

// Simulação de banco SQLite (em produção seria better-sqlite3, sql.js, etc.)
const mockDb = {
  all: (sql: string, ...params: unknown[]) => {
    console.log('SQL:', sql, 'Params:', params);
    return []; // Retorna array vazio para demonstração
  },
  get: (sql: string, ...params: unknown[]) => {
    console.log('SQL:', sql, 'Params:', params);
    return null; // Retorna null para demonstração
  },
  run: (sql: string, ...params: unknown[]) => {
    console.log('SQL:', sql, 'Params:', params);
    return { changes: 1 }; // Simula execução bem-sucedida
  }
};

// Factory para escolher o repository baseado no ambiente
function createTaskRepository() {
  // Em produção, isso seria baseado em variáveis de ambiente
  const useSqlite = process.env.NODE_ENV === 'production' && typeof window === 'undefined';
  
  if (useSqlite) {
    return new SqliteTaskRepository(mockDb);
  } else {
    return new LocalStorageTaskRepository();
  }
}

/**
 * Exemplo de consultas usando Specification/Query Object
 */
async function demonstrateQueries() {
  const repository = createTaskRepository();
  
  // 1. Buscar todas as tarefas com paginação
  console.log('=== Buscar todas as tarefas ===');
  const allTasks = await repository.search({
    page: { page: 1, size: 10, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
  });
  console.log('Total de tarefas:', allTasks.total);
  
  // 2. Buscar tarefas por status
  console.log('\n=== Buscar tarefas "a fazer" ===');
  const todoTasks = await repository.search({
    spec: {
      where: [{ field: 'statusAtual', op: 'eq', value: 'a_fazer' }]
    }
  });
  console.log('Tarefas a fazer:', todoTasks.items.length);
  
  // 3. Buscar tarefas com filtros compostos
  console.log('\n=== Buscar tarefas urgentes não concluídas ===');
  const urgentTasks = await repository.search({
    spec: createAndSpec(
      { where: [{ field: 'prioridade', op: 'eq', value: 'alta' }] },
      { where: [{ field: 'statusAtual', op: 'neq', value: 'concluido' }] }
    ),
    page: { page: 1, size: 5 }
  });
  console.log('Tarefas urgentes:', urgentTasks.items.length);
  
  // 4. Buscar tarefas por título (busca parcial)
  console.log('\n=== Buscar tarefas por título ===');
  const searchTasks = await repository.search({
    spec: {
      where: [{ field: 'titulo', op: 'contains', value: 'bug' }]
    }
  });
  console.log('Tarefas com "bug" no título:', searchTasks.items.length);
  
  // 5. Buscar tarefas por data
  console.log('\n=== Buscar tarefas por data ===');
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  
  const recentTasks = await repository.search({
    spec: {
      where: [{ 
        field: 'dataCadastro', 
        op: 'between', 
        value: [yesterday, today] 
      }]
    }
  });
  console.log('Tarefas criadas nas últimas 24h:', recentTasks.items.length);
  
  // 6. Buscar tarefas com impedimentos
  console.log('\n=== Buscar tarefas com impedimentos ===');
  const blockedTasks = await repository.search({
    spec: {
      where: [{ field: 'impedimento', op: 'eq', value: true }]
    }
  });
  console.log('Tarefas com impedimentos:', blockedTasks.items.length);
  
  // 7. Buscar tarefas por tags
  console.log('\n=== Buscar tarefas por tags ===');
  const taggedTasks = await repository.search({
    spec: {
      where: [{ field: 'tags', op: 'contains', value: 'urgente' }]
    }
  });
  console.log('Tarefas com tag "urgente":', taggedTasks.items.length);
  
  // 8. Consulta complexa: tarefas urgentes ou com impedimentos, ordenadas por prioridade
  console.log('\n=== Consulta complexa ===');
  const complexQuery = await repository.search({
    spec: {
      or: [
        { where: [{ field: 'prioridade', op: 'eq', value: 'alta' }] },
        { where: [{ field: 'impedimento', op: 'eq', value: true }] }
      ]
    },
    page: {
      page: 1,
      size: 10,
      sort: [
        { field: 'prioridade', dir: 'desc' },
        { field: 'dataCadastro', dir: 'asc' }
      ]
    }
  });
  console.log('Tarefas urgentes ou com impedimentos:', complexQuery.items.length);
}

/**
 * Exemplo de migração de filtros antigos para o novo padrão
 */
function demonstrateFilterMigration() {
  console.log('\n=== Migração de filtros ===');
  
  // Filtros no formato antigo
  const oldFilters = {
    statusFilter: 'urgente' as const,
    titleSearch: 'bug',
    priorityFilter: ['alta', 'media'],
    impedimentFilter: false,
    sortBy: 'dataCadastro' as const,
    sortOrder: 'desc' as const
  };
  
  // Converter para Specification/Query Object
  const spec = taskFiltersToSpec(oldFilters) as unknown as Spec<Task>;
  const pageRequest = taskFiltersToPageRequest(oldFilters);
  
  console.log('Specification:', JSON.stringify(spec, null, 2));
  console.log('Page Request:', JSON.stringify(pageRequest, null, 2));
  
  // Usar no repository
  const query: Query<Task> = { spec, page: pageRequest };
  console.log('Query completa:', JSON.stringify(query, null, 2));
}

/**
 * Exemplo de operações CRUD
 */
async function demonstrateCRUD() {
  console.log('\n=== Operações CRUD ===');
  
  const repository = createTaskRepository();
  
  // Criar uma nova tarefa
  const newTask: Task = {
    id: Date.now(),
    titulo: 'Implementar Specification Pattern',
    descricao: 'Implementar padrão Specification/Query Object para abstrair consultas',
    statusAtual: 'a_fazer',
    prioridade: 'alta',
    impedimento: false,
    impedimentoMotivo: '',
    impedimentoHistorico: [],
    dataImpedimento: null,
    dataCadastro: new Date(),
    dataInicio: null,
    dataFim: null,
    ordem: 0,
    tags: ['arquitetura', 'padrões'],
    categoria: 'desenvolvimento',
    estimativaTempo: 120,
    complexidade: 'media',
    numeroMudancasPrioridade: 0,
    tempoTotalImpedimento: 0,
    foiRetrabalho: false,
    referenced_task_id: null,
    parent_id: null,
    is_active: true,
    statusHistorico: [{ status: 'a_fazer', timestamp: new Date() }]
  };
  
  try {
    // Salvar
    const savedTask = await repository.save(newTask);
    console.log('Tarefa salva:', savedTask.id);
    
    // Buscar por ID
    const foundTask = await repository.get(savedTask.id);
    console.log('Tarefa encontrada:', foundTask?.titulo);
    
    // Atualizar
    const updatedTask = await repository.update(savedTask.id, {
      statusAtual: 'fazendo',
      dataInicio: new Date()
    });
    console.log('Tarefa atualizada:', updatedTask.statusAtual);
    
    // Contar tarefas
    const totalCount = await repository.count();
    console.log('Total de tarefas:', totalCount);
    
    // Deletar
    await repository.delete(savedTask.id);
    console.log('Tarefa deletada');
    
  } catch (error) {
    console.error('Erro nas operações CRUD:', error);
  }
}

/**
 * Executar todos os exemplos
 */
export async function runExamples() {
  console.log('🚀 Exemplos do padrão Specification/Query Object\n');
  
  try {
    await demonstrateQueries();
    demonstrateFilterMigration();
    await demonstrateCRUD();
    
    console.log('\n✅ Todos os exemplos executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar exemplos:', error);
  }
}

// Executar se chamado diretamente
if (typeof window === 'undefined') {
  runExamples();
}
