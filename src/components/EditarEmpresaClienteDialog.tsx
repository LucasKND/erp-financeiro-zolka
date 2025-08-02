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
import { useClientManagement, ClientCompany } from "@/hooks/useClientManagement";

interface EditarEmpresaClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: ClientCompany | null;
  onEmpresaUpdated: () => void;
}

export function EditarEmpresaClienteDialog({ 
  open, 
  onOpenChange, 
  company,
  onEmpresaUpdated 
}: EditarEmpresaClienteDialogProps) {
  const { updateClientCompany } = useClientManagement();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    accessCode: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        accessCode: company.access_code || "",
      });
    }
  }, [company]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!company || !formData.name.trim() || !formData.accessCode.trim()) return;

    setLoading(true);
    try {
      const success = await updateClientCompany(company.id, formData.name, formData.accessCode);
      if (success) {
        onEmpresaUpdated();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Empresa Cliente</DialogTitle>
          <DialogDescription>
            Altere as informações da empresa cliente
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome da Empresa</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Empresa ABC Ltda"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-accessCode">Código de Acesso</Label>
            <Input
              id="edit-accessCode"
              value={formData.accessCode}
              onChange={(e) => handleChange('accessCode', e.target.value)}
              placeholder="Ex: ABC123"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Código único para identificar a empresa no sistema
            </p>
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
            disabled={loading || !formData.name.trim() || !formData.accessCode.trim()}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}