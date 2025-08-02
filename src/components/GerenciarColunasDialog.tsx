import { useState } from "react";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCRM, CRMColumn } from "@/hooks/useCRM";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GerenciarColunasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GerenciarColunasDialog({ open, onOpenChange }: GerenciarColunasDialogProps) {
  const { columns, cards, refetch } = useCRM();
  const { toast } = useToast();
  const [newColumnName, setNewColumnName] = useState("");
  const [editingColumn, setEditingColumn] = useState<CRMColumn | null>(null);
  const [deleteColumn, setDeleteColumn] = useState<CRMColumn | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    setLoading(true);
    try {
      // Get user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.company_id) throw new Error('Company not found');

      const maxPosition = Math.max(...columns.map(col => col.position), 0);
      
      const { error } = await supabase
        .from('crm_columns')
        .insert({
          name: newColumnName,
          position: maxPosition + 1,
          company_id: profile.company_id
        });

      if (error) throw error;

      setNewColumnName("");
      await refetch();
      
      toast({
        title: "Coluna adicionada!",
        description: `A coluna "${newColumnName}" foi criada com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar coluna",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditColumn = async () => {
    if (!editingColumn || !editingColumn.name.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('crm_columns')
        .update({ name: editingColumn.name })
        .eq('id', editingColumn.id);

      if (error) throw error;

      setEditingColumn(null);
      await refetch();
      
      toast({
        title: "Coluna atualizada!",
        description: "O nome da coluna foi alterado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar coluna",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async () => {
    if (!deleteColumn) return;

    // Verificar se há cartões na coluna
    const cardsInColumn = cards.filter(card => card.column_id === deleteColumn.id);
    if (cardsInColumn.length > 0) {
      toast({
        title: "Não é possível excluir",
        description: `A coluna "${deleteColumn.name}" contém ${cardsInColumn.length} cartão(s). Mova ou exclua os cartões primeiro.`,
        variant: "destructive",
      });
      setDeleteColumn(null);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('crm_columns')
        .delete()
        .eq('id', deleteColumn.id);

      if (error) throw error;

      setDeleteColumn(null);
      await refetch();
      
      toast({
        title: "Coluna excluída!",
        description: `A coluna "${deleteColumn.name}" foi removida com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir coluna",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCardCount = (columnId: string) => {
    return cards.filter(card => card.column_id === columnId).length;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Colunas do CRM</DialogTitle>
            <DialogDescription>
              Personalize as colunas do seu quadro Kanban
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Adicionar nova coluna */}
            <div className="space-y-2">
              <Label htmlFor="new-column">Nova Coluna</Label>
              <div className="flex space-x-2">
                <Input
                  id="new-column"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Nome da nova coluna"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                />
                <Button 
                  onClick={handleAddColumn} 
                  disabled={loading || !newColumnName.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Lista de colunas existentes */}
            <div className="space-y-2">
              <Label>Colunas Existentes</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Cartões</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map((column) => (
                    <TableRow key={column.id}>
                      <TableCell className="font-medium">{column.name}</TableCell>
                      <TableCell>{column.position}</TableCell>
                      <TableCell>{getCardCount(column.id)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingColumn({ ...column })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteColumn(column)}
                            disabled={getCardCount(column.id) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar coluna */}
      <Dialog open={!!editingColumn} onOpenChange={() => setEditingColumn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Coluna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome da Coluna</Label>
              <Input
                id="edit-name"
                value={editingColumn?.name || ""}
                onChange={(e) => setEditingColumn(prev => 
                  prev ? { ...prev, name: e.target.value } : null
                )}
                onKeyPress={(e) => e.key === 'Enter' && handleEditColumn()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingColumn(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditColumn} disabled={loading}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para excluir */}
      <ConfirmDeleteDialog
        open={!!deleteColumn}
        onOpenChange={() => setDeleteColumn(null)}
        title="Excluir Coluna"
        description={`Tem certeza que deseja excluir a coluna "${deleteColumn?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteColumn}
      />
    </>
  );
}