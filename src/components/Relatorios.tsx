
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface RelatoriosData {
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

type FilterPeriod = 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';

export function Relatorios() {
  const [relatoriosData, setRelatoriosData] = useState<RelatoriosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('mensal');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const { profile, company } = useProfile();
  const { toast } = useToast();

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (filterPeriod) {
      case 'mensal':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'trimestral':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'semestral':
        const currentSemester = Math.floor(now.getMonth() / 6);
        startDate = new Date(now.getFullYear(), currentSemester * 6, 1);
        break;
      case 'anual':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'personalizado':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
  };

  const fetchRelatoriosData = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      // Buscar contas a receber no período
      const { data: receivableData, error: receivableError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('company_id', profile.company_id)
        .gte('due_date', startDate)
        .lte('due_date', endDate);

      if (receivableError) throw receivableError;

      // Buscar contas a pagar no período
      const { data: payableData, error: payableError } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', profile.company_id)
        .gte('due_date', startDate)
        .lte('due_date', endDate);

      if (payableError) throw payableError;

      // Calcular totais de contas a receber
      const receivableTotals = {
        total_open: receivableData?.filter(r => r.status === 'open').reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        total_overdue: receivableData?.filter(r => r.status === 'overdue').reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        total_received: receivableData?.filter(r => r.status === 'received').reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        count_open: receivableData?.filter(r => r.status === 'open').length || 0,
        count_overdue: receivableData?.filter(r => r.status === 'overdue').length || 0,
        count_received: receivableData?.filter(r => r.status === 'received').length || 0,
      };

      // Calcular totais de contas a pagar
      const payableTotals = {
        total_open: payableData?.filter(p => p.status === 'open').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        total_overdue: payableData?.filter(p => p.status === 'overdue').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        total_paid: payableData?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        count_open: payableData?.filter(p => p.status === 'open').length || 0,
        count_overdue: payableData?.filter(p => p.status === 'overdue').length || 0,
        count_paid: payableData?.filter(p => p.status === 'paid').length || 0,
      };

      // Gerar dados de fluxo de caixa agrupados por mês
      const cashFlowMap = new Map();
      
      // Agrupar recebimentos por mês
      receivableData?.filter(r => r.status === 'received').forEach(r => {
        const monthKey = new Date(r.due_date).toISOString().slice(0, 7);
        const monthName = new Date(r.due_date).toLocaleDateString('pt-BR', { month: 'short' });
        if (!cashFlowMap.has(monthKey)) {
          cashFlowMap.set(monthKey, { month_name: monthName, entradas: 0, saidas: 0, saldo: 0 });
        }
        cashFlowMap.get(monthKey).entradas += Number(r.amount);
      });

      // Agrupar pagamentos por mês
      payableData?.filter(p => p.status === 'paid').forEach(p => {
        const monthKey = new Date(p.due_date).toISOString().slice(0, 7);
        const monthName = new Date(p.due_date).toLocaleDateString('pt-BR', { month: 'short' });
        if (!cashFlowMap.has(monthKey)) {
          cashFlowMap.set(monthKey, { month_name: monthName, entradas: 0, saidas: 0, saldo: 0 });
        }
        cashFlowMap.get(monthKey).saidas += Number(p.amount);
      });

      // Calcular saldo e converter para array
      const cashFlowData = Array.from(cashFlowMap.values()).map(item => ({
        ...item,
        saldo: item.entradas - item.saidas
      })).sort((a, b) => a.month_name.localeCompare(b.month_name));

      setRelatoriosData({
        receivableTotals,
        payableTotals,
        cashFlowData
      });
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados dos relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchRelatoriosData();
    }
  }, [profile?.company_id, filterPeriod, customStartDate, customEndDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPeriodLabel = () => {
    const { startDate, endDate } = getDateRange();
    const start = new Date(startDate).toLocaleDateString('pt-BR');
    const end = new Date(endDate).toLocaleDateString('pt-BR');
    return `${start} - ${end}`;
  };

  // Calcular dados do DRE
  const totalReceitas = relatoriosData ? Number(relatoriosData.receivableTotals.total_received) : 0;
  const totalDespesas = relatoriosData ? Number(relatoriosData.payableTotals.total_paid) : 0;
  const resultadoLiquido = totalReceitas - totalDespesas;

  // Dados para o gráfico DRE
  const dreData = relatoriosData ? [
    { categoria: "Receitas", valor: totalReceitas, tipo: "receita", fill: "#10b981" },
    { categoria: "Despesas", valor: -totalDespesas, tipo: "despesa", fill: "#ef4444" },
  ] : [];

  // Dados para o gráfico de status das contas
  const contasPorStatus = relatoriosData ? [
    { name: "Recebidas", value: Math.round((relatoriosData.receivableTotals.count_received / (relatoriosData.receivableTotals.count_received + relatoriosData.receivableTotals.count_open + relatoriosData.receivableTotals.count_overdue)) * 100) || 0, color: "#10b981" },
    { name: "A Receber", value: Math.round((relatoriosData.receivableTotals.count_open / (relatoriosData.receivableTotals.count_received + relatoriosData.receivableTotals.count_open + relatoriosData.receivableTotals.count_overdue)) * 100) || 0, color: "#3b82f6" },
    { name: "Vencidas", value: Math.round((relatoriosData.receivableTotals.count_overdue / (relatoriosData.receivableTotals.count_received + relatoriosData.receivableTotals.count_open + relatoriosData.receivableTotals.count_overdue)) * 100) || 0, color: "#ef4444" },
  ].filter(item => item.value > 0) : [];

  const relatoriosDisponiveis = [
    {
      titulo: "DRE Gerencial",
      descricao: "Demonstrativo de Resultado do Exercício",
      icone: BarChart3,
      cor: "blue"
    },
    {
      titulo: "Fluxo de Caixa (DFC)",
      descricao: "Demonstrativo dos Fluxos de Caixa",
      icone: TrendingUp,
      cor: "green"
    },
    {
      titulo: "Contas a Receber",
      descricao: "Relatório analítico de recebimentos",
      icone: FileText,
      cor: "purple"
    },
    {
      titulo: "Contas a Pagar",
      descricao: "Relatório analítico de pagamentos",
      icone: FileText,
      cor: "red"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando relatórios...</div>
      </div>
    );
  }

  if (!relatoriosData) {
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
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análises financeiras e relatórios gerenciais - {company?.name}</p>
        </div>
        <Button variant="outline" className="text-green-600 border-green-300">
          <Download className="w-4 h-4 mr-2" />
          Exportar Todos
        </Button>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Filtros de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={filterPeriod} onValueChange={(value: FilterPeriod) => setFilterPeriod(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filterPeriod === 'personalizado' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                Período: {getPeriodLabel()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Relatórios Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatoriosDisponiveis.map((relatorio, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${relatorio.cor}-100`}>
                  <relatorio.icone className={`w-5 h-5 text-${relatorio.cor}-600`} />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{relatorio.titulo}</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">{relatorio.descricao}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="w-3 h-3 mr-2" />
                Gerar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DRE Gerencial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              DRE Gerencial - {getPeriodLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">Total de Receitas</span>
                <span className="font-bold text-green-600">{formatCurrency(totalReceitas)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-800">Total de Despesas</span>
                <span className="font-bold text-red-600">({formatCurrency(totalDespesas)})</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                resultadoLiquido >= 0 ? 'bg-blue-50' : 'bg-orange-50'
              }`}>
                <span className={`font-medium ${
                  resultadoLiquido >= 0 ? 'text-blue-800' : 'text-orange-800'
                }`}>
                  Resultado Líquido
                </span>
                <span className={`font-bold text-xl ${
                  resultadoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(resultadoLiquido)}
                </span>
              </div>
            </div>
            
            {dreData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Math.abs(Number(value)))} />
                  <Bar dataKey="valor" fill="fill" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {contasPorStatus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Status das Contas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={contasPorStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {contasPorStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              
              <div className="space-y-2 mt-4">
                {contasPorStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <Badge variant="outline">{item.value}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fluxo de Caixa */}
      {relatoriosData.cashFlowData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Fluxo de Caixa - {getPeriodLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={relatoriosData.cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month_name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={3} name="Entradas" />
                <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={3} name="Saídas" />
                <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
