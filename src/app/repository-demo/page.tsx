// repository-demo/page.tsx — Página de demonstração do novo padrão

import { TaskRepositoryDemo } from '@/components/TaskRepositoryDemo';

export default function RepositoryDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Specification/Query Object Pattern
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Demonstração do padrão Specification/Query Object implementado para abstrair 
          filtros, paginação e regras de consulta. Este padrão permite trocar de backend 
          (LocalStorage, SQLite, PostgreSQL, etc.) sem alterar o código de domínio.
        </p>
      </div>
      
      <TaskRepositoryDemo />
    </div>
  );
}
