// performance-test.ts — Teste de performance SQLite OPFS vs LocalStorage

import { LocalStorageTaskRepository } from '@/lib/localstorage-repo';
import { SQLiteOPFSTaskRepository } from '@/lib/sqlite-opfs-repo';
import { Task, Query } from '@/types/domain';
import { generateUniqueTaskId } from '@/lib/utils';

interface PerformanceResult {
  operation: string;
  localStorage: number; // ms
  sqlite: number; // ms
  improvement: number; // %
}

interface TestData {
  tasks: Task[];
  queries: Query<Task>[];
}

/**
 * Gera dados de teste para performance
 */
function generateTestData(count: number): TestData {
  const tasks: Task[] = [];
  const now = new Date();
  
  // Gerar tarefas variadas
  for (let i = 0; i < count; i++) {
    const task: Task = {
      id: generateUniqueTaskId(),
      titulo: `Tarefa de teste ${i} - ${Math.random().toString(36).substring(7)}`,
      descricao: `Descrição da tarefa ${i} com conteúdo variado para testar performance de busca`,
      statusAtual: ['a_fazer', 'fazendo', 'concluido'][Math.floor(Math.random() * 3)] as any,
      prioridade: ['baixa', 'normal', 'media', 'alta'][Math.floor(Math.random() * 4)] as any,
      impedimento: Math.random() > 0.8,
      impedimentoMotivo: Math.random() > 0.8 ? `Motivo do impedimento ${i}` : '',
      dataImpedimento: Math.random() > 0.8 ? new Date(now.getTime() - Math.random() * 86400000) : null,
      dataCadastro: new Date(now.getTime() - Math.random() * 86400000 * 30), // Últimos 30 dias
      dataInicio: Math.random() > 0.5 ? new Date(now.getTime() - Math.random() * 86400000 * 7) : null,
      dataFim: Math.random() > 0.7 ? new Date(now.getTime() - Math.random() * 86400000 * 3) : null,
      ordem: i,
      tags: Array.from({ length: Math.floor(Math.random() * 5) }, () => 
        `tag${Math.floor(Math.random() * 10)}`
      ),
      categoria: ['feature', 'bug', 'desenvolvimento', 'qa'][Math.floor(Math.random() * 4)] as any,
      estimativaTempo: Math.floor(Math.random() * 480) + 30, // 30min a 8h
      complexidade: ['simples', 'media', 'complexa'][Math.floor(Math.random() * 3)] as any,
      numeroMudancasPrioridade: Math.floor(Math.random() * 5),
      tempoTotalImpedimento: Math.floor(Math.random() * 240), // até 4h
      foiRetrabalho: Math.random() > 0.9,
      referenced_task_id: Math.random() > 0.9 ? `ref_${i}` : null,
      parent_id: Math.random() > 0.95 ? `parent_${i}` : null,
      is_active: true,
      statusHistorico: [{
        status: 'a_fazer',
        timestamp: new Date(now.getTime() - Math.random() * 86400000 * 30)
      }],
      impedimentoHistorico: []
    };
    
    tasks.push(task);
  }

  // Gerar queries de teste
  const queries: Query<Task>[] = [
    // Query simples
    {
      spec: {
        where: [{ field: 'statusAtual', op: 'eq', value: 'a_fazer' }]
      },
      page: { page: 1, size: 10 }
    },
    
    // Query com filtros múltiplos
    {
      spec: {
        where: [
          { field: 'prioridade', op: 'eq', value: 'alta' },
          { field: 'impedimento', op: 'eq', value: false }
        ]
      },
      page: { page: 1, size: 20 }
    },
    
    // Query com busca de texto
    {
      spec: {
        where: [{ field: 'titulo', op: 'contains', value: 'teste' }]
      },
      page: { page: 1, size: 50 }
    },
    
    // Query com filtro de data
    {
      spec: {
        where: [{ 
          field: 'dataCadastro', 
          op: 'gte', 
          value: new Date(now.getTime() - 7 * 86400000) // Última semana
        }]
      },
      page: { page: 1, size: 100 }
    },
    
    // Query complexa com ordenação
    {
      spec: {
        where: [
          { field: 'statusAtual', op: 'neq', value: 'concluido' },
          { field: 'prioridade', op: 'in', value: ['alta', 'media'] }
        ]
      },
      page: { 
        page: 1, 
        size: 25, 
        sort: [{ field: 'dataCadastro', dir: 'desc' }] 
      }
    },
    
    // Query com paginação
    {
      spec: {
        where: [{ field: 'is_active', op: 'eq', value: true }]
      },
      page: { page: 5, size: 10 }
    }
  ];

  return { tasks, queries };
}

