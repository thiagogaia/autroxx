'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTaskContext } from '@/contexts/TaskContextV2';
import { TaskPriority, TaskCategory, TaskComplexity } from '@/types/task';

interface AdvancedFiltersProps {
  className?: string;
}

export function AdvancedFilters({ className }: AdvancedFiltersProps) {
  const { advancedFilters, setAdvancedFilters, resetFilters } = useTaskContext();
  const [isOpen, setIsOpen] = useState(false);

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'normal', label: 'Normal' },
    { value: 'media', label: 'Média' },
    { value: 'alta', label: 'Alta' }
  ];

  const categoryOptions: { value: TaskCategory; label: string }[] = [
    { value: 'feature', label: 'Feature' },
    { value: 'desenvolvimento', label: 'Desenvolvimento' },
    { value: 'qa', label: 'QA' },
    { value: 'devops', label: 'DevOps' },
    { value: 'bug', label: 'Bug' },
    { value: 'atendimento', label: 'Atendimento' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'juridico', label: 'Jurídico' },
    { value: 'design', label: 'Design' },
    { value: 'documentacao', label: 'Documentação' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'sem_categoria', label: 'Sem Categoria' },
    { value: 'outro', label: 'Outro' }
  ];

  const complexityOptions: { value: TaskComplexity; label: string }[] = [
    { value: 'simples', label: 'Simples' },
    { value: 'media', label: 'Média' },
    { value: 'complexa', label: 'Complexa' }
  ];

  const sortOptions = [
    { value: 'dataCadastro', label: 'Data de Cadastro' },
    { value: 'titulo', label: 'Título' },
    { value: 'prioridade', label: 'Prioridade' },
    { value: 'dataInicio', label: 'Data de Início' },
    { value: 'dataFim', label: 'Data de Fim' }
  ];

  const handleFilterChange = (key: keyof typeof advancedFilters, value: unknown) => {
    setAdvancedFilters({ [key]: value });
  };

  const handleArrayFilterChange = (key: 'priorityFilter' | 'categoryFilter' | 'complexityFilter' | 'tagsFilter', value: string, checked: boolean) => {
    const currentArray = advancedFilters[key] || [];
    if (checked) {
      setAdvancedFilters({ [key]: [...currentArray, value] });
    } else {
      setAdvancedFilters({ [key]: currentArray.filter(item => item !== value) });
    }
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | undefined) => {
    const currentRange = advancedFilters.dateRange || { start: null, end: null };
    setAdvancedFilters({
      dateRange: {
        ...currentRange,
        [type]: date || null
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (advancedFilters.titleSearch) count++;
    if (advancedFilters.dateRange?.start || advancedFilters.dateRange?.end) count++;
    if (advancedFilters.priorityFilter?.length) count++;
    if (advancedFilters.categoryFilter?.length) count++;
    if (advancedFilters.tagsFilter?.length) count++;
    if (advancedFilters.impedimentFilter !== null) count++;
    if (advancedFilters.complexityFilter?.length) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Campo de busca rápida */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={advancedFilters.titleSearch || ''}
            onChange={(e) => handleFilterChange('titleSearch', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botão de filtros avançados */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filtros Avançados</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtro por data */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Cadastro</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {advancedFilters.dateRange?.start ? (
                            format(advancedFilters.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            'Data inicial'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={advancedFilters.dateRange?.start || undefined}
                          onSelect={(date) => handleDateRangeChange('start', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {advancedFilters.dateRange?.end ? (
                            format(advancedFilters.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            'Data final'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={advancedFilters.dateRange?.end || undefined}
                          onSelect={(date) => handleDateRangeChange('end', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Filtro por prioridade */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <div className="flex flex-wrap gap-2">
                    {priorityOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={advancedFilters.priorityFilter?.includes(option.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayFilterChange('priorityFilter', option.value, !advancedFilters.priorityFilter?.includes(option.value))}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Filtro por categoria */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select
                    value={advancedFilters.categoryFilter?.[0] || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setAdvancedFilters({ categoryFilter: [] });
                      } else {
                        setAdvancedFilters({ categoryFilter: [value as TaskCategory] });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por complexidade */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Complexidade</label>
                  <div className="flex flex-wrap gap-2">
                    {complexityOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={advancedFilters.complexityFilter?.includes(option.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayFilterChange('complexityFilter', option.value, !advancedFilters.complexityFilter?.includes(option.value))}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Filtro por impedimento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Impedimento</label>
                  <div className="flex gap-2">
                    <Button
                      variant={advancedFilters.impedimentFilter === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('impedimentFilter', null)}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={advancedFilters.impedimentFilter === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('impedimentFilter', true)}
                    >
                      Com
                    </Button>
                    <Button
                      variant={advancedFilters.impedimentFilter === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('impedimentFilter', false)}
                    >
                      Sem
                    </Button>
                  </div>
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={advancedFilters.sortBy || 'dataCadastro'}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={advancedFilters.sortOrder || 'desc'}
                      onValueChange={(value) => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Crescente</SelectItem>
                        <SelectItem value="desc">Decrescente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                    Fechar
                  </Button>
                  <Button size="sm" onClick={() => setIsOpen(false)}>
                    Aplicar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
