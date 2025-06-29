
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const transacoes = [
  {
    id: 1,
    data: "2024-01-15",
    descricao: "Pagamento - Fornecedor ABC",
    categoria: "Material de Escritório",
    conta: "Banco do Brasil",
    tipo: "saida",
    valor: 850.00,
    saldo: 88490.00
  },
  {
    id: 2,
    data: "2024-01-14",
    descricao: "Recebimento - João Silva",
    categoria: "Venda de Produto",
    conta: "Banco do Brasil",
    tipo: "entrada",
    valor: 2500.00,
    saldo: 89340.00
  },
  {
    id: 3,
    data: "2024-01-13",
    descricao: "Pagamento - Energia Elétrica SA",
    categoria: "Utilidades",
    conta: "Banco do Brasil",
    tipo: "saida",
    valor: 1200.00,
    saldo: 86840.00
  },
  {
    id: 4,
    data: "2024-01-12",
    descricao: "Recebimento - Maria Santos",
    categoria: "Serviço de Consultoria",
    conta: "Banco do Brasil",
    tipo: "entrada",
    valor: 1800.00,
    saldo: 88040.00
  },
];

export function FluxoCaixa() {
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalEntradas = transacoes
    .filter(t => t.tipo === "entrada")
    .reduce((acc, t) => acc + t.valor, 0);

  const totalSaidas = transacoes
    .filter(t => t.tipo === "saida")
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fluxo de Caixa</h1>
          <p className="text-muted-foreground mt-1">Extrato detalhado de todas as transações</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="text-green-600 border-green-300">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(transacoes[0]?.saldo || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Banco do Brasil</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Total Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEntradas)}
            </div>
            <p className="text-xs text-muted-foreground">No período</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" />
              Total Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSaidas)}
            </div>
            <p className="text-xs text-muted-foreground">No período</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${saldoLiquido >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoLiquido)}
            </div>
            <p className="text-xs text-muted-foreground">Entradas - Saídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Extrato de Transações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Extrato de Transações</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por descrição ou categoria"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Período
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoes.map((transacao) => (
                <TableRow key={transacao.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>{formatDate(transacao.data)}</TableCell>
                  <TableCell className="font-medium">{transacao.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{transacao.categoria}</Badge>
                  </TableCell>
                  <TableCell>{transacao.conta}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={transacao.tipo === "entrada" ? "default" : "destructive"}
                      className={transacao.tipo === "entrada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {transacao.tipo === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-semibold ${transacao.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                    {transacao.tipo === "entrada" ? "+" : "-"}{formatCurrency(transacao.valor)}
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(transacao.saldo)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
