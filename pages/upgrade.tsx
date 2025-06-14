'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Star, ArrowLeft, Zap, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
}

export default function UpgradePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Pessoal',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para uso pessoal e exploração básica',
      icon: <Zap className="w-6 h-6" />,
      features: [
        '5 análises por mês',
        'Métricas básicas de engajamento',
        'Histórico de 30 dias',
        'Suporte por email',
        'Análise de até 10 posts',
      ],
      buttonText: 'Plano Atual',
      buttonVariant: 'outline',
    },
    {
      id: 'plus',
      name: 'Plus',
      price: 'R$ 29',
      period: '/mês',
      description: 'Ideal para influenciadores e pequenas empresas',
      icon: <Star className="w-6 h-6" />,
      popular: true,
      features: [
        '50 análises por mês',
        'Análise avançada de sentimentos',
        'Comparação de concorrentes',
        'Histórico ilimitado',
        'Rastreamento de performance de posts',
        'Insights de audiência',
        'Efetividade de hashtags',
        'Relatórios em PDF',
        'Suporte prioritário',
      ],
      buttonText: 'Upgrade para Plus',
      buttonVariant: 'default',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 79',
      period: '/mês',
      description: 'Para agências e empresas que precisam de análises completas',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Análises ilimitadas',
        'Todas as funcionalidades do Plus',
        'API de acesso aos dados',
        'Análise de múltiplos perfis',
        'Dashboard personalizado',
        'Integração com outras redes sociais',
        'Relatórios automatizados',
        'Suporte 24/7',
        'Gerenciador de conta dedicado',
      ],
      buttonText: 'Upgrade para Pro',
      buttonVariant: 'default',
    },
  ];

  const handleUpgrade = (planId: string) => {
    // Here you would integrate with your payment processor
    console.log(`Upgrading to ${planId} plan`);
    // For now, just show an alert
    alert(`Funcionalidade de upgrade para o plano ${planId} será implementada em breve!`);
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-[url('')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/30 to-purple-900/20 backdrop-blur-[1px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">IA</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">InstaAnalytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-100/80 backdrop-blur-sm text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Desbloqueie todo o potencial do InstaAnalytics</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Escolha seu
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Plano</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Obtenha insights mais profundos, análises avançadas e recursos exclusivos para impulsionar seu crescimento no Instagram
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {tier.popular && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    tier.popular 
                      ? 'ring-2 ring-blue-500 bg-white/95' 
                      : 'bg-white/90 hover:bg-white/95'
                  }`}>
                    <CardHeader className="text-center pb-4">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                        tier.popular 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tier.icon}
                      </div>
                      <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                      <CardDescription className="text-gray-600">{tier.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                        <span className="text-gray-600">{tier.period}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <ul className="space-y-3 mb-8">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className={`w-full ${
                          tier.popular 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                            : ''
                        }`}
                        variant={currentPlan === tier.id ? 'outline' : tier.buttonVariant}
                        disabled={currentPlan === tier.id}
                        onClick={() => handleUpgrade(tier.id)}
                      >
                        {currentPlan === tier.id ? 'Plano Atual' : tier.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Features Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Por que escolher o InstaAnalytics?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Análises Instantâneas</h3>
                  <p className="text-gray-600">
                    Obtenha insights detalhados sobre qualquer perfil do Instagram em segundos
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dados Precisos</h3>
                  <p className="text-gray-600">
                    Métricas confiáveis e atualizadas para tomar decisões informadas
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Suporte Premium</h3>
                  <p className="text-gray-600">
                    Atendimento especializado para ajudar você a crescer no Instagram
                  </p>
                </div>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Dúvidas sobre os planos?
              </h2>
              <p className="text-gray-600 mb-8">
                Entre em contato conosco e nossa equipe terá prazer em ajudar você a escolher o melhor plano
              </p>
              <Button variant="outline" size="lg">
                Falar com Especialista
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}