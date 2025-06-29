
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, Users, Mail, Phone, MoreHorizontal, Edit, Trash2, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NovoClienteDialog } from "./NovoClienteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const clientesIniciais = [];

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState(clientesIniciais);
  const [clienteParaEditar, setClienteParaEditar] = useState<any>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const adicionarCliente = (novoCliente: any) => {
    const clienteComId = {
      ...novoCliente,
      id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
      contasAbertas: 0,
      valorTotal: 0.00,
      ultimaTransacao: new Date().toISOString().split('T')[0],
      documento: novoCliente.tipo === "Pessoa Jurídica" ? novoCliente.cnpj : novoCliente.cpf || ""
    };
    
    setClientes(prev => [...prev, clienteComId]);
  };

  const editarCliente = (clienteAtualizado: any) => {
    setClientes(prev => prev.map(cliente => 
      cliente.id === clienteAtualizado.id 
        ? { 
            ...clienteAtualizado, 
            documento: clienteAtualizado.tipo === "Pessoa Jurídica" ? clienteAtualizado.cnpj : clienteAtualizado.cpf || ""
          }
        : cliente
    ));
    setClienteParaEditar(null);
  };

  const deletarCliente = (id: number) => {
    setClientes(prev => prev.filter(cliente => cliente.id !== id));
    toast({
      title: "Cliente deletado",
      description: "Cliente removido com sucesso!",
    });
  };

  const visualizarContasReceber = (cliente: any) => {
    toast({
      title: "Contas a Receber",
      description: `Visualizando contas de ${cliente.nome}`,
    });
    // Aqui você implementaria a navegação para a tela de contas a receber
    // ou abrir um modal com as contas do cliente
  };

  // Filtrar clientes baseado no termo de busca
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua base de clientes</p>
        </div>
        <NovoClienteDialog 
          onClienteAdicionado={adicionarCliente}
          clienteParaEditar={clienteParaEditar}
          onClienteEditado={editarCliente}
          onCancelarEdicao={() => setClienteParaEditar(null)}
        />
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
              {clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setClienteParaEditar(cliente)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => visualizarContasReceber(cliente)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Contas a Receber
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar o cliente <strong>{cliente.nome}</strong>? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deletarCliente(cliente.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
