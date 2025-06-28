
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, Users, Mail, Phone } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const clientes = [
  {
    id: 1,
    nome: "João Silva",
    tipo: "Pessoa Física",
    documento: "123.456.789-00",
    email: "joao@email.com",
    telefone: "(11) 99999-9999",
    cidade: "São Paulo",
    contasAbertas: 2,
    valorTotal: 3500.00,
    ultimaTransacao: "2024-01-10"
  },
  {
    id: 2,
    nome: "Maria Santos",
    tipo: "Pessoa Física",
    documento: "987.654.321-00",
    email: "maria@email.com",
    telefone: "(11) 88888-8888",
    cidade: "Rio de Janeiro",
    contasAbertas: 0,
    valorTotal: 1800.00,
    ultimaTransacao: "2024-01-08"
  },
  {
    id: 3,
    nome: "Empresa XYZ Ltda",
    tipo: "Pessoa Jurídica",
    documento: "12.345.678/0001-90",
    email: "contato@xyz.com",
    telefone: "(11) 3333-3333",
    cidade: "São Paulo",
    contasAbertas: 1,
    valorTotal: 5000.00,
    ultimaTransacao: "2024-01-05"
  },
];

export function Clientes() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie sua base de clientes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clientes.length}</div>
            <p className="text-xs text-gray-500">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clientes.filter(c => c.contasAbertas > 0).length}
            </div>
            <p className="text-xs text-gray-500">Com contas em aberto</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pessoa Física</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {clientes.filter(c => c.tipo === "Pessoa Física").length}
            </div>
            <p className="text-xs text-gray-500">CPF cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pessoa Jurídica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {clientes.filter(c => c.tipo === "Pessoa Jurídica").length}
            </div>
            <p className="text-xs text-gray-500">CNPJ cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, documento ou email"
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
                <TableHead>Nome/Razão Social</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Contas Abertas</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>
                    <Badge variant={cliente.tipo === "Pessoa Física" ? "default" : "secondary"}>
                      {cliente.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{cliente.documento}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        {cliente.telefone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{cliente.cidade}</TableCell>
                  <TableCell>
                    <Badge variant={cliente.contasAbertas > 0 ? "destructive" : "outline"}>
                      {cliente.contasAbertas}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(cliente.valorTotal)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
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
