import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CRMCard, CRMLabel, useCRM } from "@/hooks/useCRM";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GerenciarEtiquetasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CRMCard;
  onUpdate?: () => void;
}

export function GerenciarEtiquetasDialog({ 
  open, 
  onOpenChange, 
  card,
  onUpdate
}: GerenciarEtiquetasDialogProps) {
  const { labels, refetch } = useCRM();
  const { toast } = useToast();
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    card?.labels?.map(l => l.id) || []
  );
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(false);

  const predefinedColors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", 
    "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"
  ];

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.company_id) throw new Error('Company not found');

      const { error } = await supabase
        .from('crm_labels')
        .insert({
          name: newLabelName,
          color: newLabelColor,
          company_id: profile.company_id
        });

      if (error) throw error;

      setNewLabelName("");
      setNewLabelColor("#3b82f6");
      await refetch();
      
      toast({
        title: "Etiqueta criada!",
        description: `A etiqueta "${newLabelName}" foi criada com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar etiqueta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    try {
      const { error } = await supabase
        .from('crm_labels')
        .delete()
        .eq('id', labelId);

      if (error) throw error;

      await refetch();
      
      toast({
        title: "Etiqueta excluída!",
        description: "A etiqueta foi removida com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir etiqueta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleSaveCardLabels = async () => {
    if (!card) return;

    setLoading(true);
    try {
      // Remove todas as etiquetas existentes do cartão
      await supabase
        .from('crm_card_labels')
        .delete()
        .eq('card_id', card.id);

      // Adiciona as etiquetas selecionadas
      if (selectedLabels.length > 0) {
        const cardLabels = selectedLabels.map(labelId => ({
          card_id: card.id,
          label_id: labelId
        }));

        const { error } = await supabase
          .from('crm_card_labels')
          .insert(cardLabels);

        if (error) throw error;
      }

      onUpdate?.();
      onOpenChange(false);
      
      toast({
        title: "Etiquetas atualizadas!",
        description: "As etiquetas do cartão foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar etiquetas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {card ? "Gerenciar Etiquetas do Cartão" : "Gerenciar Etiquetas"}
          </DialogTitle>
          <DialogDescription>
            {card 
              ? "Selecione as etiquetas para este cartão"
              : "Crie e gerencie etiquetas do sistema"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Criar nova etiqueta */}
          <div className="space-y-4">
            <Label>Criar Nova Etiqueta</Label>
            <div className="space-y-2">
              <Input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Nome da etiqueta"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateLabel()}
              />
              <div className="flex items-center space-x-2">
                <Label htmlFor="color-picker" className="text-sm">Cor:</Label>
                <input
                  id="color-picker"
                  type="color"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="w-8 h-8 rounded border"
                />
                <div className="flex space-x-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewLabelColor(color)}
                      className="w-6 h-6 rounded border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button 
                onClick={handleCreateLabel} 
                disabled={loading || !newLabelName.trim()}
                size="sm"
              >
                Criar Etiqueta
              </Button>
            </div>
          </div>

          {/* Lista de etiquetas */}
          <div className="space-y-2">
            <Label>Etiquetas Disponíveis</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    {card && (
                      <Checkbox
                        checked={selectedLabels.includes(label.id)}
                        onCheckedChange={() => toggleLabel(label.id)}
                      />
                    )}
                    <Badge
                      variant="secondary"
                      style={{ 
                        backgroundColor: label.color + '20', 
                        color: label.color,
                        borderColor: label.color + '40'
                      }}
                    >
                      {label.name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLabel(label.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {card && (
            <Button onClick={handleSaveCardLabels} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Etiquetas"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}