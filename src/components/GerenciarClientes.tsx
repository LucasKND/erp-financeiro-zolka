import { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClientManagement } from '@/hooks/useClientManagement';
import { NovaEmpresaClienteDialog } from '@/components/NovaEmpresaClienteDialog';
import { EditarEmpresaClienteDialog } from '@/components/EditarEmpresaClienteDialog';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';

export default function GerenciarClientes() {
  const { 
    clientCompanies, 
    loading, 
    isAdminBPO, 
    deleteClientCompany,
    refetch 
  } = useClientManagement();
  
  const [novaEmpresaOpen, setNovaEmpresaOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [deletingCompany, setDeletingCompany] = useState<any>(null);

  const handleDelete = async () => {
    if (deletingCompany) {
      await deleteClientCompany(deletingCompany.id);
      setDeletingCompany(null);
    }
  };

  if (!isAdminBPO && !loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores BPO podem gerenciar empresas cliente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Empresas Cliente</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Empresas Cliente</h2>
          <p className="text-muted-foreground">
            Gerencie as empresas para as quais você presta serviços de BPO financeiro
          </p>
        </div>
        <Button onClick={() => setNovaEmpresaOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa Cliente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCompanies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCompanies.length}</div>
            <p className="text-xs text-muted-foreground">
              Todas as empresas estão ativas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas Cliente</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as empresas cliente cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma empresa cliente</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira empresa cliente
              </p>
              <Button onClick={() => setNovaEmpresaOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Empresa
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Empresa</TableHead>
                  <TableHead>Código de Acesso</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{company.access_code}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(company.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Ativo</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCompany(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingCompany(company)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NovaEmpresaClienteDialog
        open={novaEmpresaOpen}
        onOpenChange={setNovaEmpresaOpen}
        onEmpresaCreated={refetch}
      />

      <EditarEmpresaClienteDialog
        open={!!editingCompany}
        onOpenChange={() => setEditingCompany(null)}
        company={editingCompany}
        onEmpresaUpdated={refetch}
      />

      <ConfirmDeleteDialog
        open={!!deletingCompany}
        onOpenChange={() => setDeletingCompany(null)}
        title="Excluir Empresa Cliente"
        description={`Tem certeza que deseja excluir a empresa "${deletingCompany?.name}"? Todos os dados financeiros desta empresa serão permanentemente removidos. Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}