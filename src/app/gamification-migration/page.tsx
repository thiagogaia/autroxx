// gamification-migration/page.tsx — Página de demonstração da migração
// Permite testar a migração de gamificação do localStorage para IndexedDB

import { GamificationMigrationDemo } from '@/components/GamificationMigrationDemo';

export default function GamificationMigrationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Migração de Gamificação</h1>
        <p className="text-gray-600">
          Demonstração da migração de dados de gamificação do localStorage para IndexedDB.
          Esta página permite testar o processo de migração e verificar o funcionamento offline.
        </p>
      </div>
      
      <GamificationMigrationDemo />
    </div>
  );
}
