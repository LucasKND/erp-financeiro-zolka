
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Repeat } from "lucide-react";
import { useAccountsData } from "@/hooks/useAccountsData";
import { formatCurrency, formatDate } from "@/lib/dateUtils";

export function CalendarioContas() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const { accounts, loading, error, totals, refetch } = useAccountsData();

  // Recarregar dados quando o componente for montado
  useEffect(() => {
    refetch();
  }, []);

  const getDiasDoMes = (data: Date) => {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasDoMes = [];

    // Preenche os dias do mês anterior para completar a primeira semana
    const diaSemanaInicio = primeiroDia.getDay();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const diaAnterior = new Date(ano, mes, -i);
      diasDoMes.push({ data: diaAnterior, mesAtual: false });
    }

    // Preenche os dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      diasDoMes.push({ data: new Date(ano, mes, dia), mesAtual: true });
    }

    // Preenche os dias do próximo mês para completar a última semana
    const totalDias = diasDoMes.length;
    const diasRestantes = 42 - totalDias; // 6 semanas * 7 dias
    for (let dia = 1; dia <= diasRestantes; dia++) {
      diasDoMes.push({ data: new Date(ano, mes + 1, dia), mesAtual: false });
    }

    return diasDoMes;
  };

  const getContasParaDia = (data: Date) => {
    const dataString = data.toISOString().split('T')[0];
    return accounts.filter(conta => conta.due_date === dataString);
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  // Calcula totais para o mês atual
  const mesAtualString = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`;
  
  const contasDoMes = accounts.filter(conta => conta.due_date.startsWith(mesAtualString));
  
  const totalReceber = contasDoMes
    .filter(conta => conta.type === 'receivable' && conta.status !== 'received')
    .reduce((sum, conta) => sum + conta.amount, 0);
    
  const totalPagar = contasDoMes
    .filter(conta => conta.type === 'payable' && conta.status !== 'paid')
    .reduce((sum, conta) => sum + conta.amount, 0);

  const contasReceber = contasDoMes.filter(conta => conta.type === 'receivable' && conta.status !== 'received').length;
  const contasPagar = contasDoMes.filter(conta => conta.type === 'payable' && conta.status !== 'paid').length;
  const contasVencidas = accounts.filter(conta => conta.status === 'overdue').length;

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando calendário...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-red-600 mb-4">{error}</div>
        <Button onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário de Contas</h1>
          <p className="text-muted-foreground mt-1">Visualize suas contas a pagar e receber por data (incluindo recorrências)</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={refetch}>
            Atualizar
          </Button>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">A Receber</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">A Pagar</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Vencidas</span>
            </div>
            <div className="flex items-center space-x-1">
              <Repeat className="w-3 h-3 text-blue-500" />
              <span className="text-sm text-muted-foreground">Recorrente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceber)}</div>
            <p className="text-xs text-muted-foreground">{contasReceber} contas programadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Pagar Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPagar)}</div>
            <p className="text-xs text-muted-foreground">{contasPagar} contas programadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.totalOverdue)}</div>
            <p className="text-xs text-muted-foreground">{contasVencidas} contas vencidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={mesAnterior}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {nomesMeses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
              </h2>
              <Button variant="outline" size="sm" onClick={proximoMes}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setMesAtual(new Date())}>
              <Calendar className="w-4 h-4 mr-2" />
              Hoje
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {diasSemana.map((dia) => (
              <div key={dia} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {dia}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {getDiasDoMes(mesAtual).map((diaInfo, index) => {
              const contasNoDia = getContasParaDia(diaInfo.data);
              const isHoje = diaInfo.data.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border rounded-lg ${
                    diaInfo.mesAtual ? 'bg-card' : 'bg-muted/50'
                  } ${isHoje ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-border'}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    diaInfo.mesAtual ? 'text-foreground' : 'text-muted-foreground'
                  } ${isHoje ? 'text-blue-600' : ''}`}>
                    {diaInfo.data.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {contasNoDia.map((conta) => (
                      <div
                        key={conta.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity relative ${
                          conta.type === 'receivable'
                            ? conta.status === 'received'
                              ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600'
                              : conta.status === 'overdue'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600'
                              : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
                            : conta.status === 'paid'
                            ? 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-600'
                            : conta.status === 'overdue'
                            ? 'bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-600'
                            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
                        }`}
                        title={`${conta.title} - ${formatCurrency(conta.amount)} - ${
                          conta.status === 'paid' || conta.status === 'received' ? 'Pago' : 
                          conta.status === 'overdue' ? 'Vencido' : 'Aberto'
                        }${conta.original_id ? ' (Recorrente)' : ''}`}
                      >
                        {/* Indicador de recorrência */}
                        {conta.original_id && (
                          <div className="absolute top-0 right-0 -mt-1 -mr-1">
                            <Repeat className="w-3 h-3 text-blue-500" />
                          </div>
                        )}
                        
                        <div className="font-medium truncate">
                          {conta.type === 'receivable' ? conta.client_name : conta.supplier_name}
                        </div>
                        <div className="font-bold">{formatCurrency(conta.amount)}</div>
                        <div className="text-xs opacity-75">
                          {conta.type === 'receivable' ? '↗ Receber' : '↙ Pagar'}
                        </div>
                        <div className="text-xs opacity-75">
                          {conta.status === 'paid' || conta.status === 'received' ? '✓ Pago' : 
                           conta.status === 'overdue' ? '⚠ Vencido' : '⏰ Aberto'}
                        </div>
                        {conta.original_id && (
                          <div className="text-xs opacity-75 text-blue-600">
                            🔄 Recorrente
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
