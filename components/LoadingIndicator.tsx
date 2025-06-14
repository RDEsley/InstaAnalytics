"use client"

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
  startTime: number;
  maxWaitTime?: number;
}

export default function LoadingIndicator({ 
  startTime, 
  maxWaitTime = 30000 
}: LoadingIndicatorProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let percentage = Math.min(95, Math.floor((elapsed / maxWaitTime) * 100));
      
      // Add some randomness to progress
      if (percentage < 90) {
        const jitter = Math.floor(Math.random() * 5);
        percentage = Math.min(90, percentage + jitter);
      }
      
      setProgress(percentage);
      
      if (elapsed >= maxWaitTime) {
        clearInterval(intervalId);
      }
    }, 500);
    
    return () => clearInterval(intervalId);
  }, [startTime, maxWaitTime]);
  
  return (
    <motion.div 
      className="w-full space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Analisando Perfil</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground italic mt-2">
        {progress < 30 ? "Connecting to Instagram..." : 
         progress < 60 ? "Fetching profile data..." : 
         progress < 80 ? "Analyzing engagement metrics..." : 
         "Calculating results..."}
      </p>
    </motion.div>
  );
}