"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Copy, Filter, Calendar, User, CheckCircle, XCircle, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SearchHistoryEntry, SearchHistoryFilters } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SearchHistoryProps {
  entries: SearchHistoryEntry[];
  filters: SearchHistoryFilters;
  onFiltersChange: (filters: SearchHistoryFilters) => void;
  totalPages: number;
  onEntryClick?: (entry: SearchHistoryEntry) => void;
  onClearHistory?: () => void;
}

export default function SearchHistory({
  entries,
  filters,
  onFiltersChange,
  totalPages,
  onEntryClick,
  onClearHistory,
}: SearchHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleCopyResult = (result: any) => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  const handleFilterChange = (key: keyof SearchHistoryFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: key === 'username' ? 1 : filters.page,
    });
  };

  const handleSearch = () => {
    handleFilterChange('username', searchTerm);
  };

  const handleEntryClick = (entry: SearchHistoryEntry) => {
    if (onEntryClick && entry.status === 'success') {
      onEntryClick(entry);
    }
  };

  const handleClearHistory = () => {
    if (onClearHistory) {
      onClearHistory();
      setShowClearDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Pesquisa
            </CardTitle>
            {entries.length > 0 && onClearHistory && (
              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Histórico
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Limpar Histórico de Pesquisas</DialogTitle>
                    <DialogDescription>
                      Tem certeza de que deseja limpar todo o histórico de pesquisas? Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleClearHistory}>
                      Limpar Histórico
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-2">
              <Input
                placeholder="Filtrar por usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select
              value={filters.orderBy}
              onValueChange={(value) =>
                handleFilterChange('orderBy', value as 'timestamp' | 'username')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Data</SelectItem>
                <SelectItem value="username">Usuário</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.orderDirection}
              onValueChange={(value) =>
                handleFilterChange('orderDirection', value as 'asc' | 'desc')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Crescente</SelectItem>
                <SelectItem value="desc">Decrescente</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.limit.toString()}
              onValueChange={(value) =>
                handleFilterChange('limit', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Resultados por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="25">25 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum histórico encontrado</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Nenhuma pesquisa encontrada com os filtros aplicados.' : 'Você ainda não fez nenhuma pesquisa.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`hover:shadow-md transition-all ${
                entry.status === 'success' && onEntryClick 
                  ? 'cursor-pointer hover:bg-gray-50' 
                  : ''
              } bg-white/90 backdrop-blur-sm`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center space-x-3 flex-1"
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          @{entry.username}
                          <Badge variant={entry.status === 'success' ? 'default' : 'destructive'}>
                            {entry.status === 'success' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {entry.status === 'success' ? 'Sucesso' : 'Erro'}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(entry.timestamp), 'PPpp', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.result && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyResult(entry.result)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar JSON
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {entry.status === 'success' && entry.result ? (
                    <div 
                      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {entry.result.profile.followersCount.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">Seguidores</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {entry.result.profile.followingCount.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">Seguindo</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {entry.result.profile.postsCount.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {entry.result.engagementMetrics.engagementRate.toFixed(2)}%
                        </p>
                        <p className="text-sm text-gray-500">Engajamento</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-red-700 text-sm">
                        {entry.error_message || 'Análise falhou'}
                      </p>
                    </div>
                  )}

                  {entry.result && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="result">
                        <AccordionTrigger>Ver Todos os Resultados</AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs">
                            <code>
                              {JSON.stringify(entry.result, null, 2)}
                            </code>
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}

        {/* Pagination */}
        {entries.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {filters.page} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page >= totalPages}
            >
              Próximo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}