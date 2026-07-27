'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/store/useExamStore';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Spinner, PageLoader } from '@/components/ui/loaders';
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { alertActions } from '@/store/useAlertStore';
import { getErrorMessage } from '@/lib/get-error-message';

export default function ExamSessionPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId: attemptIdStr } = use(params);
  const router = useRouter();
  const attemptId = parseInt(attemptIdStr);
  
  const { 
    questions, 
    currentQuestionIndex, 
    setQuestions, 
    setCurrentQuestionIndex, 
    setAnswer, 
    toggleFlag,
    timeLeft,
    setTimeLeft,
    decrementTime
  } = useExamStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiClient.cbt.getQuestions(attemptId);
        if (res.success && res.data) {
          setQuestions(res.data);
          setTimeLeft(120 * 60); // Mock 2 hours
        } else {
          setError(res.message || 'Gagal memuat soal');
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat soal');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [attemptId, setQuestions, setTimeLeft]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      decrementTime();
    }, 1000);
    return () => clearInterval(timer);
  }, [decrementTime]);

  // Proctoring: Heartbeat and Events
  useEffect(() => {
    if (!attemptId) return;

    // Heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      apiClient.cbt.heartbeat(attemptId).catch(() => {});
    }, 30000);

    // Event listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        apiClient.cbt.logEvent(attemptId, 'visibility_hidden', { timestamp: new Date().toISOString() }).catch(() => {});
      } else {
        apiClient.cbt.logEvent(attemptId, 'visibility_visible', { timestamp: new Date().toISOString() }).catch(() => {});
      }
    };

    const handleBlur = () => {
      apiClient.cbt.logEvent(attemptId, 'window_blur', { timestamp: new Date().toISOString() }).catch(() => {});
    };

    const handleFocus = () => {
      apiClient.cbt.logEvent(attemptId, 'window_focus', { timestamp: new Date().toISOString() }).catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [attemptId]);

  // Auto-submit on time up
  useEffect(() => {
    if (timeLeft === 0 && !isLoading && questions.length > 0) {
      handleSubmitExam();
    }
  }, [timeLeft]);

  // Autosave answer
  const handleAnswerSelect = useCallback(async (answer: string) => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    setAnswer(currentQ.id, answer);

    try {
      await apiClient.cbt.saveAnswer(attemptId, currentQ.question_id, answer);
    } catch (err) {
      console.error('Autosave failed', err);
    }
  }, [attemptId, questions, currentQuestionIndex, setAnswer]);

  const handleSubmitExam = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menyelesaikan ujian? Tindakan ini tidak dapat dibatalkan.")) {
        return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.cbt.submitExam(attemptId);
      if (res.success) {
        alertActions.success(
          'Ujian berhasil dikumpulkan',
          `Jawaban untuk attempt #${attemptId} berhasil dikirim.`
        );
        router.push(`/exams/result/${attemptId}`);
      } else {
        alertActions.error('Gagal mengumpulkan ujian', res.message || 'Jawaban ujian gagal dikirim.');
      }
    } catch (err: any) {
      alertActions.error(
        'Gagal mengumpulkan ujian',
        getErrorMessage(err, 'Terjadi kesalahan saat mengirim jawaban.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageLoader message="Memuat soal ujian..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold text-destructive">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push('/exams')}>Kembali</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Navigation */}
      <aside className="w-64 border-r bg-muted/20 flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Navigasi Soal</h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => (
              <Button
                key={q.id}
                variant={currentQuestionIndex === idx ? "default" : q.user_answer ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "w-10 h-10 p-0 relative",
                  q.flagged && "border-yellow-500 border-2"
                )}
                onClick={() => setCurrentQuestionIndex(idx)}
              >
                {idx + 1}
                {q.flagged && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full -mr-1 -mt-1" />
                )}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="w-3 h-3 bg-primary rounded-full mr-2" /> Sekarang
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="w-3 h-3 bg-secondary rounded-full mr-2" /> Dijawab
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="w-3 h-3 border border-input rounded-full mr-2" /> Belum Dijawab
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="w-3 h-3 border-2 border-yellow-500 rounded-full mr-2" /> Ragu-ragu
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
          <div className="font-semibold text-lg">
            Soal No. {currentQuestionIndex + 1}
          </div>
          <div className="flex items-center space-x-4">
            <div className={cn(
              "flex items-center font-mono text-xl font-bold px-4 py-2 rounded-md bg-muted",
              timeLeft < 300 && "text-destructive bg-destructive/10"
            )}>
              <Clock className="mr-2 h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
            
            <Button variant="destructive" onClick={handleSubmitExam} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" variant="white" className="mr-2" /> Memproses...
                </>
              ) : "Selesai Ujian"}
            </Button>
          </div>
        </header>

        {/* Question Area */}
        <div className="flex-1 overflow-auto p-6">
          <Card className="max-w-4xl mx-auto h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                 <div className="prose dark:prose-invert max-w-none text-lg">
                   {currentQuestion?.stem}
                 </div>
                 <Button 
                   variant="ghost" 
                   size="icon"
                   className={cn(currentQuestion?.flagged ? "text-yellow-500" : "text-muted-foreground")}
                   onClick={() => toggleFlag(currentQuestion.id)}
                 >
                   <Flag className="h-6 w-6" />
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
               <div className="space-y-4 mt-4">
                 {currentQuestion?.options && Object.entries(currentQuestion.options).map(([key, value]) => (
                   <div 
                     key={key}
                     className={cn(
                       "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50",
                       currentQuestion.user_answer === key 
                         ? "border-primary bg-primary/5" 
                         : "border-transparent bg-muted"
                     )}
                     onClick={() => handleAnswerSelect(key)}
                   >
                     <div className={cn(
                       "flex items-center justify-center w-8 h-8 rounded-full border-2 mr-4 font-bold",
                       currentQuestion.user_answer === key 
                         ? "border-primary bg-primary text-primary-foreground" 
                         : "border-muted-foreground text-muted-foreground"
                     )}>
                       {key}
                     </div>
                     <div className="text-lg">{value as string}</div>
                   </div>
                 ))}
               </div>
            </CardContent>
            <CardFooter className="border-t p-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya
              </Button>
              
              <div className="text-sm text-muted-foreground">
                 Soal {currentQuestionIndex + 1} dari {questions.length}
              </div>

              <Button 
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Selanjutnya <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
