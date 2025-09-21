// sqlite-opfs-repo.ts — Implementação SQLite real com OPFS usando wa-sqlite

import { ITaskRepository, Task, Query, Page, ID } from '@/types/domain';
import { matches, paginate, sortArray } from '@/lib/query-utils';
import { TaskStatus, TaskPriority, TaskCategory, TaskComplexity } from '@/types/domain';

// Tipos para wa-sqlite
interface SQLiteDB {
  exec: (sql: string, params?: unknown[]) => { rows: unknown[] };
  prepare: (sql: string) => {
    step: () => boolean;
    get: () => unknown;
    all: () => unknown[];
    finalize: () => void;
  };
  close: () => void;
}

interface SQLiteAPI {
  open: (filename: string) => Promise<SQLiteDB>;
  close: (db: SQLiteDB) => Promise<void>;
}

/**
 * Implementação SQLite real usando wa-sqlite com OPFS
 * Suporta índices otimizados e consultas rápidas
 */
export class SQLiteOPFSTaskRepository implements ITaskRepository {
  private db: SQLiteDB | null = null;
  private sqliteAPI: SQLiteAPI | null = null;
  private isInitialized = false;
  private readonly dbName = 'task-manager.db';

  /**
   * Inicializa o SQLite com OPFS
   */
  private async initializeSQLite(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Importar wa-sqlite dinamicamente
      const { default: SQLiteESMFactory } = await import('wa-sqlite/dist/wa-sqlite-async.mjs');
      
      // Configurar OPFS
      const OPFS = await import('wa-sqlite/dist/wa-sqlite-opfs-async.mjs');
      
      // Criar instância do SQLite
      const sqlite3 = SQLiteESMFactory();
      const opfs = await OPFS.default();
      
      // Configurar VFS para OPFS
      sqlite3.vfs_register(opfs, true);
      
      this.sqliteAPI = {
        open: async (filename: string) => {
          const db = await sqlite3.open_v2(filename);
          return {
            exec: (sql: string, params?: unknown[]) => {
              const stmt = sqlite3.prepare_v2(db, sql);
              if (params) {
                for (let i = 0; i < params.length; i++) {
                  sqlite3.bind(stmt, i + 1, params[i]);
                }
              }
              const rows: unknown[] = [];
              while (sqlite3.step(stmt) === sqlite3.SQLITE_ROW) {
                const row: Record<string, unknown> = {};
                for (let i = 0; i < sqlite3.column_count(stmt); i++) {
                  const name = sqlite3.column_name(stmt, i);
                  const value = sqlite3.column(stmt, i);
                  row[name] = value;
                }
                rows.push(row);
              }
              sqlite3.finalize(stmt);
              return { rows };
            },
            prepare: (sql: string) => {
              const stmt = sqlite3.prepare_v2(db, sql);
              return {
                step: () => sqlite3.step(stmt) === sqlite3.SQLITE_ROW,
                get: () => {
                  const row: Record<string, unknown> = {};
                  for (let i = 0; i < sqlite3.column_count(stmt); i++) {
                    const name = sqlite3.column_name(stmt, i);
                    const value = sqlite3.column(stmt, i);
                    row[name] = value;
                  }
                  return row;
                },
                all: () => {
                  const rows: unknown[] = [];
                  while (sqlite3.step(stmt) === sqlite3.SQLITE_ROW) {
                    const row: Record<string, unknown> = {};
                    for (let i = 0; i < sqlite3.column_count(stmt); i++) {
                      const name = sqlite3.column_name(stmt, i);
                      const value = sqlite3.column(stmt, i);
                      row[name] = value;
                    }
                    rows.push(row);
                  }
                  return rows;
                },
                finalize: () => sqlite3.finalize(stmt)
              };
            },
            close: () => sqlite3.close(db)
          };
        },
        close: async (db: SQLiteDB) => {
          db.close();
        }
      };

      // Abrir banco de dados
      this.db = await this.sqliteAPI.open(this.dbName);
      
      // Criar schema e índices
      await this.createSchema();
      
      this.isInitialized = true;
      console.log('SQLite OPFS inicializado com sucesso');
      
    } catch (error) {
      console.error('Erro ao inicializar SQLite OPFS:', error);
      throw new Error('Falha ao inicializar SQLite OPFS');
    }
  }

  /**
   * Cria o schema do banco de dados com índices otimizados
   */
  private async createSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const schema = `
      -- Tabela principal de tarefas
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT DEFAULT '',
        status_atual TEXT NOT NULL DEFAULT 'a_fazer',
        prioridade TEXT NOT NULL DEFAULT 'normal',
        impedimento BOOLEAN DEFAULT 0,
        impedimento_motivo TEXT DEFAULT '',
        data_impedimento DATETIME,
        data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_inicio DATETIME,
        data_fim DATETIME,
        ordem INTEGER DEFAULT 0,
        tags TEXT DEFAULT '[]', -- JSON array
        categoria TEXT,
        estimativa_tempo INTEGER,
        complexidade TEXT,
        numero_mudancas_prioridade INTEGER DEFAULT 0,
        tempo_total_impedimento INTEGER DEFAULT 0,
        foi_retrabalho BOOLEAN DEFAULT 0,
        referenced_task_id TEXT,
        parent_id TEXT,
        is_active BOOLEAN DEFAULT 1,
        rsync BOOLEAN DEFAULT 0,
        id_rsync INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de histórico de status
      CREATE TABLE IF NOT EXISTS status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
      );

      -- Tabela de histórico de impedimentos
      CREATE TABLE IF NOT EXISTS impediment_history (
        id TEXT PRIMARY KEY,
        task_id INTEGER NOT NULL,
        impedimento BOOLEAN NOT NULL,
        motivo TEXT NOT NULL,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
      );

      -- Índices otimizados para consultas rápidas
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status_atual);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (prioridade);
      CREATE INDEX IF NOT EXISTS idx_tasks_impediment ON tasks (impedimento);
      CREATE INDEX IF NOT EXISTS idx_tasks_data_cadastro ON tasks (data_cadastro);
      CREATE INDEX IF NOT EXISTS idx_tasks_ordem ON tasks (ordem);
      CREATE INDEX IF NOT EXISTS idx_tasks_categoria ON tasks (categoria);
      CREATE INDEX IF NOT EXISTS idx_tasks_complexidade ON tasks (complexidade);
      CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks (is_active);
      
      -- Índice composto para consultas complexas
      CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks (status_atual, prioridade);
      CREATE INDEX IF NOT EXISTS idx_tasks_status_impediment ON tasks (status_atual, impedimento);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority_impediment ON tasks (prioridade, impedimento);
      
      -- Índice para ordenação por data
      CREATE INDEX IF NOT EXISTS idx_tasks_data_cadastro_desc ON tasks (data_cadastro DESC);
      
      -- Índices para histórico
      CREATE INDEX IF NOT EXISTS idx_status_history_task_id ON status_history (task_id);
      CREATE INDEX IF NOT EXISTS idx_impediment_history_task_id ON impediment_history (task_id);

      -- Trigger para atualizar updated_at
      CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at 
        AFTER UPDATE ON tasks
        FOR EACH ROW
        BEGIN
          UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
    `;

    this.db.exec(schema);
  }

  /**
   * Garante que o banco está inicializado
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeSQLite();
    }
  }

  /**
   * Busca uma tarefa por ID
   */
  async get(id: ID): Promise<Task | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT t.*, 
             GROUP_CONCAT(sh.status || '|' || sh.timestamp, '||') as status_history,
             GROUP_CONCAT(ih.id || '|' || ih.impedimento || '|' || ih.motivo || '|' || ih.timestamp, '||') as impediment_history
      FROM tasks t
      LEFT JOIN status_history sh ON t.id = sh.task_id
      LEFT JOIN impediment_history ih ON t.id = ih.task_id
      WHERE t.id = ? AND t.is_active = 1
      GROUP BY t.id
    `);

    if (stmt.step()) {
      const row = stmt.get() as Record<string, unknown>;
      return this.mapRowToTask(row);
    }

    stmt.finalize();
    return null;
  }

  /**
   * Busca tarefas com filtros, ordenação e paginação
   */
  async search(query?: Query<Task>): Promise<Page<Task>> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const { sql, params } = this.buildSQL(query);
    const countSql = this.buildCountSQL(query);
    
    // Buscar total de registros
    const countStmt = this.db.prepare(countSql);
    let total = 0;
    if (countStmt.step()) {
      const countRow = countStmt.get() as Record<string, unknown>;
      total = countRow.count as number;
    }
    countStmt.finalize();

    // Buscar dados paginados
    const stmt = this.db.prepare(sql);
    const rows: unknown[] = [];
    while (stmt.step()) {
      rows.push(stmt.get());
    }
    stmt.finalize();

    const items = (rows as Record<string, unknown>[]).map(row => this.mapRowToTask(row));
    
    return { 
      items, 
      total, 
      page: query?.page?.page ?? 1, 
      size: query?.page?.size ?? 10 
    };
  }

  /**
   * Salva uma nova tarefa
   */
  async save(entity: Task): Promise<Task> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    // Verificar se já existe
    const existingStmt = this.db.prepare('SELECT id FROM tasks WHERE id = ?');
    existingStmt.step();
    if (existingStmt.get()) {
      existingStmt.finalize();
      throw new Error(`Tarefa com ID ${entity.id} já existe`);
    }
    existingStmt.finalize();

    // Inserir tarefa
    const insertStmt = this.db.prepare(`
      INSERT INTO tasks (
        id, titulo, descricao, status_atual, prioridade, impedimento, 
        impedimento_motivo, data_impedimento, data_cadastro, data_inicio, 
        data_fim, ordem, tags, categoria, estimativa_tempo, complexidade,
        numero_mudancas_prioridade, tempo_total_impedimento, foi_retrabalho,
        referenced_task_id, parent_id, is_active, rsync, id_rsync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const params = [
      entity.id,
      entity.titulo,
      entity.descricao,
      entity.statusAtual,
      entity.prioridade,
      entity.impedimento ? 1 : 0,
      entity.impedimentoMotivo,
      entity.dataImpedimento?.toISOString() || null,
      entity.dataCadastro.toISOString(),
      entity.dataInicio?.toISOString() || null,
      entity.dataFim?.toISOString() || null,
      entity.ordem || 0,
      JSON.stringify(entity.tags || []),
      entity.categoria || null,
      entity.estimativaTempo || null,
      entity.complexidade || null,
      entity.numeroMudancasPrioridade || 0,
      entity.tempoTotalImpedimento || 0,
      entity.foiRetrabalho ? 1 : 0,
      entity.referenced_task_id || null,
      entity.parent_id || null,
      entity.is_active ? 1 : 0,
      entity.rsync ? 1 : 0,
      entity.id_rsync || null
    ];

    // Executar inserção
    for (let i = 0; i < params.length; i++) {
      insertStmt.bind(i + 1, params[i]);
    }
    insertStmt.step();
    insertStmt.finalize();

    // Inserir histórico de status
    if (entity.statusHistorico && entity.statusHistorico.length > 0) {
      const historyStmt = this.db.prepare(`
        INSERT INTO status_history (task_id, status, timestamp) VALUES (?, ?, ?)
      `);
      
      for (const entry of entity.statusHistorico) {
        historyStmt.bind(1, entity.id);
        historyStmt.bind(2, entry.status);
        historyStmt.bind(3, entry.timestamp.toISOString());
        historyStmt.step();
        historyStmt.reset();
      }
      historyStmt.finalize();
    }

    // Inserir histórico de impedimentos
    if (entity.impedimentoHistorico && entity.impedimentoHistorico.length > 0) {
      const impedimentStmt = this.db.prepare(`
        INSERT INTO impediment_history (id, task_id, impedimento, motivo, timestamp) VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const entry of entity.impedimentoHistorico) {
        impedimentStmt.bind(1, entry.id);
        impedimentStmt.bind(2, entity.id);
        impedimentStmt.bind(3, entry.impedimento ? 1 : 0);
        impedimentStmt.bind(4, entry.motivo);
        impedimentStmt.bind(5, entry.timestamp.toISOString());
        impedimentStmt.step();
        impedimentStmt.reset();
      }
      impedimentStmt.finalize();
    }

    return entity;
  }

  /**
   * Atualiza uma tarefa existente
   */
  async update(id: ID, patch: Partial<Task>): Promise<Task> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const setClauses: string[] = [];
    const params: unknown[] = [];
    
    // Construir SET dinamicamente
    Object.entries(patch).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = this.mapFieldToDbColumn(key as keyof Task);
        setClauses.push(`${dbKey} = ?`);
        
        // Converter valores especiais
        if (key === 'impedimento' || key === 'foiRetrabalho' || key === 'is_active' || key === 'rsync') {
          params.push(value ? 1 : 0);
        } else if (key === 'dataImpedimento' || key === 'dataCadastro' || key === 'dataInicio' || key === 'dataFim') {
          params.push(value ? (value as Date).toISOString() : null);
        } else if (key === 'tags') {
          params.push(JSON.stringify(value));
        } else {
          params.push(value);
        }
      }
    });
    
    if (setClauses.length === 0) {
      return (await this.get(id))!;
    }
    
    params.push(id);
    const sql = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`;
    
    const stmt = this.db.prepare(sql);
    for (let i = 0; i < params.length; i++) {
      stmt.bind(i + 1, params[i]);
    }
    stmt.step();
    stmt.finalize();
    
    return (await this.get(id))!;
  }

  /**
   * Remove uma tarefa
   */
  async delete(id: ID): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    // Soft delete - marcar como inativo
    const stmt = this.db.prepare('UPDATE tasks SET is_active = 0 WHERE id = ?');
    stmt.bind(1, id);
    stmt.step();
    stmt.finalize();
  }

  /**
   * Conta o número de tarefas que correspondem à query
   */
  async count(query?: Query<Task>): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const { sql, params } = this.buildCountSQL(query);
    const stmt = this.db.prepare(sql);
    
    for (let i = 0; i < params.length; i++) {
      stmt.bind(i + 1, params[i]);
    }
    
    let count = 0;
    if (stmt.step()) {
      const row = stmt.get() as Record<string, unknown>;
      count = row.count as number;
    }
    
    stmt.finalize();
    return count;
  }

  /**
   * Busca tarefas por status
   */
  async findByStatus(status: string): Promise<Task[]> {
    const result = await this.search({
      spec: {
        where: [{ field: 'statusAtual', op: 'eq', value: status }]
      }
    });
    return result.items;
  }

  /**
   * Busca tarefas por prioridade
   */
  async findByPriority(priority: string): Promise<Task[]> {
    const result = await this.search({
      spec: {
        where: [{ field: 'prioridade', op: 'eq', value: priority }]
      }
    });
    return result.items;
  }

  /**
   * Busca tarefas com impedimentos
   */
  async findWithImpediments(): Promise<Task[]> {
    const result = await this.search({
      spec: {
        where: [{ field: 'impedimento', op: 'eq', value: true }]
      }
    });
    return result.items;
  }

  /**
   * Constrói SQL SELECT baseado na Query
   */
  private buildSQL(query?: Query<Task>): { sql: string; params: unknown[] } {
    const whereClause = this.buildWhereClause(query?.spec);
    const orderClause = this.buildOrderClause(query?.page?.sort);
    const limitClause = this.buildLimitClause(query?.page);
    
    const sql = `
      SELECT t.*, 
             GROUP_CONCAT(sh.status || '|' || sh.timestamp, '||') as status_history,
             GROUP_CONCAT(ih.id || '|' || ih.impedimento || '|' || ih.motivo || '|' || ih.timestamp, '||') as impediment_history
      FROM tasks t
      LEFT JOIN status_history sh ON t.id = sh.task_id
      LEFT JOIN impediment_history ih ON t.id = ih.task_id
      ${whereClause.sql}
      GROUP BY t.id
      ${orderClause}
      ${limitClause}
    `.trim();
    
    return { sql, params: whereClause.params };
  }

  /**
   * Constrói SQL COUNT baseado na Query
   */
  private buildCountSQL(query?: Query<Task>): { sql: string; params: unknown[] } {
    const whereClause = this.buildWhereClause(query?.spec);
    
    const sql = `
      SELECT COUNT(DISTINCT t.id) as count 
      FROM tasks t
      ${whereClause.sql}
    `.trim();
    
    return { sql, params: whereClause.params };
  }

  /**
   * Constrói cláusula WHERE baseada na Specification
   */
  private buildWhereClause(spec?: Record<string, unknown>): { sql: string; params: unknown[] } {
    if (!spec || !spec.where || (spec.where as unknown[]).length === 0) {
      return { sql: 'WHERE t.is_active = 1', params: [] };
    }
    
    const conditions: string[] = ['t.is_active = 1'];
    const params: unknown[] = [];
    
    (spec.where as Record<string, unknown>[]).forEach((rule: Record<string, unknown>) => {
      const dbField = this.mapFieldToDbColumn(rule.field as keyof Task);
      const condition = this.buildCondition(`t.${dbField}`, rule.op as string, rule.value);
      conditions.push(condition.sql);
      params.push(...condition.params);
    });
    
    return {
      sql: `WHERE ${conditions.join(' AND ')}`,
      params
    };
  }

  /**
   * Constrói uma condição SQL individual
   */
  private buildCondition(field: string, op: string, value: unknown): { sql: string; params: unknown[] } {
    switch (op) {
      case 'eq':
        return { sql: `${field} = ?`, params: [value] };
      case 'neq':
        return { sql: `${field} != ?`, params: [value] };
      case 'gt':
        return { sql: `${field} > ?`, params: [value] };
      case 'lt':
        return { sql: `${field} < ?`, params: [value] };
      case 'gte':
        return { sql: `${field} >= ?`, params: [value] };
      case 'lte':
        return { sql: `${field} <= ?`, params: [value] };
      case 'contains':
        return { sql: `${field} LIKE ?`, params: [`%${value}%`] };
      case 'in':
        const placeholders = Array.isArray(value) ? value.map(() => '?').join(', ') : '?';
        return { sql: `${field} IN (${placeholders})`, params: Array.isArray(value) ? value as unknown[] : [value] };
      case 'between':
        return { sql: `${field} BETWEEN ? AND ?`, params: Array.isArray(value) ? value as unknown[] : [value, value] };
      case 'is_null':
        return { sql: `${field} IS NULL`, params: [] };
      case 'is_not_null':
        return { sql: `${field} IS NOT NULL`, params: [] };
      default:
        return { sql: '1=1', params: [] };
    }
  }

  /**
   * Constrói cláusula ORDER BY
   */
  private buildOrderClause(sort?: Record<string, unknown>[]): string {
    if (!sort || sort.length === 0) {
      return 'ORDER BY t.data_cadastro DESC';
    }
    
    const orderClauses = sort.map(s => {
      const dbField = this.mapFieldToDbColumn(s.field as keyof Task);
      return `t.${dbField} ${(s.dir as string).toUpperCase()}`;
    });
    
    return `ORDER BY ${orderClauses.join(', ')}`;
  }

  /**
   * Constrói cláusula LIMIT/OFFSET
   */
  private buildLimitClause(page?: Record<string, unknown>): string {
    if (!page) {
      return 'LIMIT 10';
    }
    
    const limit = (page.size as number) || 10;
    const offset = (((page.page as number) || 1) - 1) * limit;
    
    return `LIMIT ${limit} OFFSET ${offset}`;
  }

  /**
   * Mapeia campos da entidade para colunas do banco
   */
  private mapFieldToDbColumn(field: keyof Task): string {
    const mapping: Record<string, string> = {
      'statusAtual': 'status_atual',
      'impedimentoMotivo': 'impedimento_motivo',
      'dataImpedimento': 'data_impedimento',
      'dataCadastro': 'data_cadastro',
      'dataInicio': 'data_inicio',
      'dataFim': 'data_fim',
      'estimativaTempo': 'estimativa_tempo',
      'numeroMudancasPrioridade': 'numero_mudancas_prioridade',
      'tempoTotalImpedimento': 'tempo_total_impedimento',
      'foiRetrabalho': 'foi_retrabalho',
      'referenced_task_id': 'referenced_task_id',
      'parent_id': 'parent_id',
      'is_active': 'is_active',
      'id_rsync': 'id_rsync'
    };
    
    return mapping[field] || field;
  }

  /**
   * Mapeia linha do banco para entidade Task
   */
  private mapRowToTask(row: Record<string, unknown>): Task {
    // Parse status history
    const statusHistory: { status: TaskStatus; timestamp: Date }[] = [];
    if (row.status_history) {
      const historyStr = row.status_history as string;
      if (historyStr) {
        const entries = historyStr.split('||');
        for (const entry of entries) {
          if (entry) {
            const [status, timestamp] = entry.split('|');
            statusHistory.push({
              status: status as TaskStatus,
              timestamp: new Date(timestamp)
            });
          }
        }
      }
    }

    // Parse impediment history
    const impedimentHistory: { id: string; impedimento: boolean; motivo: string; timestamp: Date }[] = [];
    if (row.impediment_history) {
      const historyStr = row.impediment_history as string;
      if (historyStr) {
        const entries = historyStr.split('||');
        for (const entry of entries) {
          if (entry) {
            const [id, impedimento, motivo, timestamp] = entry.split('|');
            impedimentHistory.push({
              id,
              impedimento: impedimento === '1',
              motivo,
              timestamp: new Date(timestamp)
            });
          }
        }
      }
    }

    return {
      id: row.id as number,
      titulo: row.titulo as string,
      descricao: row.descricao as string,
      statusAtual: row.status_atual as TaskStatus,
      prioridade: row.prioridade as TaskPriority,
      impedimento: Boolean(row.impedimento),
      impedimentoMotivo: row.impedimento_motivo as string,
      dataImpedimento: row.data_impedimento ? new Date(row.data_impedimento as string) : null,
      dataCadastro: new Date(row.data_cadastro as string),
      dataInicio: row.data_inicio ? new Date(row.data_inicio as string) : null,
      dataFim: row.data_fim ? new Date(row.data_fim as string) : null,
      ordem: row.ordem as number,
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      categoria: row.categoria as TaskCategory,
      estimativaTempo: row.estimativa_tempo as number,
      complexidade: row.complexidade as TaskComplexity,
      numeroMudancasPrioridade: row.numero_mudancas_prioridade as number,
      tempoTotalImpedimento: row.tempo_total_impedimento as number,
      foiRetrabalho: Boolean(row.foi_retrabalho),
      referenced_task_id: row.referenced_task_id as string | null,
      parent_id: row.parent_id as string | null,
      is_active: Boolean(row.is_active),
      rsync: Boolean(row.rsync),
      id_rsync: row.id_rsync as number | null,
      statusHistorico: statusHistory,
      impedimentoHistorico: impedimentHistory
    };
  }

  /**
   * Fecha a conexão com o banco
   */
  async close(): Promise<void> {
    if (this.db && this.sqliteAPI) {
      await this.sqliteAPI.close(this.db);
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Migra dados do LocalStorage para SQLite
   */
  async migrateFromLocalStorage(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Carregar dados do LocalStorage
      const { loadTasksFromStorage } = await import('@/lib/storage');
      const tasks = loadTasksFromStorage();
      
      if (tasks.length === 0) {
        console.log('Nenhuma tarefa encontrada no LocalStorage para migrar');
        return;
      }

      console.log(`Migrando ${tasks.length} tarefas do LocalStorage para SQLite...`);
      
      // Inserir cada tarefa
      for (const task of tasks) {
        try {
          await this.save(task);
        } catch (error) {
          console.warn(`Erro ao migrar tarefa ${task.id}:`, error);
        }
      }
      
      console.log('Migração concluída com sucesso!');
      
    } catch (error) {
      console.error('Erro durante a migração:', error);
      throw error;
    }
  }
}
