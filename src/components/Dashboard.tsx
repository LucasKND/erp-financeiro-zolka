
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Users, Building, AlertCircle, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { FiltrosPeriodoDialog } from "@/components/FiltrosPeriodoDialog";

interface DashboardData {
  balance: {
    total_balance: number;
    total_receivable: number;
    total_payable: number;
  };
  receivableTotals: {
    total_open: number;
    total_overdue: number;
    total_received: number;
    count_open: number;
    count_overdue: number;
    count_received: number;
  };
  payableTotals: {
    total_open: number;
    total_overdue: number;
    total_paid: number;
    count_open: number;
    count_overdue: number;
    count_paid: number;
  };
  cashFlowData: Array<{
    month_name: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
}

type FilterPeriod = 'week' | 'month' | 'year' | 'custom';

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<FilterPeriod>('year');
  const [customPeriodOpen, setCustomPeriodOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const { profile, company } = useProfile();
  const { toast } = useToast();

  const getDateRange = (period: FilterPeriod) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          return null;
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const fetchDashboardDataWithFilter = async (period: FilterPeriod) => {
    if (!profile?.company_id) return;

    const dateRange = getDateRange(period);
    if (!dateRange) return;

    try {
      setLoading(true);

      // Buscar contas a receber filtradas por período
      const { data: receivableData, error: receivableError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('company_id', profile.company_id)
        .gte('due_date', dateRange.startDate)
        .lte('due_date', dateRange.endDate);

      if (receivableError) throw receivableError;

      // Buscar contas a pagar filtradas por período
      const { data: payableData, error: payableError } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', profile.company_id)
        .gte('due_date', dateRange.startDate)
        .lte('due_date', dateRange.endDate);

      if (payableError) throw payableError;

      // Calcular totais das contas a receber
      const receivableTotals = {
        total_open: (receivableData || []).filter(acc => acc.status === 'open').reduce((sum, acc) => sum + Number(acc.amount), 0),
        total_overdue: (receivableData || []).filter(acc => acc.status === 'overdue').reduce((sum, acc) => sum + Number(acc.amount), 0),
        total_received: (receivableData || []).filter(acc => acc.status === 'received').reduce((sum, acc) => sum + Number(acc.amount), 0),
        count_open: (receivableData || []).filter(acc => acc.status === 'open').length,
        count_overdue: (receivableData || []).filter(acc => acc.status === 'overdue').length,
        count_received: (receivableData || []).filter(acc => acc.status === 'received').length,
      };

      // Calcular totais das contas a pagar
      const payableTotals = {
        total_open: (payableData || []).filter(acc => acc.status === 'open').reduce((sum, acc) => sum + Number(acc.amount), 0),
        total_overdue: (payableData || []).filter(acc => acc.status === 'overdue').reduce((sum, acc) => sum + Number(acc.amount), 0),
        total_paid: (payableData || []).filter(acc => acc.status === 'paid').reduce((sum, acc) => sum + Number(acc.amount), 0),
        count_open: (payableData || []).filter(acc => acc.status === 'open').length,
        count_overdue: (payableData || []).filter(acc => acc.status === 'overdue').length,
        count_paid: (payableData || []).filter(acc => acc.status === 'paid').length,
      };

      // Calcular saldo total
      const balance = {
        total_receivable: receivableTotals.total_open + receivableTotals.total_overdue,
        total_payable: payableTotals.total_open + payableTotals.total_overdue,
        total_balance: (receivableTotals.total_open + receivableTotals.total_overdue) - (payableTotals.total_open + payableTotals.total_overdue)
      };

      // Gerar dados do fluxo de caixa para o período filtrado
      const cashFlowData = generateCashFlowData(receivableData || [], payableData || [], dateRange);

      setDashboardData({
        balance,
        receivableTotals,
        payableTotals,
        cashFlowData
      });
    } catch (error) {
      console.error('Error fetching filtered dashboard data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCashFlowData = (receivableData: any[], payableData: any[], dateRange: { startDate: string, endDate: string }) => {
    const months: { [key: string]: { entradas: number, saidas: number } } = {};
    
    // Processar entradas (contas recebidas)
    receivableData.filter(acc => acc.status === 'received').forEach(acc => {
      const monthKey = new Date(acc.due_date).toISOString().slice(0, 7); // YYYY-MM
      if (!months[monthKey]) months[monthKey] = { entradas: 0, saidas: 0 };
      months[monthKey].entradas += Number(acc.amount);
    });

    // Processar saídas (contas pagas)
    payableData.filter(acc => acc.status === 'paid').forEach(acc => {
      const monthKey = new Date(acc.due_date).toISOString().slice(0, 7); // YYYY-MM
      if (!months[monthKey]) months[monthKey] = { entradas: 0, saidas: 0 };
      months[monthKey].saidas += Number(acc.amount);
    });

    // Converter para array e ordenar
    return Object.entries(months)
      .map(([month, data]) => ({
        month_name: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
        entradas: data.entradas,
        saidas: data.saidas,
        saldo: data.entradas - data.saidas
      }))
      .sort((a, b) => a.month_name.localeCompare(b.month_name));
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchDashboardDataWithFilter(activePeriod);
    }
  }, [profile?.company_id, activePeriod, customStartDate, customEndDate]);

  const handlePeriodChange = (period: FilterPeriod) => {
    if (period === 'custom') {
      setCustomPeriodOpen(true);
    } else {
      setActivePeriod(period);
    }
  };

  const handleCustomPeriodApply = (startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setActivePeriod('custom');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados para o gráfico de categorias de despesas
  const categoriasDespesas = dashboardData ? [
    { name: "A Pagar", value: Number(dashboardData.payableTotals.total_open), color: "#ef4444" },
    { name: "Pago", value: Number(dashboardData.payableTotals.total_paid), color: "#10b981" },
  ].filter(item => item.value > 0) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dados do dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Não foi possível carregar os dados.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu negócio - {company?.name}</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={activePeriod === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handlePeriodChange('week')}
          >
            Esta Semana
          </Button>
          <Button 
            variant={activePeriod === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handlePeriodChange('month')}
          >
            Este Mês
          </Button>
          <Button 
            variant={activePeriod === 'year' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handlePeriodChange('year')}
          >
            Este Ano
          </Button>
          <Button 
            variant={activePeriod === 'custom' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handlePeriodChange('custom')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Personalizado
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`border-l-4 ${dashboardData.balance.total_balance >= 0 ? 'border-l-green-500' : 'border-l-red-500'} hover:shadow-lg transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
            <DollarSign className={`h-4 w-4 ${dashboardData.balance.total_balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.balance.total_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Number(dashboardData.balance.total_balance))}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              A receber - A pagar
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(Number(dashboardData.receivableTotals.total_open))}
            </div>
            <p className="text-xs text-muted-foreground">{dashboardData.receivableTotals.count_open} contas em aberto</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Number(dashboardData.payableTotals.total_open))}
            </div>
            <p className="text-xs text-muted-foreground">{dashboardData.payableTotals.count_open} contas em aberto</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.receivableTotals.count_open + dashboardData.receivableTotals.count_received}
            </div>
            <p className="text-xs text-muted-foreground">Total de clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Fluxo de Caixa - Período Selecionado</CardTitle>
            <CardDescription>Comparativo de entradas e saídas no período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month_name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, ""]} />
                <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={3} name="Entradas" />
                <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={3} name="Saídas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {categoriasDespesas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Contas por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoriasDespesas}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoriasDespesas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.receivableTotals.count_overdue > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      {dashboardData.receivableTotals.count_overdue} contas a receber vencidas
                    </p>
                    <p className="text-xs text-red-600">
                      Total: {formatCurrency(Number(dashboardData.receivableTotals.total_overdue))}
                    </p>
                  </div>
                </div>
              )}
              {dashboardData.payableTotals.count_overdue > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">
                      {dashboardData.payableTotals.count_overdue} contas a pagar vencidas
                    </p>
                    <p className="text-xs text-orange-600">
                      Total: {formatCurrency(Number(dashboardData.payableTotals.total_overdue))}
                    </p>
                  </div>
                </div>
              )}
              {dashboardData.receivableTotals.count_overdue === 0 && dashboardData.payableTotals.count_overdue === 0 && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Nenhuma conta vencida</p>
                    <p className="text-xs text-green-600">Parabéns! Todas as contas estão em dia.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FiltrosPeriodoDialog 
        open={customPeriodOpen}
        onOpenChange={setCustomPeriodOpen}
        onApplyFilter={handleCustomPeriodApply}
      />
    </div>
  );
}
