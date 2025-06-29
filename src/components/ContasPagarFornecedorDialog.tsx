import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Check, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, formatDate } from "@/lib/dateUtils";
import type { Tables } from "@/integrations/supabase/types";

type AccountsPayable = Tables<'accounts_payable'>;

interface ContasPagarFornecedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedorNome: string;
  onContasChanged?: () => void;
}

export function ContasPagarFornecedorDialog({ 
  open, 
  onOpenChange, 
  fornecedorNome,
  onContasChanged 
}: ContasPagarFornecedorDialogProps) {
  const [contas, setContas] = useState<AccountsPayable[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();

  const fetchContas = async () => {
    if (!profile?.company_id || !fornecedorNome) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('supplier_name', fornecedorNome)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Erro ao carregar contas do fornecedor:', error);
      setContas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && fornecedorNome) {
      fetchContas();
    }
  }, [open, fornecedorNome, profile?.company_id]);

  const handleMarcarComoPago = async (contaId: string) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: 'paid' })
        .eq('id', contaId);

      if (error) throw error;

      setContas(contas.map(conta => 
        conta.id === contaId 
          ? { ...conta, status: 'paid' as const }
          : conta
      ));

      if (onContasChanged) {
        onContasChanged();
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Aberto</Badge>;
      case "paid":
        return <Badge variant="outline" className="text-green-600 border-green-300">Pago</Badge>;
      case "overdue":
        return <Badge variant="outline" className="text-red-600 border-red-300">Vencido</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  // Calcular totais
  const totalAberto = contas
    .filter(conta => conta.status === 'open')
    .reduce((sum, conta) => sum + Number(conta.amount), 0);

  const totalVencido = contas
    .filter(conta => conta.status === 'overdue')
    .reduce((sum, conta) => sum + Number(conta.amount), 0);

  const totalPago = contas
    .filter(conta => conta.status === 'paid')
    .reduce((sum, conta) => sum + Number(conta.amount), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contas a Pagar - {fornecedorNome}</DialogTitle>
          <DialogDescription>
            Visualize todas as contas a pagar deste fornecedor
          </DialogDescription>
        </DialogHeader>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg border-l-4 border-l-red-500">
            <div className="text-sm font-medium text-muted-foreground">Total em Aberto</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalAberto)}</div>
            <p className="text-xs text-gray-500">
              {contas.filter(c => c.status === 'open').length} contas
            </p>
          </div>

          <div className="p-4 border rounded-lg border-l-4 border-l-orange-500">
            <div className="text-sm font-medium text-muted-foreground">Contas Vencidas</div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalVencido)}</div>
            <p className="text-xs text-gray-500">
              {contas.filter(c => c.status === 'overdue').length} contas
            </p>
          </div>

          <div className="p-4 border rounded-lg border-l-4 border-l-green-500">
            <div className="text-sm font-medium text-muted-foreground">Total Pago</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div>
            <p className="text-xs text-gray-500">
              {contas.filter(c => c.status === 'paid').length} contas
            </p>
          </div>
        </div>

        {/* Lista de Contas */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Carregando contas...</div>
          </div>
        ) : contas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma conta a pagar encontrada para este fornecedor.
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta) => (
                  <TableRow key={conta.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{conta.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{conta.category}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(Number(conta.amount))}</TableCell>
                    <TableCell>{formatDate(conta.due_date)}</TableCell>
                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {conta.status === "open" && (
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
