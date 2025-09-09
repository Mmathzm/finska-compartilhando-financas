import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ErrorDetails {
  message: string;
  code?: string;
  context?: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: unknown, context?: string) => {
    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error occurred:', error, 'Context:', context);
    }

    // Determine user-friendly error message
    let userMessage = 'Ocorreu um erro inesperado';
    
    if (error instanceof Error) {
      // Check for specific error types and provide appropriate messages
      if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error.message.includes('auth') || error.message.includes('permission')) {
        userMessage = 'Erro de autenticação. Faça login novamente.';
      } else if (error.message.includes('validation')) {
        userMessage = 'Dados inválidos. Verifique as informações.';
      }
    }

    // Show user-friendly error message
    toast({
      title: 'Erro',
      description: userMessage,
      variant: 'destructive'
    });

    // Return structured error for handling
    return {
      message: userMessage,
      originalError: error,
      context
    };
  }, [toast]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};