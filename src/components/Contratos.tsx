import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, FileText, Calendar, DollarSign, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Dados fictícios para demonstração - em breve conectaremos ao banco de dados
const contratosIniciais = [
  {
    id: "1",
    numero: "CONT-2024-001",
    cliente: "Empresa ABC Ltda",
    descricao: "Contrato de prestação de serviços de marketing digital",
    valor: 15000.00,
    dataInicio: "2024-01-15",
    dataFim: "2024-12-15",
    status: "ativo",
    tipo: "servicos",
    observacoes: "Renovação automática mediante acordo"
  },
  {
    id: "2",
    numero: "CONT-2024-002",
    cliente: "TechSoft Solutions",
    descricao: "Contrato de desenvolvimento de software",
    valor: 45000.00,
    dataInicio: "2024-03-01",
    dataFim: "2024-09-01",
    status: "em_andamento",
    tipo: "desenvolvimento",
    observacoes: "Projeto dividido em 3 fases"
  },
  {
    id: "3",
    numero: "CONT-2024-003",
    cliente: "Loja Virtual Plus",
    descricao: "Contrato de manutenção e suporte técnico",
    valor: 8000.00,
    dataInicio: "2024-02-01",
    dataFim: "2025-02-01",
    status: "ativo",
    tipo: "manutencao",
    observacoes: "Suporte 24/7 incluído"
  }
];

export function Contratos() {
  const [contratos, setContratos] = useState(contratosIniciais);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: "Ativo", variant: "default" as const, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
      em_andamento: { label: "Em Andamento", variant: "secondary" as const, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
      finalizado: { label: "Finalizado", variant: "outline" as const, className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100" },
      cancelado: { label: "Cancelado", variant: "destructive" as const, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      servicos: { label: "Serviços", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100" },
      desenvolvimento: { label: "Desenvolvimento", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" },
      manutencao: { label: "Manutenção", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100" },
      consultoria: { label: "Consultoria", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100" }
    };
    
    const config = tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.servicos;
    return <Badge variant="secondary" className={config.className}>{config.label}</Badge>;
  };

  const contratosFiltrados = contratos.filter(contrato => 
    contrato.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculos de resumo
  const totalContratos = contratos.length;
  const contratosAtivos = contratos.filter(c => c.status === 'ativo').length;
  const valorTotalAtivos = contratos
    .filter(c => c.status === 'ativo' || c.status === 'em_andamento')
    .reduce((acc, c) => acc + c.valor, 0);
  const contratosVencendo = contratos.filter(c => {
    const dataFim = new Date(c.dataFim);
    const hoje = new Date();
    const dias30 = new Date();
    dias30.setDate(hoje.getDate() + 30);
    return dataFim <= dias30 && dataFim >= hoje;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os contratos da empresa</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Total de Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalContratos}</div>
            <p className="text-xs text-muted-foreground">Contratos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <User className="w-4 h-4 mr-1" />
              Contratos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{contratosAtivos}</div>
            <p className="text-xs text-muted-foreground">Em vigor atualmente</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Valor Total Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(valorTotalAtivos)}</div>
            <p className="text-xs text-muted-foreground">Contratos ativos e em andamento</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Vencendo em 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{contratosVencendo}</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contratos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Contratos</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por número, cliente ou descrição"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
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
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhum contrato encontrado com os filtros aplicados." : "Nenhum contrato cadastrado. Clique em 'Novo Contrato' para começar."}
                  </TableCell>
                </TableRow>
              ) : (
                contratosFiltrados.map((contrato) => (
                  <TableRow key={contrato.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{contrato.numero}</TableCell>
                    <TableCell>{contrato.cliente}</TableCell>
                    <TableCell className="max-w-xs truncate" title={contrato.descricao}>
                      {contrato.descricao}
                    </TableCell>
                    <TableCell>{getTipoBadge(contrato.tipo)}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(contrato.valor)}
                    </TableCell>
                    <TableCell>{formatDate(contrato.dataInicio)}</TableCell>
                    <TableCell>{formatDate(contrato.dataFim)}</TableCell>
                    <TableCell>{getStatusBadge(contrato.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          Visualizar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
