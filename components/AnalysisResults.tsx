"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, 
  UserPlus, 
  Image as ImageIcon, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  BarChart3,
  ArrowUpRight,
  Award
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnalysisResult } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalysisResultsProps {
  data: AnalysisResult;
  onReset: () => void;
}

export default function AnalysisResults({ data, onReset }: AnalysisResultsProps) {
  const [tab, setTab] = useState<'overview' | 'engagement'>('overview');
  
  const { profile, posts, engagementMetrics, timestamp } = data;
  
  // Format timestamp
  const formattedTimestamp = format(new Date(timestamp), 'PPP', { locale: ptBR });
  
  // Format chart data - mostra os 5 posts com mais likes
  const chartData = posts
    .sort((a, b) => b.likesCount - a.likesCount)
    .slice(0, 5)
    .map((post, index) => ({
      id: `Post ${index + 1}`,
      likes: post.likesCount,
      comments: post.commentsCount,
    }));
  
  // Get engagement rating label
  const getEngagementRating = (rate: number) => {
    if (rate < 1) return 'Baixo';
    if (rate < 3) return 'Médio';
    if (rate < 6) return 'Bom';
    return 'Excelente';
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      {/* Profile Header */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-pink-200">
              <AvatarImage src={profile.profilePicUrl} alt={profile.username} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white text-xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold flex items-center gap-2 justify-center sm:justify-start">
                @{profile.username}
                {profile.isVerified && (
                  <span className="text-blue-500 bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                    <Award className="h-4 w-4" />
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground">{profile.fullName}</p>
              {profile.biography && (
                <p className="mt-2 text-sm line-clamp-2">{profile.biography}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                Seguidores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{profile.followersCount.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                Seguindo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{profile.followingCount.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{profile.postsCount.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{engagementMetrics.engagementRate.toFixed(2)}%</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <Button 
          variant={tab === 'overview' ? 'default' : 'ghost'} 
          onClick={() => setTab('overview')}
          className="rounded-none rounded-t-lg"
        >
          Visão Geral
        </Button>
        <Button 
          variant={tab === 'engagement' ? 'default' : 'ghost'} 
          onClick={() => setTab('engagement')}
          className="rounded-none rounded-t-lg"
        >
          Engajamento
        </Button>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-6">
        {tab === 'overview' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Best Performing Post */}
            {engagementMetrics.bestPerformingPost && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Post com Melhor Performance</CardTitle>
                  <CardDescription>Post com maior número de curtidas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {engagementMetrics.bestPerformingPost.mediaUrl && (
                      <div className="rounded-md overflow-hidden h-40 w-full sm:w-40 bg-muted flex items-center justify-center">
                        <img 
                          src={engagementMetrics.bestPerformingPost.mediaUrl} 
                          alt="Post com melhor performance" 
                          className="object-cover h-full w-full"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile.username}&background=random`;
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm line-clamp-3 mb-2">
                        {engagementMetrics.bestPerformingPost.caption || "Sem legenda"}
                      </p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{engagementMetrics.bestPerformingPost.likesCount.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span>{engagementMetrics.bestPerformingPost.commentsCount.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      {engagementMetrics.bestPerformingPost.locationName && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📍 {engagementMetrics.bestPerformingPost.locationName}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open(engagementMetrics.bestPerformingPost?.url, '_blank')}
                  >
                    Visualizar no Instagram
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Top Posts Chart */}
            {posts.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Top 5 Posts por Curtidas</CardTitle>
                  <CardDescription>Posts com maior engajamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="id" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            value.toLocaleString('pt-BR'), 
                            name === 'likes' ? 'Curtidas' : 'Comentários'
                          ]}
                        />
                        <Bar dataKey="likes" name="Curtidas" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="comments" name="Comentários" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Engagement Metrics */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Análises de Engajamento</CardTitle>
                <CardDescription>Métricas principais sobre interação do público</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Engagement Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-pink-500" />
                      Taxa de Engajamento
                    </h3>
                    <span className="text-sm font-bold">{engagementMetrics.engagementRate.toFixed(2)}%</span>
                  </div>
                  <div className="h-3 relative w-full rounded-full overflow-hidden bg-secondary">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                      style={{ width: `${Math.min(100, engagementMetrics.engagementRate * 10)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avaliação: <span className="font-medium">{getEngagementRating(engagementMetrics.engagementRate)}</span>
                  </p>
                </div>
                
                <Separator />
                
                {/* Average Metrics */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      Média de Curtidas por Post
                    </p>
                    <p className="text-2xl font-semibold">{Math.round(engagementMetrics.averageLikes).toLocaleString('pt-BR')}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Média de Comentários por Post
                    </p>
                    <p className="text-2xl font-semibold">{Math.round(engagementMetrics.averageComments).toLocaleString('pt-BR')}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Frequência de Posts
                    </p>
                    <p className="text-2xl font-semibold">{engagementMetrics.postingFrequency.toFixed(1)}<span className="text-sm text-muted-foreground ml-1">posts/mês</span></p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Proporção Seguidores/Seguindo
                    </p>
                    <p className="text-2xl font-semibold">
                      {profile.followingCount > 0 
                        ? (profile.followersCount / profile.followingCount).toFixed(1) 
                        : '∞'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Análise realizada em {formattedTimestamp}
        </p>
        <Button variant="outline" onClick={onReset}>
          Analisar outro Perfil
        </Button>
      </div>
    </motion.div>
  );
}