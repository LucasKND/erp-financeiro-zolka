import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NovoFornecedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalvar: (fornecedor: any) => void;
  fornecedorParaEdicao?: any;
  modoEdicao?: boolean;
}

export function NovoFornecedorDialog({ open, onOpenChange, onSalvar, fornecedorParaEdicao, modoEdicao = false }: NovoFornecedorDialogProps) {
  const [formData, setFormData] = useState({
    // Dados do fornecedor
    tipo: "",
    nome: "",
    
    // Dados de contato
    telefone: "",
    nomeContato: "",
    email: "",
    
    // Dados contábeis
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
    uf: "",
    cep: "",
    
    // Observações
    observacoes: ""
  });

  // Efeito para preencher o formulário quando estiver editando
  useEffect(() => {
    if (modoEdicao && fornecedorParaEdicao) {
      setFormData({
        tipo: fornecedorParaEdicao.tipo === "Pessoa Jurídica" ? "pessoa-juridica" : "pessoa-fisica",
        nome: fornecedorParaEdicao.nome || "",
        telefone: fornecedorParaEdicao.telefone || "",
        nomeContato: fornecedorParaEdicao.nomeContato || "",
        email: fornecedorParaEdicao.email || "",
        cnpj: fornecedorParaEdicao.documento || fornecedorParaEdicao.cnpj || "",
        razaoSocial: fornecedorParaEdicao.razaoSocial || "",
        inscEstadual: fornecedorParaEdicao.inscEstadual || "",
        inscEstIsento: fornecedorParaEdicao.inscEstIsento || false,
        inscMunicipal: fornecedorParaEdicao.inscMunicipal || "",
        inscSuframa: fornecedorParaEdicao.inscSuframa || "",
        rua: fornecedorParaEdicao.rua || "",
        numero: fornecedorParaEdicao.numero || "",
        complemento: fornecedorParaEdicao.complemento || "",
        bairro: fornecedorParaEdicao.bairro || "",
        cidade: fornecedorParaEdicao.cidade || "",
        uf: fornecedorParaEdicao.uf || "",
        cep: fornecedorParaEdicao.cep || "",
        observacoes: fornecedorParaEdicao.observacoes || ""
      });
    } else if (!modoEdicao) {
      // Reset form quando não estiver editando
      setFormData({
        tipo: "",
        nome: "",
        telefone: "",
        nomeContato: "",
        email: "",
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
        uf: "",
        cep: "",
        observacoes: ""
      });
    }
  }, [modoEdicao, fornecedorParaEdicao, open]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validação básica
    if (!formData.nome || !formData.tipo) {
      alert("Por favor, preencha os campos obrigatórios (Nome e Tipo)");
      return;
    }

    // Prepara os dados para salvar
    const dadosParaSalvar = {
      ...formData,
      id: modoEdicao ? fornecedorParaEdicao.id : undefined
    };

    // Chama a função para salvar o fornecedor
    onSalvar(dadosParaSalvar);
    
    // Fecha o modal
    onOpenChange(false);
    
    // Reset form apenas se não estiver editando
    if (!modoEdicao) {
      setFormData({
        tipo: "",
        nome: "",
        telefone: "",
        nomeContato: "",
        email: "",
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
        uf: "",
        cep: "",
        observacoes: ""
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modoEdicao ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          <DialogDescription>
            {modoEdicao ? "Edite as informações do fornecedor" : "Preencha as informações do novo fornecedor"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dados-principais" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados-principais">Dados Principais</TabsTrigger>
            <TabsTrigger value="dados-contabeis">Dados Contábeis</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
          </TabsList>

          <TabsContent value="dados-principais" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pessoa-fisica">Pessoa Física</SelectItem>
                    <SelectItem value="pessoa-juridica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Nome do fornecedor"
                />
              </div>

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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="fornecedor@email.com"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dados-contabeis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange("cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social</Label>
                <Input
                  id="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={(e) => handleInputChange("razaoSocial", e.target.value)}
                  placeholder="Razão social da empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inscEstadual">Inscrição Estadual</Label>
                <Input
                  id="inscEstadual"
                  value={formData.inscEstadual}
                  onChange={(e) => handleInputChange("inscEstadual", e.target.value)}
                  placeholder="000.000.000.000"
                  disabled={formData.inscEstIsento}
                />
              </div>

              <div className="space-y-2 flex items-center space-x-2 pt-8">
                <Checkbox
                  id="inscEstIsento"
                  checked={formData.inscEstIsento}
                  onCheckedChange={(checked) => handleInputChange("inscEstIsento", checked)}
                />
                <Label htmlFor="inscEstIsento">Isento de Inscrição Estadual</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inscMunicipal">Inscrição Municipal</Label>
                <Input
                  id="inscMunicipal"
                  value={formData.inscMunicipal}
                  onChange={(e) => handleInputChange("inscMunicipal", e.target.value)}
                  placeholder="000000000-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inscSuframa">Inscrição Suframa</Label>
                <Input
                  id="inscSuframa"
                  value={formData.inscSuframa}
                  onChange={(e) => handleInputChange("inscSuframa", e.target.value)}
                  placeholder="000.00000.0-00"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="endereco" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Label htmlFor="uf">UF</Label>
                <Select value={formData.uf} onValueChange={(value) => handleInputChange("uf", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="AL">AL</SelectItem>
                    <SelectItem value="AP">AP</SelectItem>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="BA">BA</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="DF">DF</SelectItem>
                    <SelectItem value="ES">ES</SelectItem>
                    <SelectItem value="GO">GO</SelectItem>
                    <SelectItem value="MA">MA</SelectItem>
                    <SelectItem value="MT">MT</SelectItem>
                    <SelectItem value="MS">MS</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                    <SelectItem value="PB">PB</SelectItem>
                    <SelectItem value="PR">PR</SelectItem>
                    <SelectItem value="PE">PE</SelectItem>
                    <SelectItem value="PI">PI</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="RN">RN</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="RO">RO</SelectItem>
                    <SelectItem value="RR">RR</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="SE">SE</SelectItem>
                    <SelectItem value="TO">TO</SelectItem>
                  </SelectContent>
                </Select>
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
          </TabsContent>

          <TabsContent value="observacoes" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder="Informações adicionais sobre o fornecedor..."
                rows={6}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {modoEdicao ? "Salvar Alterações" : "Salvar Fornecedor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
