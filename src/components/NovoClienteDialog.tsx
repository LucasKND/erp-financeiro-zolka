import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NovoClienteDialogProps {
  onClienteAdicionado?: (cliente: any) => void;
  clienteParaEditar?: any;
  onClienteEditado?: (cliente: any) => void;
  onCancelarEdicao?: () => void;
}

export function NovoClienteDialog({ onClienteAdicionado, clienteParaEditar, onClienteEditado, onCancelarEdicao }: NovoClienteDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Dados do cliente
    tipo: "",
    nome: "",
    // Dados de contato
    telefone: "",
    nomeContato: "",
    email: "",
    // Dados contábeis
    cpf: "",
    cnpj: "",
    razaoSocial: "",
    inscEstadual: "",
    inscEstIsento: false,
    inscMunicipal: "",
    inscSuframa: "",
    // Endereço
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    cep: "",
    // Observações
    observacoes: ""
  });

  const isEditMode = !!clienteParaEditar;

  useEffect(() => {
    if (clienteParaEditar) {
      setFormData({
        tipo: clienteParaEditar.tipo || "",
        nome: clienteParaEditar.nome || "",
        telefone: clienteParaEditar.telefone || "",
        nomeContato: clienteParaEditar.nomeContato || "",
        email: clienteParaEditar.email || "",
        cpf: clienteParaEditar.cpf || "",
        cnpj: clienteParaEditar.cnpj || "",
        razaoSocial: clienteParaEditar.razaoSocial || "",
        inscEstadual: clienteParaEditar.inscEstadual || "",
        inscEstIsento: clienteParaEditar.inscEstIsento || false,
        inscMunicipal: clienteParaEditar.inscMunicipal || "",
        inscSuframa: clienteParaEditar.inscSuframa || "",
        rua: clienteParaEditar.rua || "",
        numero: clienteParaEditar.numero || "",
        complemento: clienteParaEditar.complemento || "",
        bairro: clienteParaEditar.bairro || "",
        cidade: clienteParaEditar.cidade || "",
        cep: clienteParaEditar.cep || "",
        observacoes: clienteParaEditar.observacoes || ""
      });
      setOpen(true);
    }
  }, [clienteParaEditar]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.tipo || !formData.nome) {
      toast({
        title: "Erro",
        description: "Tipo e Nome são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (isEditMode) {
      // Modo edição
      const clienteAtualizado = {
        ...clienteParaEditar,
        ...formData
      };
      
      onClienteEditado?.(clienteAtualizado);
      
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
    } else {
      // Modo criação
      onClienteAdicionado?.(formData);
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!",
      });
    }

    // Reset do formulário
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setFormData({
      tipo: "",
      nome: "",
      telefone: "",
      nomeContato: "",
      email: "",
      cpf: "",
      cnpj: "",
      razaoSocial: "",
      inscEstadual: "",
      inscEstIsento: false,
      inscMunicipal: "",
      inscSuframa: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      cep: "",
      observacoes: ""
    });
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
    if (isEditMode) {
      onCancelarEdicao?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Cliente" : "Adicionar Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Atualize os dados do cliente" : "Preencha os dados para adicionar um novo cliente ao sistema"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                    <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Nome completo ou razão social"
                />
              </div>
            </div>
          </div>

          {/* Dados de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados de Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeContato">Nome de Contato</Label>
                <Input
                  id="nomeContato"
                  value={formData.nomeContato}
                  onChange={(e) => handleInputChange("nomeContato", e.target.value)}
                  placeholder="Nome da pessoa de contato"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          {/* Dados Contábeis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados Contábeis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.tipo === "Pessoa Física" && (
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
              )}
              {formData.tipo === "Pessoa Jurídica" && (
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              )}
              {formData.tipo === "Pessoa Jurídica" && (
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => handleInputChange("razaoSocial", e.target.value)}
                    placeholder="Razão social da empresa"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="inscEstadual">Inscrição Estadual</Label>
                <Input
                  id="inscEstadual"
                  value={formData.inscEstadual}
                  onChange={(e) => handleInputChange("inscEstadual", e.target.value)}
                  placeholder="000.000.000.000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inscMunicipal">Inscrição Municipal</Label>
                <Input
                  id="inscMunicipal"
                  value={formData.inscMunicipal}
                  onChange={(e) => handleInputChange("inscMunicipal", e.target.value)}
                  placeholder="Inscrição municipal"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inscEstIsento"
                  checked={formData.inscEstIsento}
                  onCheckedChange={(checked) => handleInputChange("inscEstIsento", checked as boolean)}
                />
                <Label htmlFor="inscEstIsento">Isento de Inscrição Estadual</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inscSuframa">Inscrição Suframa</Label>
                <Input
                  id="inscSuframa"
                  value={formData.inscSuframa}
                  onChange={(e) => handleInputChange("inscSuframa", e.target.value)}
                  placeholder="Inscrição Suframa"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  value={formData.rua}
                  onChange={(e) => handleInputChange("rua", e.target.value)}
                  placeholder="Nome da rua"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange("complemento", e.target.value)}
                  placeholder="Apto, sala, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Observações</h3>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder="Informações adicionais sobre o cliente..."
                rows={4}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditMode ? "Atualizar Cliente" : "Adicionar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
