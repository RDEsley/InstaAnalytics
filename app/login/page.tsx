'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LogIn, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { loginSchema, LoginFormData } from '@/lib/validationAuth';
import { signIn } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: authData, error: authError } = await signIn(data.email, data.password);

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (authData.user) {
        router.push('/');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Background Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Yellow circle - top right */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-400 rounded-full opacity-80"></div>
          
          {/* Teal triangle - top left */}
          <div className="absolute top-0 left-0 w-0 h-0 border-l-[200px] border-l-transparent border-r-[200px] border-r-transparent border-b-[200px] border-b-teal-500 opacity-90"></div>
          
          {/* Yellow triangle - bottom left */}
          <div className="absolute -bottom-10 -left-10 w-0 h-0 border-l-[150px] border-l-yellow-400 border-r-[150px] border-r-transparent border-t-[150px] border-t-transparent"></div>
          
          {/* Teal shape - bottom right */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500 transform rotate-45 translate-x-32 translate-y-32 opacity-80"></div>
          
          {/* Additional decorative elements */}
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-teal-300 rounded-full opacity-60"></div>
          <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-yellow-300 transform rotate-45 opacity-70"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left space-y-6"
              >
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold text-teal-600 tracking-wide">
                    BEM-VINDO
                  </h1>
                  <div className="w-32 h-1 bg-teal-600 mx-auto lg:mx-0"></div>
                </div>
                
                {/* Illustration */}
                <div className="relative mx-auto lg:mx-0 w-80 h-64 bg-white rounded-lg shadow-lg p-6 hidden lg:block">
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-teal-600 mb-2">BEM-VINDO</h3>
                    <div className="w-20 h-1 bg-teal-600 mx-auto"></div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full"></div>
                  <div className="absolute -top-2 -right-6 w-8 h-8 bg-teal-400 transform rotate-45"></div>
                </div>
              </motion.div>

              {/* Login Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-md mx-auto"
              >
                <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                  <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 bg-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">IA</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">Bem-vindo de volta</CardTitle>
                    <CardDescription className="text-gray-600">
                      Entre na sua conta para continuar
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                          <Alert variant="destructive" className="border-red-200 bg-red-50">
                            <AlertDescription className="text-red-700">{error}</AlertDescription>
                          </Alert>
                        )}

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Digite seu email"
                                  className="h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Senha</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua senha"
                                    className="h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500 pr-12"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="remember"
                              checked={rememberMe}
                              onCheckedChange={setRememberMe}
                              className="border-gray-300"
                            />
                            <label
                              htmlFor="remember"
                              className="text-sm text-gray-600 cursor-pointer"
                            >
                              Lembrar de mim
                            </label>
                          </div>
                          <Link
                            href="/forgot-password"
                            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Esqueceu a senha?
                          </Link>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Entrando...
                            </>
                          ) : (
                            <>
                              <LogIn className="mr-2 h-5 w-5" />
                              ENTRAR
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>

                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <Link href="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                          Cadastre-se aqui
                        </Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}