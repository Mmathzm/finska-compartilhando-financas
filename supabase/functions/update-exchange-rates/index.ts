import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar cotações da API pública brasileira AwesomeAPI
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // Extrair taxas
    const usdRate = parseFloat(data.USDBRL.bid);
    const eurRate = parseFloat(data.EURBRL.bid);

    // Atualizar USD
    const { error: usdError } = await supabaseClient
      .from('exchange_rates')
      .update({
        rate_to_brl: usdRate,
        last_updated: new Date().toISOString(),
        source: 'AwesomeAPI'
      })
      .eq('currency_code', 'USD');

    if (usdError) throw usdError;

    // Atualizar EUR
    const { error: eurError } = await supabaseClient
      .from('exchange_rates')
      .update({
        rate_to_brl: eurRate,
        last_updated: new Date().toISOString(),
        source: 'AwesomeAPI'
      })
      .eq('currency_code', 'EUR');

    if (eurError) throw eurError;

    // Buscar taxas atualizadas
    const { data: rates, error: fetchError } = await supabaseClient
      .from('exchange_rates')
      .select('*')
      .in('currency_code', ['USD', 'EUR']);

    if (fetchError) throw fetchError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        rates,
        message: 'Exchange rates updated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
