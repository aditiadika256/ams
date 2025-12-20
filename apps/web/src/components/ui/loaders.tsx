'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UploadCloud, DownloadCloud, CheckCircle2, AlertCircle, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------
// 1. Simple Spinner (for buttons, inline)
// ----------------------------------------------------------------------

interface SpinnerProps extends Omit<LucideProps, 'size'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white' | 'muted';
}

export const Spinner = ({ className, size = 'md', variant = 'primary', ...props }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    muted: 'text-muted-foreground',
  };

  return (
    <Loader2
      className={cn('animate-spin', sizeClasses[size], variantClasses[variant], className)}
      {...props}
    />
  );
};

// ----------------------------------------------------------------------
// 2. Page Loader (Full Screen Overlay)
// ----------------------------------------------------------------------

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="h-16 w-16 bg-primary"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-lg font-medium text-primary"
        >
          Memuat...
        </motion.p>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. Processing Loader (Modal-like for Actions)
// ----------------------------------------------------------------------

interface ProcessingLoaderProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  status?: 'processing' | 'success' | 'error';
}

export const ProcessingLoader = ({ 
  isOpen, 
  title = 'Memproses...', 
  description = 'Mohon tunggu sebentar',
  status = 'processing' 
}: ProcessingLoaderProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm rounded-xl bg-background p-6 shadow-2xl border border-border"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {status === 'processing' && (
                <div className="relative">
                  <motion.div
                    className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10" />
                  </div>
                </div>
              )}
              
              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                >
                  <CheckCircle2 className="h-8 w-8" />
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                >
                  <AlertCircle className="h-8 w-8" />
                </motion.div>
              )}

              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ----------------------------------------------------------------------
// 4. File Transfer Loader (Upload/Download)
// ----------------------------------------------------------------------

interface FileTransferLoaderProps {
  isOpen: boolean;
  type: 'upload' | 'download';
  fileName: string;
  progress: number; // 0-100
  onCancel?: () => void;
}

export const FileTransferLoader = ({ 
  isOpen, 
  type, 
  fileName, 
  progress,
  onCancel 
}: FileTransferLoaderProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-[50] w-full max-w-sm"
        >
          <div className="rounded-lg bg-background border border-border shadow-lg p-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-2 rounded-full",
                type === 'upload' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
              )}>
                {type === 'upload' ? <UploadCloud className="h-5 w-5" /> : <DownloadCloud className="h-5 w-5" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">{type === 'upload' ? 'Mengunggah...' : 'Mengunduh...'}</h4>
                  <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{fileName}</p>
                
                {/* Progress Bar */}
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    className={cn(
                      "h-full rounded-full",
                      type === 'upload' ? "bg-blue-600" : "bg-green-600"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
