
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MoreVertical, Edit, Trash2, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FiltrosDialog } from "./FiltrosDialog";
import { EditarContaReceberDialog } from "./EditarContaReceberDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import type { Tables } from "@/integrations/supabase/types";
import { SecureContaReceberDialog } from "./SecureContaReceberDialog";

type AccountsReceivable = Tables<'accounts_receivable'>;

export function ContasReceber() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contas, setContas] = useState<AccountsReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contaToDelete, setContaToDelete] = useState<AccountsReceivable | null>(null);
  const [contaToEdit, setContaToEdit] = useState<AccountsReceivable | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { invalidateAccount } = useNotifications();
  const { profile, company } = useProfile();

  const fetchContas = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Error fetching accounts receivable:', error);
      toast({
        title: "Erro ao carregar contas",
        description: "Não foi possível carregar as contas a receber.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchContas();
    }
  }, [profile?.company_id]);

  const handleMarcarComoRecebido = async (contaId: string) => {
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .update({ status: 'received' })
        .eq('id', contaId);

      if (error) throw error;

      setContas(contas.map(conta => 
        conta.id === contaId 
          ? { ...conta, status: 'received' as const }
          : conta
      ));
      
      // Invalidar a conta nas notificações para refletir a mudança de status
      invalidateAccount(contaId, 'receivable');
      
      toast({
        title: "Conta recebida!",
        description: "A conta foi marcada como recebida.",
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Erro ao atualizar conta",
        description: "Não foi possível marcar a conta como recebida.",
        variant: "destructive",
      });
    }
  };

  const handleFiltrosAplicados = (novosFiltros: any) => {
    setFiltros(novosFiltros);
  };

  const handleDeleteClick = (conta: AccountsReceivable) => {
    setContaToDelete(conta);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (conta: AccountsReceivable) => {
    setContaToEdit(conta);
    setEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contaToDelete) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('accounts_receivable')
        .delete()
        .eq('id', contaToDelete.id);

      if (error) throw error;

      setContas(contas.filter(conta => conta.id !== contaToDelete.id));
      
      // Invalidar a conta nas notificações
      invalidateAccount(contaToDelete.id, 'receivable');
      
      toast({
        title: "Conta excluída!",
        description: "A conta a receber foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir a conta a receber.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setContaToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Aberto</Badge>;
      case "received":
        return <Badge variant="outline" className="text-green-600 border-green-300">Recebido</Badge>;
      case "overdue":
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
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filtrar contas baseado no termo de busca
  const contasFiltradas = contas.filter(conta => 
    conta.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totais
  const totalAberto = contas
    .filter(conta => conta.status === 'open')
    .reduce((sum, conta) => sum + Number(conta.amount), 0);

  const totalVencido = contas
    .filter(conta => conta.status === 'overdue')
    .reduce((sum, conta) => sum + Number(conta.amount), 0);

  const totalRecebido = contas
    .filter(conta => conta.status === 'received')
    .reduce((sum, conta) => sum + Number(conta.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando contas a receber...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contas a Receber</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas contas a receber - {company?.name}
          </p>
        </div>
        <SecureContaReceberDialog onContaAdicionada={fetchContas} />
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAberto)}</div>
            <p className="text-xs text-muted-foreground">
              {contas.filter(c => c.status === 'open').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalVencido)}</div>
            <p className="text-xs text-muted-foreground">
              {contas.filter(c => c.status === 'overdue').length} contas vencidas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recebido Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRecebido)}</div>
            <p className="text-xs text-muted-foreground">
              {contas.filter(c => c.status === 'received').length} contas recebidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
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
              <FiltrosDialog onFiltrosAplicados={handleFiltrosAplicados} tipo="receber" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => (
                <TableRow key={conta.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium">{conta.client_name}</TableCell>
                  <TableCell>{conta.description}</TableCell>
                  <TableCell>{formatCurrency(Number(conta.amount))}</TableCell>
                  <TableCell>{formatDate(conta.due_date)}</TableCell>
                  <TableCell>{getStatusBadge(conta.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditClick(conta)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(conta)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                        {conta.status === "open" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleMarcarComoRecebido(conta.id)}
                              className="cursor-pointer text-green-600 focus:text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Marcar como Recebido
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {contasFiltradas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhuma conta encontrada com os critérios de busca." : "Nenhuma conta a receber cadastrada."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão da conta"
        description="Esta ação não pode ser desfeita."
        itemName={contaToDelete ? `${contaToDelete.client_name} - ${contaToDelete.description}` : ""}
        isLoading={deleting}
      />

      {/* Modal de edição */}
      {editDialogOpen && contaToEdit && (
        <EditarContaReceberDialog 
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          conta={contaToEdit}
          onContaEditada={fetchContas}
        />
      )}
    </div>
  );
}
