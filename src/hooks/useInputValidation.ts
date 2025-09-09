import { useCallback } from 'react';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const useInputValidation = () => {
  // Sanitize and validate transaction amounts
  const validateAmount = useCallback((amount: string | number): ValidationResult => {
    const errors: string[] = [];
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      errors.push('Valor deve ser um número válido');
    } else if (numAmount < 0) {
      errors.push('Valor não pode ser negativo');
    } else if (numAmount > 999999999.99) {
      errors.push('Valor muito alto');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Sanitize text input to prevent XSS
  const sanitizeText = useCallback((text: string): string => {
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 500); // Limit length
  }, []);

  // Validate email format
  const validateEmail = useCallback((email: string): ValidationResult => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.push('Email é obrigatório');
    } else if (!emailRegex.test(email)) {
      errors.push('Formato de email inválido');
    } else if (email.length > 320) {
      errors.push('Email muito longo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Validate account name
  const validateAccountName = useCallback((name: string): ValidationResult => {
    const errors: string[] = [];
    const sanitized = sanitizeText(name);

    if (!sanitized) {
      errors.push('Nome da conta é obrigatório');
    } else if (sanitized.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    } else if (sanitized.length > 100) {
      errors.push('Nome muito longo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [sanitizeText]);

  return {
    validateAmount,
    sanitizeText,
    validateEmail,
    validateAccountName
  };
};