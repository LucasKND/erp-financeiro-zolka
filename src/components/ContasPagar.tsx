
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Check, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NovaContaPagarDialog } from "./NovaContaPagarDialog";
import { FiltrosDialog } from "./FiltrosDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import type { Tables } from "@/integrations/supabase/types";

type AccountsPayable = Tables<'accounts_payable'>;

export function ContasPagar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contas, setContas] = useState<AccountsPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({});
  const { toast } = useToast();
  const { profile, company } = useProfile();

  const fetchContas = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Error fetching accounts payable:', error);
      toast({
        title: "Erro ao carregar contas",
        description: "Não foi possível carregar as contas a pagar.",
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
      
      toast({
        title: "Conta paga!",
        description: "A conta foi marcada como paga.",
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Erro ao atualizar conta",
        description: "Não foi possível marcar a conta como paga.",
        variant: "destructive",
      });
    }
  };

  const handleFiltrosAplicados = (novosFiltros: any) => {
    setFiltros(novosFiltros);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtrar contas baseado no termo de busca
  const contasFiltradas = contas.filter(conta => 
    conta.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando contas a pagar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contas a Pagar</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas contas a pagar - {company?.name}
          </p>
        </div>
        <NovaContaPagarDialog onContaAdicionada={fetchContas} />
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalAberto)}</div>
            <p className="text-xs text-gray-500">
              {contas.filter(c => c.status === 'open').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalVencido)}</div>
            <p className="text-xs text-gray-500">
              {contas.filter(c => c.status === 'overdue').length} contas vencidas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pago Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div>
            <p className="text-xs text-gray-500">
              {contas.filter(c => c.status === 'paid').length} contas pagas
            </p>
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
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => (
                <TableRow key={conta.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{conta.supplier_name}</TableCell>
                  <TableCell>{conta.description}</TableCell>
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
          {contasFiltradas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Nenhuma conta encontrada com os critérios de busca." : "Nenhuma conta a pagar cadastrada."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
