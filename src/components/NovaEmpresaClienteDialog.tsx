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
import { useClientManagement } from "@/hooks/useClientManagement";

interface NovaEmpresaClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmpresaCreated: () => void;
}

export function NovaEmpresaClienteDialog({ 
  open, 
  onOpenChange, 
  onEmpresaCreated 
}: NovaEmpresaClienteDialogProps) {
  const { createClientCompany } = useClientManagement();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    accessCode: "",
  });

  const generateAccessCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, accessCode: code }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.accessCode.trim()) return;

    setLoading(true);
    try {
      const result = await createClientCompany(formData.name, formData.accessCode);
      
      if (result) {
        // Reset form
        setFormData({ name: "", accessCode: "" });
        onEmpresaCreated();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao criar empresa cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Empresa Cliente</DialogTitle>
          <DialogDescription>
            Cadastre uma nova empresa para gerenciar seus dados financeiros
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Empresa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Empresa ABC Ltda"
              required
            />
          </div>

          <div>
            <Label htmlFor="accessCode">Código de Acesso</Label>
            <div className="flex space-x-2">
              <Input
                id="accessCode"
                value={formData.accessCode}
                onChange={(e) => handleChange('accessCode', e.target.value)}
                placeholder="Ex: ABC123"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateAccessCode}
              >
                Gerar
              </Button>
            </div>
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
            {loading ? "Criando..." : "Criar Empresa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}