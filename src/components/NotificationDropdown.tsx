
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, TrendingUp, TrendingDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationDropdownProps {
  setActiveModule: (module: string) => void;
}

export function NotificationDropdown({ setActiveModule }: NotificationDropdownProps) {
  const [contasAtrasadas, setContasAtrasadas] = useState({
    receber: [
      { id: 1, cliente: "João Silva", valor: 2500.00, diasAtraso: 5 },
      { id: 3, cliente: "Empresa XYZ", valor: 5000.00, diasAtraso: 10 }
    ],
    pagar: [
      { id: 3, fornecedor: "Marketing Digital", valor: 2500.00, diasAtraso: 7 }
    ]
  });

  const totalNotificacoes = contasAtrasadas.receber.length + contasAtrasadas.pagar.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleNotificationClick = (tipo: 'receber' | 'pagar') => {
    setActiveModule(tipo === 'receber' ? 'contas-receber' : 'contas-pagar');
  };

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
        
        {contasAtrasadas.receber.length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm text-red-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Contas a Receber Atrasadas
            </DropdownMenuLabel>
            {contasAtrasadas.receber.map((conta) => (
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

        {contasAtrasadas.pagar.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-sm text-orange-600 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Contas a Pagar Atrasadas
            </DropdownMenuLabel>
            {contasAtrasadas.pagar.map((conta) => (
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
