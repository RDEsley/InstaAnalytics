'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, Mail, Lock, User } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          {/* Large circular background elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-200/30 rounded-full translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-200/20 rounded-full"></div>
          
          {/* Decorative arrows */}
          <div className="absolute bottom-20 left-1/4 transform rotate-12">
            <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="text-yellow-400/60">
              <path d="M10 30 L90 30 M75 15 L90 30 L75 45" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="absolute bottom-32 right-1/3 transform -rotate-12">
            <svg width="100" height="50" viewBox="0 0 100 50" fill="none" className="text-yellow-400/60">
              <path d="M10 25 L75 25 M60 10 L75 25 L60 40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex">
          {/* Left Side - Illustration */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-md"
            >
              {/* Illustration Container */}
              <div className="relative">
                {/* Email/Document Icons */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute -top-8 -left-8 bg-yellow-200 p-3 rounded-lg shadow-lg"
                >
                  <Mail className="w-6 h-6 text-yellow-700" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="absolute -top-4 left-16 bg-blue-200 p-3 rounded-lg shadow-lg"
                >
                  <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                    <path d="M6 8h8v2H6V8zm0 3h6v1H6v-1z"/>
                  </svg>
                </motion.div>

                {/* Main Character */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="bg-white p-8 rounded-2xl shadow-xl"
                >
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Bem-vindo de volta!</h3>
                    <p className="text-gray-600 text-sm">Acesse sua conta para continuar</p>
                  </div>
                </motion.div>

                {/* Steps/Progress indicators */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="absolute -bottom-4 -left-4 flex space-x-2"
                >
                  <div className="w-8 h-2 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-2 bg-emerald-300 rounded-full"></div>
                  <div className="w-8 h-2 bg-emerald-200 rounded-full"></div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md"
            >
              <Card className="bg-emerald-600 border-0 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      Welcome To Family
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      A community of our hundreds of members
                      to share and send ideas
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Alert variant="destructive" className="bg-red-500/10 border-red-400 text-red-100">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300 w-5 h-5" />
                                <Input
                                  type="email"
                                  placeholder="Username/email"
                                  className="pl-10 bg-emerald-500/30 border-emerald-400/50 text-white placeholder:text-emerald-200 focus:border-emerald-300 focus:ring-emerald-300/50 rounded-lg h-12"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-emerald-100" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300 w-5 h-5" />
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Password"
                                  className="pl-10 pr-10 bg-emerald-500/30 border-emerald-400/50 text-white placeholder:text-emerald-200 focus:border-emerald-300 focus:ring-emerald-300/50 rounded-lg h-12"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-emerald-500/30 text-emerald-300"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isLoading}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-emerald-100" />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                            className="border-emerald-300 data-[state=checked]:bg-emerald-400 data-[state=checked]:border-emerald-400"
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm text-emerald-100 cursor-pointer"
                          >
                            Remember me
                          </label>
                        </div>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-emerald-200 hover:text-white transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-semibold h-12 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </form>
                  </Form>

                  <div className="text-center">
                    <p className="text-sm text-emerald-100">
                      Não tem uma conta?{' '}
                      <Link 
                        href="/register" 
                        className="text-white font-semibold hover:underline transition-all"
                      >
                        Cadastre-se aqui
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Back to home link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mt-6"
              >
                <Link 
                  href="/" 
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao início
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}