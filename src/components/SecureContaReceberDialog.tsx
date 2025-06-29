
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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

interface SecureContaReceberDialogProps {
  onContaAdicionada: () => void;
}

export function SecureContaReceberDialog({ onContaAdicionada }: SecureContaReceberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    description: "",
    amount: "",
    is_recurring: false,
    recurring_period: "",
    due_date: ""
  });
  const { toast } = useToast();
  const { profile } = useProfile();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.company_id || !user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado ou empresa não configurada.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Determine status based on due date
      const today = new Date();
      const dueDate = new Date(formData.due_date);
      let status = "open";
      
      if (dueDate < today) {
        status = "overdue";
      }

      const { error } = await supabase
        .from('accounts_receivable')
        .insert([{
          company_id: profile.company_id,
          client_name: formData.client_name,
          description: formData.description,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          status,
          is_recurring: formData.is_recurring,
          recurring_period: formData.is_recurring ? formData.recurring_period : null,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Conta adicionada!",
        description: `Conta de ${formData.client_name} foi criada com sucesso.`,
      });

      // Reset form
      setFormData({
        client_name: "",
        description: "",
        amount: "",
        is_recurring: false,
        recurring_period: "",
        due_date: ""
      });
      
      setOpen(false);
      onContaAdicionada();
    } catch (error) {
      console.error('Error creating account receivable:', error);
      toast({
        title: "Erro ao criar conta",
        description: "Não foi possível criar a conta a receber.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Conta a Receber</DialogTitle>
          <DialogDescription>
            Adicione uma nova conta a receber ao sistema.
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
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="is_recurring">Recorrência</Label>
            <Select
              value={formData.is_recurring ? "true" : "false"}
              onValueChange={(value) => setFormData({ ...formData, is_recurring: value === "true" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Não</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.is_recurring && (
            <div className="space-y-2">
              <Label htmlFor="recurring_period">Período de Recorrência</Label>
              <Select
                value={formData.recurring_period}
                onValueChange={(value) => setFormData({ ...formData, recurring_period: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
