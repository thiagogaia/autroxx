'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Code, Bug, Lightbulb, GitBranch } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onTaskLinkClick?: (taskId: number) => void;
}

// Templates pré-definidos
const TEMPLATES = {
  bug: {
    name: 'Bug Report',
    icon: Bug,
    content: `## 🐛 Bug Report

### Descrição
Descreva o bug de forma clara e concisa.

### Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

### Comportamento Esperado
Descreva o que deveria acontecer.

### Comportamento Atual
Descreva o que está acontecendo.

### Screenshots
Se aplicável, adicione screenshots para ajudar a explicar o problema.

### Ambiente
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: 1.0.0]

### Checklist
- [ ] Bug reproduzível
- [ ] Screenshots adicionados
- [ ] Ambiente documentado
- [ ] Descrição clara`
  },
  feature: {
    name: 'Feature Request',
    icon: Lightbulb,
    content: `## 💡 Feature Request

### Descrição
Descreva a funcionalidade que você gostaria de ver implementada.

### Problema
Qual problema esta feature resolveria?

### Solução Proposta
Descreva como você gostaria que funcionasse.

### Alternativas Consideradas
Descreva outras soluções ou funcionalidades que você considerou.

### Benefícios
- Benefício 1
- Benefício 2
- Benefício 3

### Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

### Prioridade
- [ ] Baixa
- [ ] Normal
- [ ] Alta
- [ ] Crítica`
  },
  review: {
    name: 'Code Review',
    icon: GitBranch,
    content: `## 🔍 Code Review

### Arquivos Alterados
- \`arquivo1.ts\`
- \`arquivo2.tsx\`

### Resumo das Mudanças
Descreva brevemente o que foi alterado.

### Checklist de Review
- [ ] Código segue os padrões do projeto
- [ ] Testes unitários passando
- [ ] Documentação atualizada
- [ ] Performance verificada
- [ ] Segurança validada
- [ ] Acessibilidade considerada

### Pontos de Atenção
- Ponto 1
- Ponto 2
- Ponto 3

### Sugestões
- Sugestão 1
- Sugestão 2

### Aprovação
- [ ] Aprovado
- [ ] Aprovado com ressalvas
- [ ] Rejeitado`
  }
};

