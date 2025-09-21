// sqlite-repo.ts — Implementação "SQLite" simulada usando Specification/Query Object

import { ITaskRepository, Task, Query, Page, ID } from '@/types/domain';

/**
 * Implementação simulada de SQLite Repository
 * Esta implementação demonstra como converter Specification/Query Object para SQL
 * Em produção, você usaria better-sqlite3, sql.js, knex, ou similar
 */
export class SqliteTaskRepository implements ITaskRepository {
  constructor(private db: { 
    all: (sql: string, ...params: unknown[]) => unknown[]; 
    get: (sql: string, ...params: unknown[]) => unknown; 
    run: (sql: string, ...params: unknown[]) => { changes: number } 
  }) {}

  /**
   * Busca uma tarefa por ID
   */
  async get(id: ID): Promise<Task | null> {
    const row = this.db.get("SELECT * FROM tasks WHERE id = ?", id);
    return row ? this.mapRowToTask(row) : null;
  }

  /**
   * Busca tarefas com filtros, ordenação e paginação
   */
  async search(query?: Query<Task>): Promise<Page<Task>> {
    const { sql, params } = this.buildSQL(query);
    const countSql = this.buildCountSQL(query);
    
    const items = (this.db.all(sql, ...params) as Record<string, unknown>[]).map((row: Record<string, unknown>) => this.mapRowToTask(row));
    const totalResult = this.db.get(countSql, ...params) as { count: number } | null;
    const total = totalResult?.count || 0;
    
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
    const sql = `
      INSERT INTO tasks (
        id, titulo, descricao, status_atual, prioridade, impedimento, 
        impedimento_motivo, data_impedimento, data_cadastro, data_inicio, 
        data_fim, ordem, tags, categoria, estimativa_tempo, complexidade,
        numero_mudancas_prioridade, tempo_total_impedimento, foi_retrabalho,
        referenced_task_id, parent_id, is_active, rsync, id_rsync
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
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
    
    this.db.run(sql, ...params);
    return entity;
  }

  /**
   * Atualiza uma tarefa existente
   */
  async update(id: ID, patch: Partial<Task>): Promise<Task> {
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
    
    this.db.run(sql, ...params);
    return (await this.get(id))!;
  }

  /**
   * Remove uma tarefa
   */
  async delete(id: ID): Promise<void> {
    this.db.run("DELETE FROM tasks WHERE id = ?", id);
  }

  /**
   * Conta o número de tarefas que correspondem à query
   */
  async count(query?: Query<Task>): Promise<number> {
    const { sql, params } = this.buildCountSQL(query);
    const result = this.db.get(sql, ...params);
    return result?.count || 0;
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
      SELECT * FROM tasks 
      ${whereClause.sql}
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
      SELECT COUNT(*) as count FROM tasks 
      ${whereClause.sql}
    `.trim();
    
    return { sql, params: whereClause.params };
  }

  /**
   * Constrói cláusula WHERE baseada na Specification
   */
  private buildWhereClause(spec?: Record<string, unknown>): { sql: string; params: unknown[] } {
    if (!spec || !spec.where || spec.where.length === 0) {
      return { sql: '', params: [] };
    }
    
    const conditions: string[] = [];
    const params: unknown[] = [];
    
    (spec.where as Record<string, unknown>[]).forEach((rule: Record<string, unknown>) => {
      const dbField = this.mapFieldToDbColumn(rule.field as keyof Task);
      const condition = this.buildCondition(dbField, rule.op as string, rule.value);
      conditions.push(condition.sql);
      params.push(...condition.params);
    });
    
    return {
      sql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
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
      return 'ORDER BY data_cadastro DESC';
    }
    
    const orderClauses = sort.map(s => {
      const dbField = this.mapFieldToDbColumn(s.field as keyof Task);
      return `${dbField} ${(s.dir as string).toUpperCase()}`;
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
      // Campos que precisam ser reconstruídos
      statusHistorico: [], // TODO: Implementar tabela separada
      impedimentoHistorico: [] // TODO: Implementar tabela separada
    };
  }
}
