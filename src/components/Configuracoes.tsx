import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Shield, Building, Users, Bell, Database, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { NovaContaBancariaDialog } from "./NovaContaBancariaDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

export function Configuracoes() {
  const [loading, setLoading] = useState(false);
  const [novaContaDialogOpen, setNovaContaDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contaToDelete, setContaToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [contasBancarias, setContasBancarias] = useState<any[]>([]);
  const [companyData, setCompanyData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: ""
  });
  const { toast } = useToast();
  const { profile, company } = useProfile();

  const handleContaAdicionada = (novaConta: any) => {
    setContasBancarias(prev => [novaConta, ...prev]);
    toast({
      title: "Conta bancária adicionada!",
      description: "A conta foi adicionada com sucesso.",
    });
  };

  const handleEditarConta = (conta: any) => {
    // TODO: Implementar edição de conta
    console.log('Editar conta:', conta);
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleDeleteConta = (conta: any) => {
    setContaToDelete(conta);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contaToDelete) return;

    try {
      setDeleting(true);
      
      // Remove da lista local (aqui você pode implementar a exclusão do banco de dados)
      setContasBancarias(contasBancarias.filter(conta => conta.id !== contaToDelete.id));
      
      toast({
        title: "Conta excluída!",
        description: "A conta bancária foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir a conta bancária.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setContaToDelete(null);
    }
  };

  // Carregar dados da empresa quando o componente for montado
  useEffect(() => {
    if (company) {
      setCompanyData({
        nome: company.name || "",
        cnpj: (company as any).cnpj || "",
        email: (company as any).email || "",
        telefone: (company as any).phone || ""
      });
    }
  }, [company]);

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSalvarAlteracoes = async () => {
    if (!profile?.company_id) {
      toast({
        title: "Erro",
        description: "Company ID não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: companyData.nome,
          cnpj: companyData.cnpj,
          email: companyData.email,
          phone: companyData.telefone
        })
        .eq('id', profile.company_id);

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações da empresa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notificações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa-nome">Nome da Empresa</Label>
                  <Input 
                    id="empresa-nome" 
                    placeholder="Digite o nome da empresa"
                    value={companyData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-cnpj">CNPJ</Label>
                  <Input 
                    id="empresa-cnpj" 
                    placeholder="00.000.000/0000-00"
                    value={companyData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-email">E-mail</Label>
                  <Input 
                    id="empresa-email" 
                    type="email"
                    placeholder="contato@empresa.com"
                    value={companyData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-telefone">Telefone</Label>
                  <Input 
                    id="empresa-telefone" 
                    placeholder="(00) 0000-0000"
                    value={companyData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSalvarAlteracoes}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Regionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="moeda">Moeda Padrão</Label>
                  <Input id="moeda" defaultValue="Real (BRL)" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuso-horario">Fuso Horário</Label>
                  <Input id="fuso-horario" defaultValue="America/Sao_Paulo" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formato-data">Formato de Data</Label>
                  <Input id="formato-data" defaultValue="DD/MM/AAAA" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formato-numero">Formato de Número</Label>
                  <Input id="formato-numero" defaultValue="1.234,56" readOnly />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Contas Bancárias</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNovaContaDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contasBancarias.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">Nenhuma conta bancária cadastrada</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setNovaContaDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar primeira conta
                      </Button>
                    </div>
                  ) : (
                    contasBancarias.map((conta) => (
                      <div key={conta.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{conta.banco}</p>
                          <p className="text-sm text-gray-500">Ag: {conta.agencia} / CC: {conta.conta}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={conta.ativa ? "outline" : "destructive"} 
                            className={conta.ativa ? "text-green-600 border-green-300" : "text-red-600 border-red-300"}
                          >
                            {conta.ativa ? "Ativa" : "Inativa"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditarConta(conta)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteConta(conta)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias de Receita/Despesa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Receitas</h4>
                    <div className="space-y-1">
                      <Badge variant="secondary">Venda de Produtos</Badge>
                      <Badge variant="secondary">Prestação de Serviços</Badge>
                      <Badge variant="secondary">Receitas Financeiras</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Despesas</h4>
                    <div className="space-y-1">
                      <Badge variant="outline">Marketing</Badge>
                      <Badge variant="outline">Operacional</Badge>
                      <Badge variant="outline">Pessoal</Badge>
                      <Badge variant="outline">Infraestrutura</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Gerenciar Categorias
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Gerenciamento de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-gray-500">admin@empresa.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Administrador</Badge>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Financeiro User</p>
                      <p className="text-sm text-gray-500">financeiro@empresa.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Financeiro</Badge>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>

                <Button className="w-full">
                  + Adicionar Novo Usuário
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Contas Vencidas</h4>
                    <p className="text-sm text-gray-500">Notificar quando uma conta vencer</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Contas a Vencer</h4>
                    <p className="text-sm text-gray-500">Notificar 3 dias antes do vencimento</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Recebimentos</h4>
                    <p className="text-sm text-gray-500">Notificar quando uma conta for recebida</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Pagamentos</h4>
                    <p className="text-sm text-gray-500">Notificar quando uma conta for paga</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios Semanais</h4>
                    <p className="text-sm text-gray-500">Enviar resumo semanal por e-mail</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="w-full">Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NovaContaBancariaDialog 
        open={novaContaDialogOpen}
        onOpenChange={setNovaContaDialogOpen}
        onContaAdicionada={handleContaAdicionada}
      />

      <ConfirmDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
        conta={contaToDelete}
      />
    </div>
  );
}
