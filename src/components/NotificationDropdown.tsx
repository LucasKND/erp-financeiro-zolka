
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, TrendingUp, TrendingDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationDropdownProps {
  setActiveModule: (module: string) => void;
}

export function NotificationDropdown({ setActiveModule }: NotificationDropdownProps) {
  const { accounts, loading } = useNotifications();

  // Filtrar contas vencidas
  const contasVencidas = accounts.filter(conta => conta.status === 'overdue');
  
  const contasReceberVencidas = contasVencidas
    .filter(conta => conta.type === 'receivable')
    .map(conta => ({
      id: conta.id,
      cliente: conta.client_name || 'Cliente não informado',
      valor: conta.amount,
      diasAtraso: Math.floor((new Date().getTime() - new Date(conta.due_date).getTime()) / (1000 * 60 * 60 * 24))
    }));

  const contasPagarVencidas = contasVencidas
    .filter(conta => conta.type === 'payable')
    .map(conta => ({
      id: conta.id,
      fornecedor: conta.supplier_name || 'Fornecedor não informado',
      valor: conta.amount,
      diasAtraso: Math.floor((new Date().getTime() - new Date(conta.due_date).getTime()) / (1000 * 60 * 60 * 24))
    }));

  const totalNotificacoes = contasReceberVencidas.length + contasPagarVencidas.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleNotificationClick = (tipo: 'receber' | 'pagar') => {
    setActiveModule(tipo === 'receber' ? 'contas-receber' : 'contas-pagar');
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {totalNotificacoes > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalNotificacoes}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-semibold">Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {contasReceberVencidas.length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm text-red-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Contas a Receber Atrasadas
            </DropdownMenuLabel>
            {contasReceberVencidas.map((conta) => (
              <DropdownMenuItem 
                key={conta.id}
                onClick={() => handleNotificationClick('receber')}
                className="cursor-pointer"
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{conta.cliente}</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(conta.valor)}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {conta.diasAtraso} dias em atraso
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {contasPagarVencidas.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-sm text-orange-600 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Contas a Pagar Atrasadas
            </DropdownMenuLabel>
            {contasPagarVencidas.map((conta) => (
              <DropdownMenuItem 
                key={conta.id}
                onClick={() => handleNotificationClick('pagar')}
                className="cursor-pointer"
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{conta.fornecedor}</span>
                    <span className="text-orange-600 font-semibold">{formatCurrency(conta.valor)}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {conta.diasAtraso} dias em atraso
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {totalNotificacoes === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-gray-500">Nenhuma conta atrasada</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
