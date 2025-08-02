import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useCRM, CRMCard } from "@/hooks/useCRM";

interface EditarCartaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CRMCard;
  onCardUpdated: () => void;
}

export function EditarCartaoDialog({ 
  open, 
  onOpenChange, 
  card,
  onCardUpdated 
}: EditarCartaoDialogProps) {
  const { columns, updateCard } = useCRM();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    contact_name: "",
    email: "",
    phone: "",
    project_summary: "",
    description: "",
    column_id: "",
  });

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || "",
        contact_name: card.contact_name || "",
        email: card.email || "",
        phone: card.phone || "",
        project_summary: card.project_summary || "",
        description: card.description || "",
        column_id: card.column_id || "",
      });
    }
  }, [card]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.column_id) return;

    setLoading(true);
    try {
      await updateCard(card.id, {
        title: formData.title,
        contact_name: formData.contact_name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        project_summary: formData.project_summary || undefined,
        description: formData.description || undefined,
        column_id: formData.column_id,
      });

      onCardUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente/Projeto</DialogTitle>
          <DialogDescription>
            Altere as informações do cliente ou projeto
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="column">Coluna</Label>
            <Select value={formData.column_id} onValueChange={(value) => handleChange('column_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a coluna" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contact_name">Nome da Empresa/Cliente</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => handleChange('contact_name', e.target.value)}
              placeholder="Ex: Padaria Doce Sonho"
            />
          </div>

          <div>
            <Label htmlFor="project_summary">Nome do Projeto</Label>
            <Input
              id="project_summary"
              value={formData.project_summary}
              onChange={(e) => handleChange('project_summary', e.target.value)}
              placeholder="Ex: Website Institucional"
            />
          </div>

          <div>
            <Label htmlFor="title">Título do Cartão</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Padaria Doce Sonho - Website Institucional"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contato@empresa.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="description">Resumo do Projeto</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva brevemente o escopo e objetivo do projeto..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.title.trim() || !formData.column_id}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}