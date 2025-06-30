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
import { Switch } from "@/components/ui/switch";
import { Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditarContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContaEditada: (conta: any) => void;
  conta: any;
}

export function EditarContaBancariaDialog({ 
  open, 
  onOpenChange, 
  onContaEditada, 
  conta 
}: EditarContaBancariaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    banco: "",
    agencia: "",
    conta: "",
    digitoConta: "",
    tipoConta: "",
    titular: "",
    ativa: true
  });
  const { toast } = useToast();

  // Carregar dados da conta quando o modal abrir
  useEffect(() => {
    if (conta && open) {
      // Extrair número da conta e dígito
      const contaParts = conta.conta ? conta.conta.split('-') : ['', ''];
      setFormData({
        banco: getBancoCode(conta.banco) || "",
        agencia: conta.agencia || "",
        conta: contaParts[0] || "",
        digitoConta: contaParts[1] || "",
        tipoConta: conta.tipoConta || "",
        titular: conta.titular || "",
        ativa: conta.ativa !== undefined ? conta.ativa : true
      });
    }
  }, [conta, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.banco || !formData.agencia || !formData.conta || !formData.titular) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      // Simular atualização (aqui você pode implementar a lógica do banco de dados)
      const contaAtualizada = {
        ...conta,
        banco: getBancoNome(formData.banco),
        agencia: formData.agencia,
        conta: formData.conta + (formData.digitoConta ? `-${formData.digitoConta}` : ''),
        tipoConta: formData.tipoConta,
        titular: formData.titular,
        ativa: formData.ativa,
        updated_at: new Date().toISOString()
      };

      onContaEditada(contaAtualizada);
      
      toast({
        title: "Conta bancária atualizada!",
        description: "A conta foi atualizada com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao editar conta bancária:', error);
      toast({
        title: "Erro ao editar conta",
        description: "Não foi possível editar a conta bancária.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBancoNome = (banco: string) => {
    const bancos: { [key: string]: string } = {
      "banco-do-brasil": "Banco do Brasil",
      "itau": "Itaú",
      "bradesco": "Bradesco",
      "santander": "Santander",
      "caixa": "Caixa Econômica Federal",
      "nubank": "Nubank",
      "inter": "Banco Inter",
      "sicoob": "Sicoob",
      "sicredi": "Sicredi",
      "outros": "Outros"
    };
    return bancos[banco] || banco;
  };

  const getBancoCode = (nomeCompleto: string) => {
    const bancos: { [key: string]: string } = {
      "Banco do Brasil": "banco-do-brasil",
      "Itaú": "itau",
      "Bradesco": "bradesco",
      "Santander": "santander",
      "Caixa Econômica Federal": "caixa",
      "Nubank": "nubank",
      "Banco Inter": "inter",
      "Sicoob": "sicoob",
      "Sicredi": "sicredi",
      "Outros": "outros"
    };
    return bancos[nomeCompleto];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Editar Conta Bancária
          </DialogTitle>
          <DialogDescription>
            Edite as informações da conta bancária.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="banco">Banco *</Label>
              <Select 
                value={formData.banco} 
                onValueChange={(value) => setFormData({ ...formData, banco: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banco-do-brasil">Banco do Brasil</SelectItem>
                  <SelectItem value="itau">Itaú</SelectItem>
                  <SelectItem value="bradesco">Bradesco</SelectItem>
                  <SelectItem value="santander">Santander</SelectItem>
                  <SelectItem value="caixa">Caixa Econômica Federal</SelectItem>
                  <SelectItem value="nubank">Nubank</SelectItem>
                  <SelectItem value="inter">Banco Inter</SelectItem>
                  <SelectItem value="sicoob">Sicoob</SelectItem>
                  <SelectItem value="sicredi">Sicredi</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="agencia">Agência *</Label>
              <Input
                id="agencia"
                placeholder="1234-5"
                value={formData.agencia}
                onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="tipoConta">Tipo de Conta</Label>
              <Select 
                value={formData.tipoConta} 
                onValueChange={(value) => setFormData({ ...formData, tipoConta: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Poupança</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="conta">Número da Conta *</Label>
              <Input
                id="conta"
                placeholder="12345"
                value={formData.conta}
                onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="digitoConta">Dígito</Label>
              <Input
                id="digitoConta"
                placeholder="6"
                maxLength={2}
                value={formData.digitoConta}
                onChange={(e) => setFormData({ ...formData, digitoConta: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="titular">Titular da Conta *</Label>
              <Input
                id="titular"
                placeholder="Nome do titular"
                value={formData.titular}
                onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                checked={formData.ativa}
                onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
              />
              <Label>Conta ativa</Label>
            </div>
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
