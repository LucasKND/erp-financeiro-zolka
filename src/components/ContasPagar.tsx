
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Check, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NovaContaPagarDialog } from "./NovaContaPagarDialog";
import { FiltrosDialog } from "./FiltrosDialog";
import { useToast } from "@/hooks/use-toast";

const contasPagarInicial = [
  {
    id: 1,
    fornecedor: "Fornecedor ABC",
    descricao: "Material de Escritório",
    categoria: "Operacional",
    valorPrevisto: 850.00,
    dataVencimento: "2024-01-20",
    status: "aberto"
  },
  {
    id: 2,
    fornecedor: "Energia Elétrica SA",
    descricao: "Conta de Luz - Janeiro",
    categoria: "Infraestrutura",
    valorPrevisto: 1200.00,
    dataVencimento: "2024-01-15",
    status: "pago"
  },
  {
    id: 3,
    fornecedor: "Marketing Digital Ltda",
    descricao: "Anúncios Google Ads",
    categoria: "Marketing",
    valorPrevisto: 2500.00,
    dataVencimento: "2024-01-08",
    status: "vencido"
  },
];

export function ContasPagar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contas, setContas] = useState(contasPagarInicial);
  const [filtros, setFiltros] = useState({});
  const { toast } = useToast();

  const handleNovaContaAdicionada = (novaConta: any) => {
    setContas([...contas, novaConta]);
  };

  const handleMarcarComoPago = (contaId: number) => {
    setContas(contas.map(conta => 
      conta.id === contaId 
        ? { ...conta, status: "pago" }
        : conta
    ));
    
    toast({
      title: "Conta paga!",
      description: "A conta foi marcada como paga e adicionada ao fluxo de caixa.",
    });
  };

  const handleFiltrosAplicados = (novosFiltros: any) => {
    setFiltros(novosFiltros);
    // Aqui você implementaria a lógica de filtro real
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aberto":
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Aberto</Badge>;
      case "pago":
        return <Badge variant="outline" className="text-green-600 border-green-300">Pago</Badge>;
      case "vencido":
        return <Badge variant="outline" className="text-red-600 border-red-300">Vencido</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtrar contas que não foram pagas para a lista
  const contasVisiveisNaLista = contas.filter(conta => conta.status !== "pago");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contas a Pagar</h1>
          <p className="text-gray-600 mt-1">Gerencie suas contas a pagar e pagamentos</p>
        </div>
        <NovaContaPagarDialog onContaAdicionada={handleNovaContaAdicionada} />
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 3.350,00</div>
            <p className="text-xs text-gray-500">2 contas pendentes</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">R$ 2.500,00</div>
            <p className="text-xs text-gray-500">1 conta vencida</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pago no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 1.200,00</div>
            <p className="text-xs text-gray-500">1 conta paga</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Contas a Pagar</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por fornecedor ou descrição"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <FiltrosDialog onFiltrosAplicados={handleFiltrosAplicados} tipo="pagar" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor Previsto</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasVisiveisNaLista.map((conta) => (
                <TableRow key={conta.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                  <TableCell>{conta.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{conta.categoria}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(conta.valorPrevisto)}</TableCell>
                  <TableCell>{formatDate(conta.dataVencimento)}</TableCell>
                  <TableCell>{getStatusBadge(conta.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {conta.status === "aberto" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600"
                          onClick={() => handleMarcarComoPago(conta.id)}
                        >
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