/**
 * Executa teste de performance
 */
async function runPerformanceTest(taskCount: number): Promise<PerformanceResult[]> {
  console.log(`🚀 Iniciando teste de performance com ${taskCount} tarefas...`);
  
  const { tasks, queries } = generateTestData(taskCount);
  const results: PerformanceResult[] = [];
  
  // Inicializar repositórios
  const localStorageRepo = new LocalStorageTaskRepository();
  const sqliteRepo = new SQLiteOPFSTaskRepository();
  
  try {
    // Preparar dados
    console.log('📝 Preparando dados...');
    
    // Salvar no LocalStorage
    const lsStart = performance.now();
    for (const task of tasks) {
      await localStorageRepo.save(task);
    }
    const lsPrepTime = performance.now() - lsStart;
    console.log(`LocalStorage preparado em ${lsPrepTime.toFixed(2)}ms`);
    
    // Salvar no SQLite
    const sqliteStart = performance.now();
    for (const task of tasks) {
      await sqliteRepo.save(task);
    }
    const sqlitePrepTime = performance.now() - sqliteStart;
    console.log(`SQLite preparado em ${sqlitePrepTime.toFixed(2)}ms`);
    
    // Teste 1: Busca simples
    console.log('🔍 Teste 1: Busca simples');
    const query1 = queries[0];
    
    const ls1Start = performance.now();
    await localStorageRepo.search(query1);
    const ls1Time = performance.now() - ls1Start;
    
    const sqlite1Start = performance.now();
    await sqliteRepo.search(query1);
    const sqlite1Time = performance.now() - sqlite1Start;
    
    results.push({
      operation: 'Busca simples',
      localStorage: ls1Time,
      sqlite: sqlite1Time,
      improvement: ((ls1Time - sqlite1Time) / ls1Time) * 100
    });
    
    // Teste 2: Busca com filtros múltiplos
    console.log('🔍 Teste 2: Filtros múltiplos');
    const query2 = queries[1];
    
    const ls2Start = performance.now();
    await localStorageRepo.search(query2);
    const ls2Time = performance.now() - ls2Start;
    
    const sqlite2Start = performance.now();
    await sqliteRepo.search(query2);
    const sqlite2Time = performance.now() - sqlite2Start;
    
    results.push({
      operation: 'Filtros múltiplos',
      localStorage: ls2Time,
      sqlite: sqlite2Time,
      improvement: ((ls2Time - sqlite2Time) / ls2Time) * 100
    });
    
    // Teste 3: Busca de texto
    console.log('🔍 Teste 3: Busca de texto');
    const query3 = queries[2];
    
    const ls3Start = performance.now();
    await localStorageRepo.search(query3);
    const ls3Time = performance.now() - ls3Start;
    
    const sqlite3Start = performance.now();
    await sqliteRepo.search(query3);
    const sqlite3Time = performance.now() - sqlite3Start;
    
    results.push({
      operation: 'Busca de texto',
      localStorage: ls3Time,
      sqlite: sqlite3Time,
      improvement: ((ls3Time - sqlite3Time) / ls3Time) * 100
    });
    
    // Teste 4: Filtro de data
    console.log('🔍 Teste 4: Filtro de data');
    const query4 = queries[3];
    
    const ls4Start = performance.now();
    await localStorageRepo.search(query4);
    const ls4Time = performance.now() - ls4Start;
    
    const sqlite4Start = performance.now();
    await sqliteRepo.search(query4);
    const sqlite4Time = performance.now() - sqlite4Start;
    
    results.push({
      operation: 'Filtro de data',
      localStorage: ls4Time,
      sqlite: sqlite4Time,
      improvement: ((ls4Time - sqlite4Time) / ls4Time) * 100
    });
    
    // Teste 5: Query complexa com ordenação
    console.log('🔍 Teste 5: Query complexa');
    const query5 = queries[4];
    
    const ls5Start = performance.now();
    await localStorageRepo.search(query5);
    const ls5Time = performance.now() - ls5Start;
    
    const sqlite5Start = performance.now();
    await sqliteRepo.search(query5);
    const sqlite5Time = performance.now() - sqlite5Start;
    
    results.push({
      operation: 'Query complexa',
      localStorage: ls5Time,
      sqlite: sqlite5Time,
      improvement: ((ls5Time - sqlite5Time) / ls5Time) * 100
    });
    
    // Teste 6: Paginação
    console.log('🔍 Teste 6: Paginação');
    const query6 = queries[5];
    
    const ls6Start = performance.now();
    await localStorageRepo.search(query6);
    const ls6Time = performance.now() - ls6Start;
    
    const sqlite6Start = performance.now();
    await sqliteRepo.search(query6);
    const sqlite6Time = performance.now() - sqlite6Start;
    
    results.push({
      operation: 'Paginação',
      localStorage: ls6Time,
      sqlite: sqlite6Time,
      improvement: ((ls6Time - sqlite6Time) / ls6Time) * 100
    });
    
    // Teste 7: Contagem
    console.log('🔍 Teste 7: Contagem');
    
    const lsCountStart = performance.now();
    await localStorageRepo.count();
    const lsCountTime = performance.now() - lsCountStart;
    
    const sqliteCountStart = performance.now();
    await sqliteRepo.count();
    const sqliteCountTime = performance.now() - sqliteCountStart;
    
    results.push({
      operation: 'Contagem total',
      localStorage: lsCountTime,
      sqlite: sqliteCountTime,
      improvement: ((lsCountTime - sqliteCountTime) / lsCountTime) * 100
    });
    
    // Teste 8: Atualização
    console.log('🔍 Teste 8: Atualização');
    const taskToUpdate = tasks[Math.floor(Math.random() * tasks.length)];
    
    const lsUpdateStart = performance.now();
    await localStorageRepo.update(taskToUpdate.id, { 
      statusAtual: 'fazendo',
      dataInicio: new Date()
    });
    const lsUpdateTime = performance.now() - lsUpdateStart;
    
    const sqliteUpdateStart = performance.now();
    await sqliteRepo.update(taskToUpdate.id, { 
      statusAtual: 'fazendo',
      dataInicio: new Date()
    });
    const sqliteUpdateTime = performance.now() - sqliteUpdateStart;
    
    results.push({
      operation: 'Atualização',
      localStorage: lsUpdateTime,
      sqlite: sqliteUpdateTime,
      improvement: ((lsUpdateTime - sqliteUpdateTime) / lsUpdateTime) * 100
    });
    
  } finally {
    // Limpar dados de teste
    await localStorageRepo.clear();
    await sqliteRepo.close();
  }
  
  return results;
}

