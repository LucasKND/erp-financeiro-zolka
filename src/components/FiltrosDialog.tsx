
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface FiltrosDialogProps {
  onFiltrosAplicados: (filtros: any) => void;
  tipo: "receber" | "pagar";
}

export function FiltrosDialog({ onFiltrosAplicados, tipo }: FiltrosDialogProps) {
  const [open, setOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    status: "",
    dataInicio: "",
    dataFim: "",
    vencimentoInicio: "",
    vencimentoFim: ""
  });

  const handleAplicarFiltros = () => {
    onFiltrosAplicados(filtros);
    setOpen(false);
  };

  const handleLimparFiltros = () => {
    const filtrosLimpos = {
      status: "",
      dataInicio: "",
      dataFim: "",
      vencimentoInicio: "",
      vencimentoFim: ""
    };
    setFiltros(filtrosLimpos);
    onFiltrosAplicados(filtrosLimpos);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
          <DialogDescription>
            Filtre as contas a {tipo === "receber" ? "receber" : "pagar"} por diferentes critérios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filtros.status}
              onValueChange={(value) => setFiltros({ ...filtros, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value={tipo === "receber" ? "recebido" : "pago"}>
                  {tipo === "receber" ? "Recebido" : "Pago"}
                </SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vencimentoInicio">Vencimento Início</Label>
              <Input
                id="vencimentoInicio"
                type="date"
                value={filtros.vencimentoInicio}
                onChange={(e) => setFiltros({ ...filtros, vencimentoInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vencimentoFim">Vencimento Fim</Label>
              <Input
                id="vencimentoFim"
                type="date"
                value={filtros.vencimentoFim}
                onChange={(e) => setFiltros({ ...filtros, vencimentoFim: e.target.value })}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleLimparFiltros}>
            Limpar
          </Button>
          <Button type="button" onClick={handleAplicarFiltros}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
