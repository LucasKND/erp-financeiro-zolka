
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Eye, Check } from "lucide-react";

const eventosCalendario = [
  {
    id: 1,
    data: "2024-01-15",
    tipo: "receber",
    titulo: "João Silva - Venda Produto A",
    valor: 2500.00,
    status: "aberto"
  },
  {
    id: 2,
    data: "2024-01-18",
    tipo: "pagar",
    titulo: "Fornecedor ABC - Material",
    valor: 850.00,
    status: "aberto"
  },
  {
    id: 3,
    data: "2024-01-20",
    tipo: "receber",
    titulo: "Empresa XYZ - Projeto Dev",
    valor: 5000.00,
    status: "vencido"
  },
  {
    id: 4,
    data: "2024-01-25",
    tipo: "pagar",
    titulo: "Marketing Digital - Anúncios",
    valor: 2500.00,
    status: "aberto"
  },
];

export function CalendarioContas() {
  const [mesAtual, setMesAtual] = useState(new Date(2024, 0, 1)); // Janeiro 2024

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
    return eventosCalendario.filter(evento => evento.data === dataString);
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Calendário de Contas</h1>
          <p className="text-gray-600 mt-1">Visualize suas contas a pagar e receber por data</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">A Receber</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">A Pagar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">A Receber Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 7.500,00</div>
            <p className="text-xs text-gray-500">2 contas programadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">A Pagar Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 3.350,00</div>
            <p className="text-xs text-gray-500">2 contas programadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ 5.000,00</div>
            <p className="text-xs text-gray-500">1 conta vencida</p>
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
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Hoje
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {diasSemana.map((dia) => (
              <div key={dia} className="p-2 text-center text-sm font-medium text-gray-500">
                {dia}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {getDiasDoMes(mesAtual).map((diaInfo, index) => {
              const eventos = getEventosParaDia(diaInfo.data);
              const isHoje = diaInfo.data.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    diaInfo.mesAtual ? 'bg-white' : 'bg-gray-50'
                  } ${isHoje ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    diaInfo.mesAtual ? 'text-gray-800' : 'text-gray-400'
                  } ${isHoje ? 'text-blue-600' : ''}`}>
                    {diaInfo.data.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {eventos.map((evento) => (
                      <div
                        key={evento.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                          evento.tipo === 'receber'
                            ? evento.status === 'vencido'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                        title={`${evento.titulo} - ${formatCurrency(evento.valor)}`}
                      >
                        <div className="font-medium truncate">{evento.titulo.split(' - ')[0]}</div>
                        <div className="font-bold">{formatCurrency(evento.valor)}</div>
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
