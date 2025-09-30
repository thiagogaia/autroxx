// util.ts — helpers de filtro/ordenação/paginação sobre arrays

import { Spec, FilterRule, FilterOp, SortDir, PageRequest, Page } from '@/types/domain';

/**
 * Verifica se um registro corresponde a uma especificação
 */
export function matches<T>(row: T, spec?: Spec<T>): boolean {
  if (!spec) return true;
  
  const passWhere = (w?: FilterRule<T>[]) =>
    (w ?? []).every(r => compare((row as Record<string, unknown>)[r.field as string], r.op, r.value));

  const andOk = (spec.and ?? []).every(s => matches(row, s));
  const orOk = (spec.or ?? []).length ? (spec.or ?? []).some(s => matches(row, s)) : true;
  const notOk = spec.not ? !matches(row, spec.not) : true;

  return passWhere(spec.where) && andOk && orOk && notOk;
}

/**
 * Compara valores baseado na operação especificada
 */
function compare(a: unknown, op: FilterOp, b: unknown): boolean {
  switch (op) {
    case "eq": return a === b;
    case "neq": return a !== b;
    case "gt": 
      if (typeof a === 'number' && typeof b === 'number') return a > b;
      if (typeof a === 'string' && typeof b === 'string') return a > b;
      if (a instanceof Date && b instanceof Date) return a > b;
      return false;
    case "lt": 
      if (typeof a === 'number' && typeof b === 'number') return a < b;
      if (typeof a === 'string' && typeof b === 'string') return a < b;
      if (a instanceof Date && b instanceof Date) return a < b;
      return false;
    case "gte": 
      if (typeof a === 'number' && typeof b === 'number') return a >= b;
      if (typeof a === 'string' && typeof b === 'string') return a >= b;
      if (a instanceof Date && b instanceof Date) return a >= b;
      return false;
    case "lte": 
      if (typeof a === 'number' && typeof b === 'number') return a <= b;
      if (typeof a === 'string' && typeof b === 'string') return a <= b;
      if (a instanceof Date && b instanceof Date) return a <= b;
      return false;
    case "contains": 
      if (typeof a === "string") {
        return a.toLowerCase().includes(String(b).toLowerCase());
      }
      if (Array.isArray(a)) {
        return a.includes(b);
      }
      return false;
    case "in": 
      return Array.isArray(b) ? b.includes(a) : false;
    case "between":
      if (!Array.isArray(b) || b.length !== 2) return false;
      const [start, end] = b;
      if (typeof a === 'number' && typeof start === 'number' && typeof end === 'number') {
        return a >= start && a <= end;
      }
      if (typeof a === 'string' && typeof start === 'string' && typeof end === 'string') {
        return a >= start && a <= end;
      }
      if (a instanceof Date && start instanceof Date && end instanceof Date) {
        return a >= start && a <= end;
      }
      return false;
    case "is_null":
      return a === null || a === undefined;
    case "is_not_null":
      return a !== null && a !== undefined;
    default:
      return false;
  }
}

/**
 * Ordena array baseado nas especificações de ordenação
 */
