'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-200/30 rounded-full"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-teal-200/40 rounded-full"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-cyan-200/25 rounded-full"></div>
          <div className="absolute bottom-20 right-1/3 w-8 h-8 bg-blue-300/35 rounded-full"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex">
          {/* Left Side - Illustration */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-md relative"
            >
              {/* Background illustration area */}
              <div className="relative">
                {/* Mountains/hills background */}
                <div className="absolute bottom-0 left-0 right-0 h-32">
                  <svg viewBox="0 0 400 120" className="w-full h-full">
                    <path d="M0,120 L0,80 Q100,60 200,70 T400,80 L400,120 Z" fill="#e0f2fe" opacity="0.6"/>
                    <path d="M0,120 L0,90 Q150,70 300,85 T400,90 L400,120 Z" fill="#bae6fd" opacity="0.8"/>
                  </svg>
                </div>

                {/* Trees/plants */}
                <div className="absolute bottom-8 left-8">
                  <div className="w-6 h-16 bg-teal-400 rounded-full transform rotate-12"></div>
                  <div className="w-4 h-12 bg-teal-500 rounded-full transform -rotate-6 ml-2 -mt-8"></div>
                </div>
                <div className="absolute bottom-12 right-12">
                  <div className="w-8 h-20 bg-emerald-400 rounded-full transform -rotate-12"></div>
                  <div className="w-5 h-14 bg-emerald-500 rounded-full transform rotate-6 ml-3 -mt-12"></div>
                </div>

                {/* Chat bubble */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute top-4 left-4 bg-white p-3 rounded-2xl shadow-lg"
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                  </div>
                </motion.div>

                {/* Main character illustration */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative z-10"
                >
                  {/* Person with laptop */}
                  <div className="relative">
                    {/* Body */}
                    <div className="w-32 h-40 mx-auto">
                      {/* Head */}
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full mx-auto mb-2 relative">
                        {/* Hair */}
                        <div className="absolute -top-2 left-2 w-12 h-12 bg-indigo-800 rounded-full"></div>
                        <div className="absolute top-1 left-6 w-8 h-8 bg-indigo-900 rounded-full"></div>
                      </div>
                      
                      {/* Torso */}
                      <div className="w-20 h-24 bg-gradient-to-b from-teal-400 to-teal-500 rounded-t-3xl mx-auto relative">
                        {/* Arms */}
                        <div className="absolute -left-3 top-4 w-6 h-16 bg-teal-400 rounded-full transform -rotate-12"></div>
                        <div className="absolute -right-3 top-4 w-6 h-16 bg-teal-400 rounded-full transform rotate-12"></div>
                      </div>
                      
                      {/* Legs */}
                      <div className="flex justify-center space-x-2 -mt-2">
                        <div className="w-8 h-20 bg-indigo-700 rounded-full"></div>
                        <div className="w-8 h-20 bg-indigo-700 rounded-full"></div>
                      </div>
                    </div>

                    {/* Laptop */}
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 translate-y-4">
                      <div className="w-16 h-12 bg-gray-300 rounded-lg relative">
                        <div className="w-14 h-10 bg-gray-800 rounded-md absolute top-1 left-1"></div>
                        <div className="w-2 h-2 bg-white rounded-full absolute bottom-1 left-1/2 transform -translate-x-1/2"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative plant pot */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="absolute bottom-0 left-0"
                >
                  <div className="w-12 h-8 bg-indigo-600 rounded-b-full"></div>
                  <div className="w-8 h-12 bg-green-500 rounded-full mx-auto -mt-2"></div>
                  <div className="w-6 h-8 bg-green-400 rounded-full mx-auto -mt-6"></div>
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
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
                <CardHeader className="text-center pb-6 pt-8">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                      Welcome To Family
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      A community of our hundreds of members
                      <br />
                      to share and send ideas
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent className="space-y-6 px-8 pb-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
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
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                  type="email"
                                  placeholder="Username/email"
                                  className="pl-12 pr-4 h-14 bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl text-base"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
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
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Password"
                                  className="pl-12 pr-12 h-14 bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl text-base"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 text-gray-400"
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
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                            className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            Remember me
                          </label>
                        </div>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-14 rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-base"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </form>
                  </Form>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Não tem uma conta?{' '}
                      <Link 
                        href="/register" 
                        className="text-indigo-600 font-semibold hover:text-indigo-700 transition-all"
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
                  className="inline-flex items-center text-gray-600 hover:text-gray-700 transition-colors"
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