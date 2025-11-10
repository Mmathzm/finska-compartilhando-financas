import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type ExchangeRate = Database['public']['Tables']['exchange_rates']['Row'];

export const useExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('currency_code');

      if (error) throw error;

      setRates(data || []);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as cotações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRates = async () => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-exchange-rates');

      if (error) throw error;

      if (data?.success) {
        setRates(data.rates || []);
        toast({
          title: "Sucesso",
          description: "Cotações atualizadas com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as cotações.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = rates.find(r => r.currency_code === fromCurrency)?.rate_to_brl || 1;
    const toRate = rates.find(r => r.currency_code === toCurrency)?.rate_to_brl || 1;

    // Converter para BRL primeiro, depois para a moeda de destino
    const amountInBRL = fromCurrency === 'BRL' ? amount : amount * fromRate;
    const result = toCurrency === 'BRL' ? amountInBRL : amountInBRL / toRate;

    return parseFloat(result.toFixed(2));
  };

  const saveConversion = async (
    fromCurrency: string,
    toCurrency: string,
    fromAmount: number,
    toAmount: number
  ) => {
    if (!user) return;

    try {
      const fromRate = rates.find(r => r.currency_code === fromCurrency)?.rate_to_brl || 1;
      const toRate = rates.find(r => r.currency_code === toCurrency)?.rate_to_brl || 1;
      const exchangeRate = fromRate / toRate;

      const { error } = await supabase
        .from('user_currency_conversions')
        .insert({
          user_id: user.id,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          from_amount: fromAmount,
          to_amount: toAmount,
          exchange_rate: exchangeRate
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving conversion:', error);
    }
  };

  useEffect(() => {
    fetchRates();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('exchange-rates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_rates'
        },
        () => {
          fetchRates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    rates,
    loading,
    updating,
    updateRates,
    convertCurrency,
    saveConversion,
    refreshRates: fetchRates
  };
};
