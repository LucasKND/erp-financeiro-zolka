
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
import { generateRecurrenceEvents } from "@/lib/dateUtils";

interface NovaContaPagarDialogProps {
  onContaAdicionada: () => void;
}

export function NovaContaPagarDialog({ onContaAdicionada }: NovaContaPagarDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fornecedor: "",
    descricao: "",
    categoria: "",
    valorPrevisto: "",
    recorrencia: "nao",
    periodoRecorrencia: "",
    dataVencimento: ""
  });
  const { toast } = useToast();
  const { profile } = useProfile();

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
      let status: 'open' | 'paid' | 'overdue' = "open";
      
      if (vencimento < hoje) {
        status = "overdue";
      }

      // Cria a conta a pagar no banco
      const { data: conta, error } = await supabase
        .from('accounts_payable')
        .insert({
          company_id: profile.company_id,
          supplier_name: formData.fornecedor,
          description: formData.descricao,
          category: formData.categoria,
          amount: parseFloat(formData.valorPrevisto),
          due_date: formData.dataVencimento,
          status,
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Conta adicionada!",
        description: `Conta de ${formData.fornecedor} foi criada com sucesso e aparecerá no calendário.`,
      });

      onContaAdicionada();
      
      // Reset form
      setFormData({
        fornecedor: "",
        descricao: "",
        categoria: "",
        valorPrevisto: "",
        recorrencia: "nao",
        periodoRecorrencia: "",
        dataVencimento: ""
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro ao criar conta",
        description: "Não foi possível criar a conta a pagar.",
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
          <DialogTitle>Nova Conta a Pagar</DialogTitle>
          <DialogDescription>
            Adicione uma nova conta a pagar ao sistema.
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
            <Label htmlFor="valor">Valor Previsto</Label>
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
            <Label htmlFor="recorrencia">Recorrência</Label>
            <Select
              value={formData.recorrencia}
              onValueChange={(value) => setFormData({ ...formData, recorrencia: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Não</SelectItem>
                <SelectItem value="sim">Sim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.recorrencia === "sim" && (
            <div className="space-y-2">
              <Label htmlFor="periodo">Período de Recorrência</Label>
              <Select
                value={formData.periodoRecorrencia}
                onValueChange={(value) => setFormData({ ...formData, periodoRecorrencia: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
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