/**
 * Executa múltiplos testes com diferentes volumes
 */
export async function runComprehensivePerformanceTest(): Promise<void> {
  console.log('🚀 Iniciando testes abrangentes de performance...\n');
  
  const testSizes = [100, 500, 1000, 2000];
  const allResults: { size: number; results: PerformanceResult[] }[] = [];
  
  for (const size of testSizes) {
    console.log(`\n📊 Testando com ${size} tarefas:`);
    console.log('='.repeat(50));
    
    try {
      const results = await runPerformanceTest(size);
      allResults.push({ size, results });
      
      // Mostrar resultados
      console.log('\n📈 Resultados:');
      console.log('Operação'.padEnd(20) + 'LocalStorage'.padEnd(15) + 'SQLite'.padEnd(15) + 'Melhoria');
      console.log('-'.repeat(65));
      
      results.forEach(result => {
        const operation = result.operation.padEnd(20);
        const lsTime = `${result.localStorage.toFixed(2)}ms`.padEnd(15);
        const sqliteTime = `${result.sqlite.toFixed(2)}ms`.padEnd(15);
        const improvement = `${result.improvement.toFixed(1)}%`;
        
        console.log(`${operation}${lsTime}${sqliteTime}${improvement}`);
      });
      
      // Calcular média de melhoria
      const avgImprovement = results.reduce((sum, r) => sum + r.improvement, 0) / results.length;
      console.log(`\n📊 Melhoria média: ${avgImprovement.toFixed(1)}%`);
      
    } catch (error) {
      console.error(`❌ Erro no teste com ${size} tarefas:`, error);
    }
  }
  
  // Resumo final
  console.log('\n🎯 RESUMO FINAL:');
  console.log('='.repeat(50));
  
  allResults.forEach(({ size, results }) => {
    const avgImprovement = results.reduce((sum, r) => sum + r.improvement, 0) / results.length;
    console.log(`${size} tarefas: ${avgImprovement.toFixed(1)}% de melhoria média`);
  });
  
  console.log('\n✅ Testes de performance concluídos!');
}

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // Expor função globalmente para uso no console
  (window as any).runPerformanceTest = runComprehensivePerformanceTest;
}
