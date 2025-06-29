
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
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

export function Relatorios() {
  const [relatoriosData, setRelatoriosData] = useState<RelatoriosData | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, company } = useProfile();
  const { toast } = useToast();

  const fetchRelatoriosData = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);

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

      setRelatoriosData({
        receivableTotals: receivableData?.[0] || { total_open: 0, total_overdue: 0, total_received: 0, count_open: 0, count_overdue: 0, count_received: 0 },
        payableTotals: payableData?.[0] || { total_open: 0, total_overdue: 0, total_paid: 0, count_open: 0, count_overdue: 0, count_paid: 0 },
        cashFlowData: cashFlowData || []
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
  }, [profile?.company_id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises financeiras e relatórios gerenciais - {company?.name}</p>
        </div>
        <Button variant="outline" className="text-green-600 border-green-300">
          <Download className="w-4 h-4 mr-2" />
          Exportar Todos
        </Button>
      </div>

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
              DRE Gerencial - Período Atual
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
              Fluxo de Caixa - Últimos 6 Meses
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