export function sortArray<T>(rows: T[], sort?: { field: keyof T; dir: SortDir }[]) {
  if (!sort?.length) return rows;
  
  return [...rows].sort((a, b) => {
    for (const s of sort) {
      const av = a[s.field];
      const bv = b[s.field];
      
      // Tratar valores nulos/undefined
      if (av === null || av === undefined) {
        if (bv === null || bv === undefined) continue;
        return s.dir === "asc" ? -1 : 1;
      }
      if (bv === null || bv === undefined) {
        return s.dir === "asc" ? 1 : -1;
      }
      
      // Comparação normal
      if (av < bv) return s.dir === "asc" ? -1 : 1;
      if (av > bv) return s.dir === "asc" ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Aplica paginação a um array
 */
export function paginate<T>(rows: T[], page: { page: number; size: number } = { page: 1, size: 10 }): Page<T> {
  const p = Math.max(1, page.page);
  const size = Math.max(1, page.size);
  const start = (p - 1) * size;
  
  return { 
    items: rows.slice(start, start + size), 
    total: rows.length, 
    page: p, 
    size 
  };
}

/**
 * Converte TaskFilters para Specification (compatibilidade com sistema atual)
 */
export function taskFiltersToSpec(filters: Record<string, unknown>): Spec<Record<string, unknown>> {
  const spec: Spec<Record<string, unknown>> = { where: [] };
  
  if (!spec.where) spec.where = [];
  
  // Filtro por status
  if (filters.statusFilter && filters.statusFilter !== 'tudo') {
    if (filters.statusFilter === 'a_fazer') {
      spec.where.push({ field: 'statusAtual', op: 'eq', value: 'a_fazer' });
    } else if (filters.statusFilter === 'fazendo') {
      spec.where.push({ field: 'statusAtual', op: 'eq', value: 'fazendo' });
    } else if (filters.statusFilter === 'concluido') {
      spec.where.push({ field: 'statusAtual', op: 'eq', value: 'concluido' });
    } else if (filters.statusFilter === 'normal') {
      spec.where.push({ field: 'prioridade', op: 'eq', value: 'normal' });
      spec.where.push({ field: 'statusAtual', op: 'neq', value: 'concluido' });
    } else if (filters.statusFilter === 'urgente') {
      spec.where.push({ field: 'prioridade', op: 'eq', value: 'alta' });
      spec.where.push({ field: 'statusAtual', op: 'neq', value: 'concluido' });
    }
  }
  
  // Filtro por título
  if (filters.titleSearch && typeof filters.titleSearch === 'string') {
    spec.where.push({ field: 'titulo', op: 'contains', value: filters.titleSearch });
  }
  
  // Filtro por data
  const dateRange = filters.dateRange as { start?: Date | null; end?: Date | null } | undefined;
  if (dateRange?.start || dateRange?.end) {
    if (dateRange.start && dateRange.end) {
      spec.where.push({ 
        field: 'dataCadastro', 
        op: 'between', 
        value: [dateRange.start, dateRange.end] 
      });
    } else if (dateRange.start) {
      spec.where.push({ field: 'dataCadastro', op: 'gte', value: dateRange.start });
    } else if (dateRange.end) {
      spec.where.push({ field: 'dataCadastro', op: 'lte', value: dateRange.end });
    }
  }
  
  // Filtro por prioridade
  const priorityFilter = filters.priorityFilter as string[] | undefined;
  if (priorityFilter && Array.isArray(priorityFilter) && priorityFilter.length > 0) {
    spec.where.push({ field: 'prioridade', op: 'in', value: priorityFilter });
  }
  
  // Filtro por categoria
  const categoryFilter = filters.categoryFilter as string[] | undefined;
  if (categoryFilter && Array.isArray(categoryFilter) && categoryFilter.length > 0) {
    spec.where.push({ field: 'categoria', op: 'in', value: categoryFilter });
  }
  
  // Filtro por tags
  const tagsFilter = filters.tagsFilter as string[] | undefined;
  if (tagsFilter && Array.isArray(tagsFilter) && tagsFilter.length > 0) {
    // Para tags, precisamos de uma lógica especial pois é um array
    spec.and = spec.and || [];
    tagsFilter.forEach((tag: string) => {
      spec.and!.push({ where: [{ field: 'tags', op: 'contains', value: tag }] });
    });
  }
  
  // Filtro por impedimento
  if (filters.impedimentFilter !== null && filters.impedimentFilter !== undefined) {
    spec.where.push({ field: 'impedimento', op: 'eq', value: filters.impedimentFilter });
  }
  
  // Filtro por complexidade
  const complexityFilter = filters.complexityFilter as string[] | undefined;
  if (complexityFilter && Array.isArray(complexityFilter) && complexityFilter.length > 0) {
    spec.where.push({ field: 'complexidade', op: 'in', value: complexityFilter });
  }
  
  return spec;
}

/**
 * Converte TaskFilters para PageRequest (compatibilidade com sistema atual)
 */
export function taskFiltersToPageRequest(filters: Record<string, unknown>): PageRequest {
  const sort: { field: string; dir: SortDir }[] = [];
  
  if (filters.sortBy && typeof filters.sortBy === 'string') {
    sort.push({
      field: filters.sortBy,
      dir: (filters.sortOrder || 'desc') as SortDir
    });
  }
  
  return {
    page: 1,
    size: 10,
    sort: sort.length > 0 ? sort as any : undefined
  };
}

/**
 * Helper para criar queries simples
 */
export function createQuery<T>(spec?: Spec<T>, page?: PageRequest): { spec?: Spec<T>; page?: PageRequest } {
  return { spec, page };
}

/**
 * Helper para criar filtros simples
 */
export function createFilter<T>(field: keyof T, op: FilterOp, value: unknown): FilterRule<T> {
  return { field, op, value };
}

/**
 * Helper para criar especificações AND
 */
export function createAndSpec<T>(...specs: Spec<T>[]): Spec<T> {
  return { and: specs };
}

/**
 * Helper para criar especificações OR
 */
export function createOrSpec<T>(...specs: Spec<T>[]): Spec<T> {
  return { or: specs };
}
