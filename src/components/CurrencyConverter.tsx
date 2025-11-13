import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Euro, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useToast } from '@/hooks/use-toast';

interface CurrencyConverterProps {
  selectedCurrency: 'BRL' | 'USD' | 'EUR';
  onCurrencyChange: (currency: 'BRL' | 'USD' | 'EUR') => void;
}

const CurrencyConverter = ({ selectedCurrency, onCurrencyChange }: CurrencyConverterProps) => {
  const { rates, loading, updating, updateRates, convertCurrency, saveConversion } = useExchangeRates();
  const { toast } = useToast();
  const [amount, setAmount] = useState('1000');
  const [convertedUSD, setConvertedUSD] = useState(0);
  const [convertedEUR, setConvertedEUR] = useState(0);

  const usdRate = rates.find(r => r.currency_code === 'USD');
  const eurRate = rates.find(r => r.currency_code === 'EUR');

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    setConvertedUSD(convertCurrency(numAmount, 'BRL', 'USD'));
    setConvertedEUR(convertCurrency(numAmount, 'BRL', 'EUR'));
  }, [amount, rates, convertCurrency]);

  const handleConvert = async (currency: 'USD' | 'EUR') => {
    const numAmount = parseFloat(amount) || 0;
    const converted = currency === 'USD' ? convertedUSD : convertedEUR;
    
    await saveConversion('BRL', currency, numAmount, converted);
    
    onCurrencyChange(currency);
    toast({
      title: "Conversão Realizada",
      description: `Dashboard convertido para ${currency}. R$ ${numAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = ${currency} ${converted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    });
  };

  const handleResetToBRL = () => {
    onCurrencyChange('BRL');
    toast({
      title: "Moeda Resetada",
      description: "Dashboard voltou para Reais (BRL)",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          Conversor de Moedas
          {selectedCurrency !== 'BRL' && (
            <span className="text-sm font-normal text-muted-foreground">
              (Dashboard em {selectedCurrency})
            </span>
          )}
        </CardTitle>
        <div className="flex gap-2">
          {selectedCurrency !== 'BRL' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToBRL}
            >
              Voltar para BRL
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={updateRates}
            disabled={updating}
          >
            <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cotações Atuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                <span className="font-semibold text-foreground">Dólar (USD)</span>
              </div>
            </div>
            {!loading && usdRate ? (
              <>
                <div className="text-2xl font-bold text-foreground">
                  R$ {Number(usdRate.rate_to_brl).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Atualizado: {formatDate(usdRate.last_updated)}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Carregando...</div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Euro (EUR)</span>
              </div>
            </div>
            {!loading && eurRate ? (
              <>
                <div className="text-2xl font-bold text-foreground">
                  R$ {Number(eurRate.rate_to_brl).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Atualizado: {formatDate(eurRate.last_updated)}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Carregando...</div>
            )}
          </div>
        </div>

        {/* Conversor */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Valor em Reais (BRL)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Digite o valor em R$"
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant={selectedCurrency === 'USD' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleConvert('USD')}
              disabled={loading || !amount}
            >
              <DollarSign className="h-6 w-6" />
              <div className="text-center">
                <div className="text-xs opacity-80">Converter Dashboard para</div>
                <div className="text-lg font-bold">DÓLAR</div>
                <div className="text-sm mt-1">
                  USD {convertedUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </Button>

            <Button
              variant={selectedCurrency === 'EUR' ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleConvert('EUR')}
              disabled={loading || !amount}
            >
              <Euro className="h-6 w-6" />
              <div className="text-center">
                <div className="text-xs opacity-80">Converter Dashboard para</div>
                <div className="text-lg font-bold">EURO</div>
                <div className="text-sm mt-1">
                  EUR {convertedEUR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
