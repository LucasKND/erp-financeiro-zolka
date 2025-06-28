import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from "recharts";

const dreData = [
  { categoria: "Receitas", valor: 75000, tipo: "receita" },
  { categoria: "Vendas de Produtos", valor: 45000, tipo: "receita" },
  { categoria: "Serviços", valor: 30000, tipo: "receita" },
  { categoria: "Despesas Operacionais", valor: -25000, tipo: "despesa" },
  { categoria: "Marketing", valor: -8000, tipo: "despesa" },
  { categoria: "Pessoal", valor: -15000, tipo: "despesa" },
  { categoria: "Infraestrutura", valor: -7000, tipo: "despesa" },
];

const fluxoMensal = [
  { mes: "Jan", entradas: 45000, saidas: 32000, saldo: 13000 },
  { mes: "Fev", entradas: 52000, saidas: 38000, saldo: 14000 },
  { mes: "Mar", entradas: 48000, saidas: 41000, saldo: 7000 },
  { mes: "Abr", entradas: 61000, saidas: 39000, saldo: 22000 },
  { mes: "Mai", entradas: 55000, saidas: 43000, saldo: 12000 },
  { mes: "Jun", entradas: 67000, saidas: 45000, saldo: 22000 },
];

const contasPorStatus = [
  { name: "Recebidas", value: 65, color: "#10b981" },
  { name: "A Receber", value: 20, color: "#3b82f6" },
  { name: "Vencidas", value: 15, color: "#ef4444" },
];

export function Relatorios() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalReceitas = dreData.filter(item => item.tipo === "receita").reduce((acc, item) => acc + item.valor, 0);
  const totalDespesas = Math.abs(dreData.filter(item => item.tipo === "despesa").reduce((acc, item) => acc + item.valor, 0));
  const resultadoLiquido = totalReceitas - totalDespesas;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises financeiras e relatórios gerenciais</p>
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
              DRE Gerencial - Últimos 6 Meses
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
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Math.abs(Number(value)))} />
                <Bar 
                  dataKey="valor" 
                  fill="#10b981"
                  style={{ fill: (entry: any) => entry.tipo === "receita" ? "#10b981" : "#ef4444" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
      </div>

      {/* Fluxo de Caixa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Fluxo de Caixa - Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fluxoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={3} name="Entradas" />
              <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={3} name="Saídas" />
              <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
