
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, TrendingUp, TrendingDown, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { formatDate, formatCurrency } from "@/lib/dateUtils";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  description: string;
  amount: number;
  date: string;
  status: 'realizada' | 'previsao';
  category: string;
  source: 'pagar' | 'receber';
  originalId: string;
}

interface AccountsData {
  contasPagar: any[];
  contasReceber: any[];
}

export function FluxoCaixa() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountsData, setAccountsData] = useState<AccountsData>({
    contasPagar: [],
    contasReceber: []
  });
  const [loading, setLoading] = useState(true);
  const { company } = useProfile();
  const { toast } = useToast();

  // Função para buscar contas do banco de dados
  const fetchAccountsData = async () => {
    if (!company?.id) return;

    try {
      setLoading(true);
      
      // Buscar contas a pagar
      const { data: contasPagar, error: errorPagar } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', company.id)
        .order('due_date', { ascending: true });

      if (errorPagar) throw errorPagar;

      // Buscar contas a receber
      const { data: contasReceber, error: errorReceber } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('company_id', company.id)
        .order('due_date', { ascending: true });

      if (errorReceber) throw errorReceber;

      setAccountsData({
        contasPagar: contasPagar || [],
        contasReceber: contasReceber || []
      });
    } catch (error) {
      console.error('Erro ao buscar dados das contas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das contas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, [company?.id]);

  // Função para marcar conta como paga/recebida
  const marcarComoRealizada = async (id: string, type: 'pagar' | 'receber') => {
    const table = type === 'pagar' ? 'accounts_payable' : 'accounts_receivable';
    const status = type === 'pagar' ? 'paid' : 'received';

    try {
      const { error } = await supabase
        .from(table)
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Conta marcada como ${type === 'pagar' ? 'paga' : 'recebida'}`,
      });

      // Recarregar dados
      fetchAccountsData();
    } catch (error) {
      console.error('Erro ao marcar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da conta",
        variant: "destructive",
      });
    }
  };

  // Gerar transações a partir das contas
  const generateTransactions = (): Transaction[] => {
    const transactions: Transaction[] = [];

    // Processar contas a pagar
    accountsData.contasPagar.forEach(conta => {
      transactions.push({
        id: `pagar_${conta.id}`,
        type: 'saida',
        description: conta.description,
        amount: conta.amount,
        date: conta.due_date,
        status: conta.status === 'paid' ? 'realizada' : 'previsao',
        category: conta.category,
        source: 'pagar',
        originalId: conta.id
      });
    });

    // Processar contas a receber
    accountsData.contasReceber.forEach(conta => {
      transactions.push({
        id: `receber_${conta.id}`,
        type: 'entrada',
        description: conta.description,
        amount: conta.amount,
        date: conta.due_date,
        status: conta.status === 'received' ? 'realizada' : 'previsao',
        category: 'Recebimento',
        source: 'receber',
        originalId: conta.id
      });
    });

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const transactions = generateTransactions();
  const transacoesRealizadas = transactions.filter(t => t.status === 'realizada');
  
  // Cálculos de resumo
  const totalEntradasRealizadas = transacoesRealizadas
    .filter(t => t.type === 'entrada')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidasRealizadas = transacoesRealizadas
    .filter(t => t.type === 'saida')
    .reduce((acc, t) => acc + t.amount, 0);

  const saldoAtual = totalEntradasRealizadas - totalSaidasRealizadas;

  const totalAReceber = accountsData.contasReceber
    .filter(c => c.status === 'open' || c.status === 'overdue')
    .reduce((acc, c) => acc + c.amount, 0);

  const totalAPagar = accountsData.contasPagar
    .filter(c => c.status === 'open' || c.status === 'overdue')
    .reduce((acc, c) => acc + c.amount, 0);

  const saldoLiquido = saldoAtual + totalAReceber - totalAPagar;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fluxo de Caixa</h1>
          <p className="text-muted-foreground mt-1">Extrato detalhado de todas as transações</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="text-green-600 border-green-300">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(saldoAtual)}
            </div>
            <p className="text-xs text-muted-foreground">Transações realizadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Total a Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAReceber)}
            </div>
            <p className="text-xs text-muted-foreground">Contas em aberto</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" />
              Total a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalAPagar)}
            </div>
            <p className="text-xs text-muted-foreground">Contas em aberto</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${saldoLiquido >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido Projetado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoLiquido)}
            </div>
            <p className="text-xs text-muted-foreground">Atual + A Receber - A Pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Extrato de Transações Realizadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações Realizadas</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por descrição ou categoria"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Período
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando transações...
                  </TableCell>
                </TableRow>
              ) : transactions.filter(transacao => 
                  transacao.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  transacao.category.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                transactions
                  .filter(transacao => 
                    transacao.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    transacao.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((transacao) => (
                    <TableRow key={transacao.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>{formatDate(transacao.date)}</TableCell>
                      <TableCell className="font-medium">{transacao.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transacao.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transacao.type === "entrada" ? "default" : "destructive"}
                          className={transacao.type === "entrada" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}
                        >
                          {transacao.type === "entrada" ? "Entrada" : "Saída"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transacao.status === "realizada" ? "default" : "outline"}
                          className={transacao.status === "realizada" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" : ""}
                        >
                          {transacao.status === "realizada" ? "Realizada" : "Previsão"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-semibold ${transacao.type === "entrada" ? "text-green-600" : "text-red-600"}`}>
                        {transacao.type === "entrada" ? "+" : "-"}{formatCurrency(transacao.amount)}
                      </TableCell>
                      <TableCell>
                        {transacao.status === "previsao" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            onClick={() => marcarComoRealizada(transacao.originalId, transacao.source)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Marcar como {transacao.type === "entrada" ? "Recebida" : "Paga"}
                          </Button>
                        )}
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