export function MarkdownEditor({ value, onChange, placeholder, className, onTaskLinkClick }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Função para aplicar template
  const applyTemplate = useCallback((templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    onChange(template.content);
  }, [onChange]);

  // Função para contar checkboxes
  const getCheckboxStats = useCallback((text: string) => {
    const totalCheckboxes = (text.match(/- \[[ x]\]/g) || []).length;
    const checkedCheckboxes = (text.match(/- \[x\]/g) || []).length;
    return { total: totalCheckboxes, checked: checkedCheckboxes };
  }, []);

  const checkboxStats = getCheckboxStats(value);

  // Função para atualizar checkbox específico
  const updateCheckbox = useCallback((lineIndex: number, isChecked: boolean) => {
    const lines = value.split('\n');
    const targetLine = lines[lineIndex];
    
    if (targetLine && targetLine.match(/^- \[[ x]\]/)) {
      const newLine = targetLine.replace(/^- \[[ x]\]/, `- [${isChecked ? 'x' : ' '}]`);
      lines[lineIndex] = newLine;
      onChange(lines.join('\n'));
    }
  }, [value, onChange]);

  // Componente customizado para renderizar listas com checkboxes interativos
  const ListItemComponent = ({ children, ...props }: any) => {
    const firstChild = children?.[0];
    
    // O remark-gfm já converteu em input element!
    if (firstChild?.type === 'input' && firstChild?.props?.type === 'checkbox') {
      const isChecked = firstChild.props.checked;
      
      // Extrair o texto do label (children[2] é o texto, children[1] é o espaço)
      let labelText = '';
      for (let i = 1; i < children.length; i++) {
        const child = children[i];
        if (typeof child === 'string') {
          labelText += child;
        } else if (child?.props?.children) {
          labelText += child.props.children;
        }
      }
      
      return (
        <li {...props}>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                // Encontrar e atualizar a linha correspondente
                const lines = value.split('\n');
                const targetIndex = lines.findIndex(line => 
                  line.includes(labelText.trim())
                );
                
                if (targetIndex !== -1) {
                  const newLine = lines[targetIndex].replace(
                    /^- \[[ x]\]/, 
                    `- [${e.target.checked ? 'x' : ' '}]`
                  );
                  lines[targetIndex] = newLine;
                  onChange(lines.join('\n'));
                }
              }}
              className="mr-2 cursor-pointer"
            />
            <span>{labelText}</span>
          </label>
        </li>
      );
    }
    
    // Renderização padrão para itens de lista sem checkbox
    return <li {...props}>{children}</li>;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Templates */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground">Templates:</span>
        {Object.entries(TEMPLATES).map(([key, template]) => {
          const Icon = template.icon;
          return (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => applyTemplate(key as keyof typeof TEMPLATES)}
              className="h-8 text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {template.name}
            </Button>
          );
        })}
      </div>

      {/* Stats de Checkboxes */}
      {checkboxStats.total > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Progresso: {checkboxStats.checked}/{checkboxStats.total}
          </Badge>
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${checkboxStats.total > 0 ? (checkboxStats.checked / checkboxStats.total) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Editor */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] font-mono text-sm"
          />
          <div className="mt-2 text-xs text-muted-foreground">
            💡 Use Markdown para formatação. Ex: **negrito**, *itálico*, `código`, - [ ] checkbox
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <div className="min-h-[200px] p-4 border rounded-md bg-background">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                li: ListItemComponent,
                // Interceptar inputs de checkbox diretamente
                input: (props: any) => {
                  if (props.type === 'checkbox') {
                    const isChecked = props.checked;
                    
                    return (
                      <input
                        {...props}
                        disabled={false} // Remover disabled
                        onChange={(e) => {
                          // Encontrar e atualizar a linha correspondente
                          const lines = value.split('\n');
                          // Buscar por linhas com checkbox
                          const checkboxLines = lines.map((line, index) => ({ 
                            line, 
                            index,
                            hasCheckbox: line.match(/^- \[[ x]\]/)
                          })).filter(item => item.hasCheckbox);
                          
                          // Encontrar o checkbox baseado na ordem
                          const checkboxIndex = Array.from(document.querySelectorAll('input[type="checkbox"]'))
                            .indexOf(e.target as HTMLInputElement);
                          
                          if (checkboxIndex >= 0 && checkboxIndex < checkboxLines.length) {
                            const targetLine = checkboxLines[checkboxIndex];
                            const newLine = targetLine.line.replace(
                              /^- \[[ x]\]/, 
                              `- [${e.target.checked ? 'x' : ' '}]`
                            );
                            lines[targetLine.index] = newLine;
                            onChange(lines.join('\n'));
                          }
                        }}
                        className="mr-2 cursor-pointer"
                      />
                    );
                  }
                  
                  return <input {...props} />;
                },
                // Componente para links de tarefas (#123)
                a({ href, children, ...props }) {
                  // Verificar se é um link de tarefa (#123)
                  const taskMatch = href?.match(/^#(\d+)$/);
                  if (taskMatch && onTaskLinkClick) {
                    const taskId = parseInt(taskMatch[1]);
                    return (
                      <button
                        onClick={() => onTaskLinkClick(taskId)}
                        className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                        {...props}
                      >
                        {children}
                      </button>
                    );
                  }
                  // Links normais
                  return (
                    <a href={href} className="text-blue-600 hover:text-blue-800 underline" {...props}>
                      {children}
                    </a>
                  );
                },
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-2">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-muted-foreground pl-4 italic mb-2">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-3 py-2 bg-muted font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-3 py-2">
                    {children}
                  </td>
                ),
              }}
            >
              {value || '*Nenhum conteúdo para preview*'}
            </ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
