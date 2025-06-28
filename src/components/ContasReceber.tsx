
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, Check, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const contasReceber = [
  {
    id: 1,
    cliente: "João Silva",
    descricao: "Venda de Produto A",
    valorPrevisto: 2500.00,
    valorRealizado: null,
    dataVencimento: "2024-01-15",
    dataRealizacao: null,
    status: "aberto"
  },
  {
    id: 2,
    cliente: "Maria Santos",
    descricao: "Serviço de Consultoria",
    valorPrevisto: 1800.00,
    valorRealizado: 1800.00,
    dataVencimento: "2024-01-10",
    dataRealizacao: "2024-01-08",
    status: "recebido"
  },
  {
    id: 3,
    cliente: "Empresa XYZ Ltda",
    descricao: "Projeto Desenvolvimento",
    valorPrevisto: 5000.00,
    valorRealizado: null,
    dataVencimento: "2024-01-05",
    dataRealizacao: null,
    status: "vencido"
  },
];

export function ContasReceber() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aberto":
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Aberto</Badge>;
      case "recebido":
        return <Badge variant="outline" className="text-green-600 border-green-300">Recebido</Badge>;
      case "vencido":
        return <Badge variant="outline" className="text-red-600 border-red-300">Vencido</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contas a Receber</h1>
          <p className="text-gray-600 mt-1">Gerencie suas contas a receber e recebimentos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 7.500,00</div>
            <p className="text-xs text-gray-500">2 contas pendentes</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 5.000,00</div>
            <p className="text-xs text-gray-500">1 conta vencida</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recebido no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 1.800,00</div>
            <p className="text-xs text-gray-500">1 conta recebida</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Contas a Receber</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente ou descrição"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor Previsto</TableHead>
                <TableHead>Valor Realizado</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasReceber.map((conta) => (
                <TableRow key={conta.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{conta.cliente}</TableCell>
                  <TableCell>{conta.descricao}</TableCell>
                  <TableCell>{formatCurrency(conta.valorPrevisto)}</TableCell>
                  <TableCell>{formatCurrency(conta.valorRealizado)}</TableCell>
                  <TableCell>{formatDate(conta.dataVencimento)}</TableCell>
                  <TableCell>{getStatusBadge(conta.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {conta.status === "aberto" && (
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
