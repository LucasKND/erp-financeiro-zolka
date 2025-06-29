
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, Building, Mail, Phone, MoreHorizontal, Edit, Trash2, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NovoFornecedorDialog } from "./NovoFornecedorDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

const fornecedoresIniciais = [
  {
    id: 1,
    nome: "Fornecedor ABC",
    tipo: "Pessoa Jurídica",
    documento: "11.111.111/0001-11",
    email: "contato@abc.com",
    telefone: "(11) 1111-1111",
    cidade: "São Paulo",
    categoria: "Material de Escritório",
    contasAbertas: 1,
    valorTotal: 850.00,
    ultimaTransacao: "2024-01-15"
  },
  {
    id: 2,
    nome: "Energia Elétrica SA",
    tipo: "Pessoa Jurídica",
    documento: "22.222.222/0001-22",
    email: "atendimento@energia.com",
    telefone: "(11) 2222-2222",
    cidade: "São Paulo",
    categoria: "Utilidades",
    contasAbertas: 0,
    valorTotal: 1200.00,
    ultimaTransacao: "2024-01-14"
  },
  {
    id: 3,
    nome: "Marketing Digital Ltda",
    tipo: "Pessoa Jurídica",
    documento: "33.333.333/0001-33",
    email: "vendas@marketing.com",
    telefone: "(11) 3333-3333",
    cidade: "Rio de Janeiro",
    categoria: "Marketing",
    contasAbertas: 1,
    valorTotal: 2500.00,
    ultimaTransacao: "2024-01-08"
  },
];

export function Fornecedores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [fornecedores, setFornecedores] = useState(fornecedoresIniciais);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<any>(null);
  const [fornecedorParaEdicao, setFornecedorParaEdicao] = useState<any>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const adicionarFornecedor = (novoFornecedor: any) => {
    if (modoEdicao && novoFornecedor.id) {
      // Modo edição - atualizar fornecedor existente
      setFornecedores(prev => prev.map(f => 
        f.id === novoFornecedor.id 
          ? {
              ...f,
              ...novoFornecedor,
              tipo: novoFornecedor.tipo === "pessoa-juridica" ? "Pessoa Jurídica" : "Pessoa Física",
              documento: novoFornecedor.cnpj || novoFornecedor.cpf || f.documento
            }
          : f
      ));
    } else {
      // Modo criação - adicionar novo fornecedor
      const fornecedorComId = {
        ...novoFornecedor,
        id: fornecedores.length + 1,
        tipo: novoFornecedor.tipo === "pessoa-juridica" ? "Pessoa Jurídica" : "Pessoa Física",
        documento: novoFornecedor.cnpj || novoFornecedor.cpf || "",
        categoria: "Geral", // Categoria padrão
        contasAbertas: 0,
        valorTotal: 0,
        ultimaTransacao: new Date().toISOString().split('T')[0]
      };
      setFornecedores(prev => [...prev, fornecedorComId]);
    }
    
    // Reset do modo edição
    setModoEdicao(false);
    setFornecedorParaEdicao(null);
  };

  const editarFornecedor = (id: number) => {
    const fornecedor = fornecedores.find(f => f.id === id);
    if (fornecedor) {
      setFornecedorParaEdicao(fornecedor);
      setModoEdicao(true);
      setModalOpen(true);
    }
  };

  const visualizarContas = (id: number) => {
    const fornecedor = fornecedores.find(f => f.id === id);
    if (fornecedor) {
      // TODO: Implementar navegação para tela de contas a pagar filtrada por fornecedor
      // Por enquanto, mostrar informação simples
      if (fornecedor.contasAbertas > 0) {
        alert(`${fornecedor.nome} possui ${fornecedor.contasAbertas} conta(s) em aberto no valor total de ${formatCurrency(fornecedor.valorTotal)}.`);
      } else {
        alert(`${fornecedor.nome} não possui contas em aberto no momento.`);
      }
    }
  };

  const deletarFornecedor = (id: number) => {
    const fornecedor = fornecedores.find(f => f.id === id);
    if (fornecedor) {
      setFornecedorToDelete(fornecedor);
      setDeleteDialogOpen(true);
    }
  };

  const confirmarDelecao = () => {
    if (fornecedorToDelete) {
      setFornecedores(prev => prev.filter(f => f.id !== fornecedorToDelete.id));
      setFornecedorToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua base de fornecedores</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setModoEdicao(false);
            setFornecedorParaEdicao(null);
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Total de Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{fornecedores.length}</div>
            <p className="text-xs text-gray-500">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fornecedores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fornecedores.filter(f => f.contasAbertas > 0).length}
            </div>
            <p className="text-xs text-gray-500">Com contas em aberto</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Set(fornecedores.map(f => f.categoria)).size}
            </div>
            <p className="text-xs text-gray-500">Diferentes categorias</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(fornecedores.reduce((acc, f) => acc + f.valorTotal, 0))}
            </div>
            <p className="text-xs text-gray-500">Em transações</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Fornecedores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Fornecedores</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, documento ou categoria"
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
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Contas Abertas</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                  <TableCell>{fornecedor.documento}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" />
                        {fornecedor.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        {fornecedor.telefone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{fornecedor.categoria}</Badge>
                  </TableCell>
                  <TableCell>{fornecedor.cidade}</TableCell>
                  <TableCell>
                    <Badge variant={fornecedor.contasAbertas > 0 ? "destructive" : "outline"}>
                      {fornecedor.contasAbertas}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(fornecedor.valorTotal)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => editarFornecedor(fornecedor.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => visualizarContas(fornecedor.id)}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Visualizar Contas a Pagar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deletarFornecedor(fornecedor.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NovoFornecedorDialog 
        open={modalOpen} 
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setModoEdicao(false);
            setFornecedorParaEdicao(null);
          }
        }}
        onSalvar={adicionarFornecedor}
        fornecedorParaEdicao={fornecedorParaEdicao}
        modoEdicao={modoEdicao}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmarDelecao}
        title="Confirmar exclusão"
        description="Esta ação não pode ser desfeita. Todos os dados relacionados ao fornecedor serão permanentemente removidos."
        itemName={fornecedorToDelete?.nome}
      />
    </div>
  );
}
