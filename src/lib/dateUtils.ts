export interface RecurrenceEvent {
  date: string;
  title: string;
  amount: number;
  type: 'pagar' | 'receber';
  supplier_name?: string;
  description?: string;
  status: 'open' | 'paid' | 'overdue';
  accountId?: string;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function generateRecurrenceEvents(
  startDate: string,
  recurrence: string,
  period: string,
  title: string,
  amount: number,
  supplier_name?: string,
  description?: string,
  accountId?: string
): RecurrenceEvent[] {
  if (recurrence !== 'sim') {
    // Se não é recorrente, retorna apenas um evento
    const today = new Date();
    const eventDate = new Date(startDate);
    const status = eventDate < today ? 'overdue' : 'open';
    
    return [{
      date: startDate,
      title,
      amount,
      type: 'pagar',
      supplier_name,
      description,
      status,
      accountId
    }];
  }

  const events: RecurrenceEvent[] = [];
  let currentDate = new Date(startDate);
  const today = new Date();
  const endDate = new Date();
  
  // Define até quando gerar eventos recorrentes (12 meses no futuro)
  endDate.setFullYear(endDate.getFullYear() + 1);

  let iteration = 0;
  const maxIterations = 24; // Limite de segurança

  while (currentDate <= endDate && iteration < maxIterations) {
    const dateString = currentDate.toISOString().split('T')[0];
    const status = currentDate < today ? 'overdue' : 'open';
    
    events.push({
      date: dateString,
      title,
      amount,
      type: 'pagar',
      supplier_name,
      description,
      status,
      accountId
    });

    // Calcula a próxima data baseada no período
    switch (period) {
      case 'mensal':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'semestral':
        currentDate = addMonths(currentDate, 6);
        break;
      case 'anual':
        currentDate = addYears(currentDate, 1);
        break;
      default:
        // Se o período não é reconhecido, para a geração
        return events;
    }
    
    iteration++;
  }

  return events;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

// Funções para formatação de datas no padrão brasileiro
// Função para formatar data no padrão brasileiro (dd/mm/yyyy)
export const formatDateBR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Função para converter data brasileira (dd/mm/yyyy) para formato ISO (yyyy-mm-dd)
export const convertBRDateToISO = (brazilianDate: string) => {
  if (!brazilianDate) return '';
  const [dia, mes, ano] = brazilianDate.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};

// Função para converter data ISO (yyyy-mm-dd) para formato brasileiro (dd/mm/yyyy)
export const convertISODateToBR = (isoDate: string) => {
  if (!isoDate) return '';
  const [ano, mes, dia] = isoDate.split('-');
  return `${dia}/${mes}/${ano}`;
};

// Função para converter data brasileira (dd/mm/yyyy) para objeto Date
export const parseBRDate = (brazilianDate: string) => {
  if (!brazilianDate) return null;
  const [dia, mes, ano] = brazilianDate.split('/');
  return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
};
