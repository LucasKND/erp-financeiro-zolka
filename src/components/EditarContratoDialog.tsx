
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EditarContratoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: any;
  onContratoEditado: (contratoEditado: any) => void;
}

export function EditarContratoDialog({ open, onOpenChange, contrato, onContratoEditado }: EditarContratoDialogProps) {
  const [formData, setFormData] = useState({ ...contrato });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: name === "valor" ? Number(value) : value
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simular edição local
      onContratoEditado(formData);
      toast({
        title: "Contrato editado!",
        description: `Contrato ${formData.numero} editado com sucesso.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao editar contrato",
        description: "Não foi possível editar o contrato.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Contrato</DialogTitle>
          <DialogDescription>Altere os dados do contrato e salve as mudanças.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Número</Label>
            <Input name="numero" value={formData.numero} onChange={handleChange} />
          </div>
          <div>
            <Label>Cliente</Label>
            <Input name="cliente" value={formData.cliente} onChange={handleChange} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input name="descricao" value={formData.descricao} onChange={handleChange} />
          </div>
          <div>
            <Label>Valor</Label>
            <Input name="valor" type="number" value={formData.valor} onChange={handleChange} />
          </div>
          <div>
            <Label>Data Início</Label>
            <Input name="dataInicio" type="date" value={formData.dataInicio} onChange={handleChange} />
          </div>
          <div>
            <Label>Data Fim</Label>
            <Input name="dataFim" type="date" value={formData.dataFim} onChange={handleChange} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={v => handleSelectChange("status", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={formData.tipo} onValueChange={v => handleSelectChange("tipo", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Input name="observacoes" value={formData.observacoes} onChange={handleChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
