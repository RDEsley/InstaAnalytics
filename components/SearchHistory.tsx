"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Copy, Filter, Calendar, User, CheckCircle, XCircle } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { SearchHistoryEntry, SearchHistoryFilters } from '@/lib/types';
import { format } from 'date-fns';

interface SearchHistoryProps {
  entries: SearchHistoryEntry[];
  filters: SearchHistoryFilters;
  onFiltersChange: (filters: SearchHistoryFilters) => void;
  totalPages: number;
}

export default function SearchHistory({
  entries,
  filters,
  onFiltersChange,
  totalPages,
}: SearchHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Procurar Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-2">
              <Input
                placeholder="Filter by username..."
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
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Data</SelectItem>
                <SelectItem value="username">Username</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.orderDirection}
              onValueChange={(value) =>
                handleFilterChange('orderDirection', value as 'asc' | 'desc')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Order" />
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
                <SelectValue placeholder="Resultado por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por page</SelectItem>
                <SelectItem value="10">10 por page</SelectItem>
                <SelectItem value="25">25 por page</SelectItem>
                <SelectItem value="50">50 por page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
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
                          {entry.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(entry.timestamp), 'PPpp')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyResult(entry.result)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {entry.status === 'success' && entry.result ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {entry.result.profile.followersCount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {entry.result.profile.followingCount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Following</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {entry.result.profile.postsCount.toLocaleString()}
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
                      {entry.error_message || 'Analysis failed'}
                    </p>
                  </div>
                )}

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
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', filters.page - 1)}
            disabled={filters.page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {filters.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', filters.page + 1)}
            disabled={filters.page >= totalPages}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}