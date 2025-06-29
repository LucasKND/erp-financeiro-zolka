
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Shield, Building, Users, Bell, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Configuracoes() {
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
                  <Input id="empresa-nome" defaultValue="Minha Empresa Ltda" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-cnpj">CNPJ</Label>
                  <Input id="empresa-cnpj" defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-email">E-mail</Label>
                  <Input id="empresa-email" defaultValue="contato@minhaempresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-telefone">Telefone</Label>
                  <Input id="empresa-telefone" defaultValue="(11) 3333-3333" />
                </div>
                <Button className="w-full">Salvar Alterações</Button>
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
              <CardHeader>
                <CardTitle>Contas Bancárias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Banco do Brasil</p>
                      <p className="text-sm text-gray-500">Ag: 1234-5 / CC: 12345-6</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-300">Ativa</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Itaú</p>
                      <p className="text-sm text-gray-500">Ag: 5678 / CC: 67890-1</p>
                    </div>
                    <Badge variant="outline">Inativa</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    + Adicionar Nova Conta
                  </Button>
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
    </div>
  );
}
