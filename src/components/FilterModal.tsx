import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSavedFilters, SavedFilterInput } from '@/hooks/useSavedFilters';
import { useCategories } from '@/hooks/useCategories';
import { Filter, Save, Trash2 } from 'lucide-react';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilter: (filter: any) => void;
}

export const FilterModal = ({ open, onOpenChange, onApplyFilter }: FilterModalProps) => {
  const { filters, saveFilter, deleteFilter } = useSavedFilters();
  const { categories } = useCategories();
  
  const [filterName, setFilterName] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all');

  const handleApplyFilter = () => {
    const filterConfig = {
      period: selectedPeriod,
      categories: selectedCategories,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      transactionType
    };
    
    onApplyFilter(filterConfig);
    onOpenChange(false);
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;

    const filterInput: SavedFilterInput = {
      name: filterName,
      filter_config: {
        period: selectedPeriod,
        categories: selectedCategories,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        transactionType
      }
    };

    await saveFilter(filterInput);
    setFilterName('');
  };

  const handleLoadFilter = (filter: any) => {
    setSelectedPeriod(filter.filter_config.period || '6m');
    setSelectedCategories(filter.filter_config.categories || []);
    setMinAmount(filter.filter_config.minAmount?.toString() || '');
    setMaxAmount(filter.filter_config.maxAmount?.toString() || '');
    setTransactionType(filter.filter_config.transactionType || 'all');
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros Salvos */}
          {filters.length > 0 && (
            <div className="space-y-2">
              <Label>Filtros Salvos</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filters.map(filter => (
                  <div key={filter.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 justify-start"
                      onClick={() => handleLoadFilter(filter)}
                    >
                      {filter.name}
                      {filter.is_default && (
                        <span className="ml-2 text-xs text-muted-foreground">(Padrão)</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFilter(filter.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Último mês</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="1a">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Transação */}
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categorias */}
          <div className="space-y-2">
            <Label>Categorias</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
              {categories.map(category => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={category.id} className="text-sm cursor-pointer">
                    {category.icon} {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Faixa de Valores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Mínimo</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Máximo</Label>
              <Input
                type="number"
                placeholder="9999.99"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Salvar Filtro */}
          <div className="space-y-2">
            <Label>Salvar este filtro</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do filtro"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilter}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
