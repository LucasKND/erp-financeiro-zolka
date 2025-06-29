import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, formatDate } from "@/lib/dateUtils";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'payable' | 'receivable';
  status: 'open' | 'paid' | 'overdue';
  account_payable_id?: string;
  account_receivable_id?: string;
}

export function CalendarioContas() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [eventos, setEventos] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  const fetchEventos = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      
      // Busca contas a pagar para gerar eventos
      const { data: contasPagar, error: contasError } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', profile.company_id);

      if (contasError) {
        console.error('Erro ao buscar contas a pagar:', contasError);
        setEventos([]);
        return;
      }

      // Busca contas a receber para gerar eventos
      const { data: contasReceber, error: receberError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('company_id', profile.company_id);

      if (receberError) {
        console.error('Erro ao buscar contas a receber:', receberError);
      }

      // Converte contas a pagar em eventos do calendário
      const eventosConstasPagar: CalendarEvent[] = (contasPagar || []).map(conta => ({
        id: conta.id,
        date: conta.due_date,
        title: `${conta.supplier_name} - ${conta.description}`,
        amount: Number(conta.amount),
        type: 'payable' as const,
        status: conta.status as 'open' | 'paid' | 'overdue',
        account_payable_id: conta.id
      }));

      // Converte contas a receber em eventos do calendário
      const eventosContasReceber: CalendarEvent[] = (contasReceber || []).map(conta => ({
        id: conta.id,
        date: conta.due_date,
        title: `${conta.client_name} - ${conta.description}`,
        amount: Number(conta.amount),
        type: 'receivable' as const,
        status: conta.status as 'open' | 'paid' | 'overdue',
        account_receivable_id: conta.id
      }));

      setEventos([...eventosConstasPagar, ...eventosContasReceber]);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchEventos();
    }
  }, [profile?.company_id]);

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

  const getEventosParaDia = (data: Date) => {
    const dataString = data.toISOString().split('T')[0];
    return eventos.filter(evento => evento.date === dataString);
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  // Calcula totais para o mês atual
  const mesAtualString = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`;
  
  const eventosDoMes = eventos.filter(evento => evento.date.startsWith(mesAtualString));
  
  const totalReceber = eventosDoMes
    .filter(evento => evento.type === 'receivable')
    .reduce((sum, evento) => sum + evento.amount, 0);
    
  const totalPagar = eventosDoMes
    .filter(evento => evento.type === 'payable')
    .reduce((sum, evento) => sum + evento.amount, 0);
    
  const totalVencido = eventos
    .filter(evento => evento.status === 'overdue')
    .reduce((sum, evento) => sum + evento.amount, 0);

  const contasReceber = eventosDoMes.filter(evento => evento.type === 'receivable').length;
  const contasPagar = eventosDoMes.filter(evento => evento.type === 'payable').length;
  const contasVencidas = eventos.filter(evento => evento.status === 'overdue').length;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário de Contas</h1>
          <p className="text-muted-foreground mt-1">Visualize suas contas a pagar e receber por data</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">A Receber</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">A Pagar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalReceber)}</div>
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
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalVencido)}</div>
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
              const eventosNoDia = getEventosParaDia(diaInfo.data);
              const isHoje = diaInfo.data.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    diaInfo.mesAtual ? 'bg-card' : 'bg-muted/50'
                  } ${isHoje ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-border'}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    diaInfo.mesAtual ? 'text-foreground' : 'text-muted-foreground'
                  } ${isHoje ? 'text-blue-600' : ''}`}>
                    {diaInfo.data.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {eventosNoDia.map((evento) => (
                      <div
                        key={evento.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                          evento.type === 'receivable'
                            ? evento.status === 'paid'
                              ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600'
                              : evento.status === 'overdue'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600'
                              : 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600'
                            : evento.status === 'paid'
                            ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600'
                            : evento.status === 'overdue'
                            ? 'bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-600'
                            : 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600'
                        }`}
                        title={`${evento.title} - ${formatCurrency(evento.amount)} - ${evento.status === 'paid' ? 'Pago' : evento.status === 'overdue' ? 'Vencido' : 'Aberto'}`}
                      >
                        <div className="font-medium truncate">{evento.title.split(' - ')[0]}</div>
                        <div className="font-bold">{formatCurrency(evento.amount)}</div>
                        <div className="text-xs opacity-75">
                          {evento.status === 'paid' ? '✓ Pago' : evento.status === 'overdue' ? '⚠ Vencido' : '⏰ Aberto'}
                        </div>
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
