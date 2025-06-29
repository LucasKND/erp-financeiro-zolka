
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Users, Building, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

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

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, company } = useProfile();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);

      // Buscar saldo da empresa
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('get_company_balance', { company_uuid: profile.company_id });

      if (balanceError) throw balanceError;

      // Buscar totais de contas a receber
      const { data: receivableData, error: receivableError } = await supabase
        .rpc('get_accounts_receivable_totals', { company_uuid: profile.company_id });

      if (receivableError) throw receivableError;

      // Buscar totais de contas a pagar
      const { data: payableData, error: payableError } = await supabase
        .rpc('get_accounts_payable_totals', { company_uuid: profile.company_id });

      if (payableError) throw payableError;

      // Buscar dados do fluxo de caixa
      const { data: cashFlowData, error: cashFlowError } = await supabase
        .rpc('get_cash_flow_data', { company_uuid: profile.company_id });

      if (cashFlowError) throw cashFlowError;

      setDashboardData({
        balance: balanceData?.[0] || { total_balance: 0, total_receivable: 0, total_payable: 0 },
        receivableTotals: receivableData?.[0] || { total_open: 0, total_overdue: 0, total_received: 0, count_open: 0, count_overdue: 0, count_received: 0 },
        payableTotals: payableData?.[0] || { total_open: 0, total_overdue: 0, total_paid: 0, count_open: 0, count_overdue: 0, count_paid: 0 },
        cashFlowData: cashFlowData || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchDashboardData();
    }
  }, [profile?.company_id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados para o gráfico de categorias de despesas (usando dados reais)
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
        <div className="text-lg text-gray-500">Não foi possível carregar os dados.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu negócio - {company?.name}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Esta Semana</Button>
          <Button variant="outline" size="sm">Este Mês</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Este Ano</Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`border-l-4 ${dashboardData.balance.total_balance >= 0 ? 'border-l-green-500' : 'border-l-red-500'} hover:shadow-lg transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Total</CardTitle>
            <DollarSign className={`h-4 w-4 ${dashboardData.balance.total_balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.balance.total_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Number(dashboardData.balance.total_balance))}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              A receber - A pagar
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(Number(dashboardData.receivableTotals.total_open))}
            </div>
            <p className="text-xs text-gray-500">{dashboardData.receivableTotals.count_open} contas em aberto</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">A Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Number(dashboardData.payableTotals.total_open))}
            </div>
            <p className="text-xs text-gray-500">{dashboardData.payableTotals.count_open} contas em aberto</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.receivableTotals.count_open + dashboardData.receivableTotals.count_received}
            </div>
            <p className="text-xs text-gray-500">Total de clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Fluxo de Caixa - Últimos 6 Meses</CardTitle>
            <CardDescription>Comparativo de entradas e saídas mensais</CardDescription>
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
    </div>
  );
}
