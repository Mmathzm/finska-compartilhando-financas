import { useMemo } from 'react';
import { Transaction } from './useTransactions';
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useAnalytics = (transactions: Transaction[], monthsBack: number = 6) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const startDate = startOfMonth(subMonths(now, monthsBack - 1));
    const endDate = endOfMonth(now);

    // Filter transactions within date range
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Monthly data
    const monthlyData = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const monthLabel = format(monthStart, 'MMM', { locale: ptBR });

      const monthTransactions = filteredTransactions.filter(t => {
        const tDate = parseISO(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const receitas = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const gastos = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        receitas,
        gastos,
        economia: receitas - gastos
      });
    }

    // Category data (expenses only)
    const categoryMap: Record<string, { name: string; value: number; color: string }> = {};
    filteredTransactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(t => {
        const categoryName = t.category!.name;
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            name: categoryName,
            value: 0,
            color: t.category!.color || '#8B5CF6'
          };
        }
        categoryMap[categoryName].value += t.amount;
      });
    const categoryData = Object.values(categoryMap);

    // Daily spending for current month
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
    
    const dailySpendingData = daysInMonth.map(day => {
      const dayTransactions = filteredTransactions.filter(t => {
        const tDate = startOfDay(parseISO(t.date));
        return tDate.getTime() === startOfDay(day).getTime() && t.type === 'expense';
      });
      
      return {
        day: day.getDate(),
        valor: dayTransactions.reduce((sum, t) => sum + t.amount, 0)
      };
    });

    // KPIs
    const totalIncome = monthlyData.reduce((sum, m) => sum + m.receitas, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.gastos, 0);
    const totalSavings = totalIncome - totalExpenses;
    const avgIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
    const avgExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;
    const avgSavings = monthlyData.length > 0 ? totalSavings / monthlyData.length : 0;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    // Previous month comparison
    const currentMonth = monthlyData[monthlyData.length - 1] || { receitas: 0, gastos: 0, economia: 0 };
    const previousMonth = monthlyData[monthlyData.length - 2] || { receitas: 0, gastos: 0, economia: 0 };
    
    const incomeChange = previousMonth.receitas > 0 
      ? ((currentMonth.receitas - previousMonth.receitas) / previousMonth.receitas) * 100 
      : 0;
    const expenseChange = previousMonth.gastos > 0 
      ? ((currentMonth.gastos - previousMonth.gastos) / previousMonth.gastos) * 100 
      : 0;
    const savingsChange = previousMonth.economia !== 0 
      ? ((currentMonth.economia - previousMonth.economia) / Math.abs(previousMonth.economia)) * 100 
      : 0;

    return {
      monthlyData,
      categoryData,
      dailySpendingData,
      kpis: {
        avgIncome,
        avgExpenses,
        avgSavings,
        savingsRate,
        incomeChange,
        expenseChange,
        savingsChange
      }
    };
  }, [transactions, monthsBack]);

  return analytics;
};
