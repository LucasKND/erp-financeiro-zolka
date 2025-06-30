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
import type { Tables } from "@/integrations/supabase/types";

type AccountsReceivable = Tables<'accounts_receivable'>;

interface EditarContaReceberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: AccountsReceivable;
  onContaEditada: () => void;
}

export function EditarContaReceberDialog({ 
  open, 
  onOpenChange, 
  conta, 
  onContaEditada 
}: EditarContaReceberDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    description: "",
    amount: "",
    due_date: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (conta) {
      setFormData({
        client_name: conta.client_name || "",
        description: conta.description || "",
        amount: conta.amount?.toString() || "",
        due_date: conta.due_date ? new Date(conta.due_date).toISOString().split('T')[0] : ""
      });
    }
  }, [conta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!conta) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('accounts_receivable')
        .update({
          client_name: formData.client_name,
          description: formData.description,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date
        })
        .eq('id', conta.id);

      if (error) throw error;

      toast({
        title: "Conta atualizada!",
        description: "A conta a receber foi atualizada com sucesso.",
      });

      onContaEditada();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Erro ao atualizar conta",
        description: "Não foi possível atualizar a conta a receber.",
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
          <DialogTitle>Editar Conta a Receber</DialogTitle>
          <DialogDescription>
            Edite as informações da conta a receber.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Nome do Cliente</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
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
