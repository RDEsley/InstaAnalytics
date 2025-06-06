"use client"

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loader2, Search } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formSchema } from '@/lib/validation';
import { analyzeInstagramProfile } from '@/lib/api';
import { FormData } from '@/lib/types';

interface InstagramFormProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (data: any) => void;
  onError: (error: string) => void;
}

export default function InstagramForm({
  onAnalysisStart,
  onAnalysisComplete,
  onError
}: InstagramFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      onAnalysisStart();
      
      const response = await analyzeInstagramProfile(data);
      
      if (response.success && response.data) {
        onAnalysisComplete(response.data);
      } else {
        onError(response.message || 'Failed to analyze profile');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Enter Instagram username"
                      className="pl-12 pr-24 h-14 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      {...field}
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 px-6 rounded-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze'
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-center text-sm text-gray-500">
            Enter any public Instagram username to generate analytics
          </p>
        </form>
      </Form>
    </motion.div>
  );
}