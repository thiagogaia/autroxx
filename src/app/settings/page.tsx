// SettingsPage.tsx — Página de configurações do sistema
// Inclui seletor de storage e outras configurações

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageSelector } from '@/components/StorageSelector';
import { useStorageContext } from '@/contexts/TaskProviderWrapper';
import { Settings, Database, HardDrive, Info } from 'lucide-react';

export default function SettingsPage() {
  const { storageType, setStorageType } = useStorageContext();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configure o sistema de gerenciamento de tarefas
          </p>
        </div>
      </div>

      <Tabs defaultValue="storage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Armazenamento
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Sincronização
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Sobre
          </TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Armazenamento</CardTitle>
              <CardDescription>
                Escolha como os dados das tarefas serão armazenados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StorageSelector 
                currentStorage={storageType}
                onStorageChange={setStorageType}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações sobre os Tipos de Armazenamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    LocalStorage
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Armazenamento simples e rápido</li>
                    <li>• Sincronização imediata</li>
                    <li>• Sem configuração necessária</li>
                    <li>• Limite de ~5-10MB</li>
                    <li>• Ideal para projetos pequenos</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    IndexedDB
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Banco de dados local avançado</li>
                    <li>• Funciona offline-first</li>
                    <li>• Queries paginadas otimizadas</li>
                    <li>• Sincronização posterior</li>
                    <li>• Sem limite prático de tamanho</li>
                    <li>• Ideal para projetos grandes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronização</CardTitle>
              <CardDescription>
                Configure como os dados são sincronizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  A sincronização automática está ativa quando você está online. 
                  Quando offline, os dados são salvos localmente e sincronizados 
                  automaticamente quando a conexão for restaurada.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Sistema</CardTitle>
              <CardDescription>
                Informações sobre o Task Manager MVP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Versão</h4>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Tecnologias</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Next.js 15</li>
                  <li>• React 19</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• shadcn/ui</li>
                  <li>• Dexie.js (IndexedDB)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Funcionalidades</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gerenciamento de tarefas com drag & drop</li>
                  <li>• Filtros avançados e paginação</li>
                  <li>• Sistema de gamificação</li>
                  <li>• Armazenamento offline-first</li>
                  <li>• Sincronização automática</li>
                  <li>• Métricas e insights</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
