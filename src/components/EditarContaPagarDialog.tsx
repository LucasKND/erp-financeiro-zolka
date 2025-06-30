import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import type { Tables } from "@/integrations/supabase/types";

type AccountsPayable = Tables<'accounts_payable'>;

interface EditarContaPagarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: AccountsPayable;
  onContaEditada: () => void;
}

export function EditarContaPagarDialog({ 
  open, 
  onOpenChange, 
  conta, 
  onContaEditada 
}: EditarContaPagarDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fornecedor: "",
    descricao: "",
    categoria: "",
    valorPrevisto: "",
    dataVencimento: "",
    status: ""
  });
  const { toast } = useToast();
  const { profile } = useProfile();

  useEffect(() => {
    if (conta) {
      setFormData({
        fornecedor: conta.supplier_name,
        descricao: conta.description,
        categoria: conta.category,
        valorPrevisto: conta.amount.toString(),
        dataVencimento: conta.due_date,
        status: conta.status
      });
    }
  }, [conta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.company_id) {
      toast({
        title: "Erro",
        description: "Company ID não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const hoje = new Date();
      const vencimento = new Date(formData.dataVencimento);
      let status: 'open' | 'paid' | 'overdue' = formData.status as 'open' | 'paid' | 'overdue';
      
      // Atualizar status automaticamente se não foi pago e venceu
      if (status !== 'paid' && vencimento < hoje) {
        status = "overdue";
      } else if (status !== 'paid' && vencimento >= hoje) {
        status = "open";
      }

      const { error } = await supabase
        .from('accounts_payable')
        .update({
          supplier_name: formData.fornecedor,
          description: formData.descricao,
          category: formData.categoria,
          amount: parseFloat(formData.valorPrevisto),
          due_date: formData.dataVencimento,
          status,
        })
        .eq('id', conta.id);

      if (error) throw error;

      toast({
        title: "Conta atualizada!",
        description: `Conta de ${formData.fornecedor} foi atualizada com sucesso.`,
      });

      onContaEditada();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro ao atualizar conta",
        description: "Não foi possível atualizar a conta a pagar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Conta a Pagar</DialogTitle>
          <DialogDescription>
            Edite as informações da conta a pagar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fornecedor">Nome do Fornecedor</Label>
            <Input
              id="fornecedor"
              value={formData.fornecedor}
              onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Operacional">Operacional</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="Pessoal">Pessoal</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valorPrevisto}
              onChange={(e) => setFormData({ ...formData, valorPrevisto: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vencimento">Data de Vencimento</Label>
            <Input
              id="vencimento"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
