// localstorage-repo.ts — Implementação em LocalStorage usando Specification/Query Object

import { ITaskRepository, Task, Query, Page, ID } from '@/types/domain';
import { matches, paginate, sortArray } from '@/lib/query-utils';
import { STORAGE_KEYS, serializeTasks, deserializeTasks } from '@/lib/storage';

export class LocalStorageTaskRepository implements ITaskRepository {
  private readonly key = STORAGE_KEYS.TASKS;

  /**
   * Carrega todas as tarefas do localStorage
   */
  private load(): Task[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      
      return deserializeTasks(raw);
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
      return [];
    }
  }

  /**
   * Salva todas as tarefas no localStorage
   */
  private saveAll(tasks: Task[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized = serializeTasks(tasks);
      localStorage.setItem(this.key, serialized);
    } catch (error) {
      console.error('Erro ao salvar tarefas no localStorage:', error);
    }
  }

  /**
   * Busca uma tarefa por ID
   */
  async get(id: ID): Promise<Task | null> {
    const tasks = this.load();
    return tasks.find(task => task.id === id) ?? null;
  }

  /**
   * Busca tarefas com filtros, ordenação e paginação
   */
  async search(query?: Query<Task>): Promise<Page<Task>> {
    const allTasks = this.load();
    
    // Aplicar filtros
    const filteredTasks = allTasks.filter(task => matches(task, query?.spec));
    
    // Aplicar ordenação
    const sortedTasks = sortArray(filteredTasks, query?.page?.sort);
    
    // Aplicar paginação
    const result = paginate(sortedTasks, query?.page);
    
    return result;
  }

  /**
   * Salva uma nova tarefa
   */
  async save(entity: Task): Promise<Task> {
    const tasks = this.load();
    
    // Verificar se já existe
    const existingIndex = tasks.findIndex(task => task.id === entity.id);
    if (existingIndex >= 0) {
      throw new Error(`Tarefa com ID ${entity.id} já existe`);
    }
    
    tasks.push(entity);
    this.saveAll(tasks);
    return entity;
  }

  /**
   * Atualiza uma tarefa existente
   */
  async update(id: ID, patch: Partial<Task>): Promise<Task> {
    const tasks = this.load();
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) {
      throw new Error(`Tarefa com ID ${id} não encontrada`);
    }
    
    const updatedTask = { ...tasks[index], ...patch };
    tasks[index] = updatedTask;
    this.saveAll(tasks);
    
    return updatedTask;
  }

  /**
   * Remove uma tarefa
   */
  async delete(id: ID): Promise<void> {
    const tasks = this.load();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      throw new Error(`Tarefa com ID ${id} não encontrada`);
    }
    
    this.saveAll(filteredTasks);
  }

  /**
   * Conta o número de tarefas que correspondem à query
   */
  async count(query?: Query<Task>): Promise<number> {
    const allTasks = this.load();
    const filteredTasks = allTasks.filter(task => matches(task, query?.spec));
    return filteredTasks.length;
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
   * Busca todas as tarefas (sem filtros)
   */
  async findAll(): Promise<Task[]> {
    return this.load();
  }

  /**
   * Limpa todas as tarefas (útil para testes)
   */
  async clear(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.key);
    }
  }

  /**
   * Importa tarefas (útil para migração)
   */
  async import(tasks: Task[]): Promise<void> {
    this.saveAll(tasks);
  }

  /**
   * Exporta todas as tarefas
   */
  async export(): Promise<Task[]> {
    return this.load();
  }
}
