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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, CreditCard, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NovoContratoDialogProps {
  onContratoAdicionado: () => void;
}

export function NovoContratoDialog({ onContratoAdicionado }: NovoContratoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dados");
  const [formData, setFormData] = useState({
    cliente: "",
    dataEmissao: new Date().toISOString().split('T')[0], // Data atual
    vigenciaInicio: "",
    vigenciaFinal: "",
    categoria: "",
    numeroParcelas: "",
    valorParcela: "",
    periodo: ""
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // TODO: Implementar salvamento no banco de dados
      
      toast({
        title: "Contrato criado!",
        description: `Contrato para ${formData.cliente} foi criado com sucesso.`,
      });

      onContratoAdicionado();
      
      // Reset form
      setFormData({
        cliente: "",
        dataEmissao: new Date().toISOString().split('T')[0],
        vigenciaInicio: "",
        vigenciaFinal: "",
        categoria: "",
        numeroParcelas: "",
        valorParcela: "",
        periodo: ""
      });
      
      setActiveTab("dados");
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      toast({
        title: "Erro ao criar contrato",
        description: "Não foi possível criar o contrato.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (step: string) => {
    switch (step) {
      case "dados":
        return formData.cliente && formData.dataEmissao && formData.vigenciaInicio && formData.vigenciaFinal && formData.categoria;
      case "pagamento":
        return formData.numeroParcelas && formData.valorParcela && formData.periodo;
      default:
        return true;
    }
  };

  const canProceedToNext = (currentStep: string) => {
    return isStepComplete(currentStep);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Novo Contrato
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do contrato em 3 etapas simples.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Dados do Contrato</span>
              <span className="sm:hidden">1</span>
            </TabsTrigger>
            <TabsTrigger value="pagamento" className="flex items-center gap-2" disabled={!isStepComplete("dados")}>
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Forma de Pagamento</span>
              <span className="sm:hidden">2</span>
            </TabsTrigger>
            <TabsTrigger value="revisao" className="flex items-center gap-2" disabled={!isStepComplete("pagamento")}>
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Revisão</span>
              <span className="sm:hidden">3</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Dados do Contrato</CardTitle>
                <CardDescription>Informações básicas do contrato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Input
                    id="cliente"
                    placeholder="Nome do cliente"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataEmissao">Data de Emissão *</Label>
                  <Input
                    id="dataEmissao"
                    type="date"
                    value={formData.dataEmissao}
                    onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vigenciaInicio">Vigência Início *</Label>
                    <Input
                      id="vigenciaInicio"
                      type="date"
                      value={formData.vigenciaInicio}
                      onChange={(e) => setFormData({ ...formData, vigenciaInicio: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vigenciaFinal">Vigência Final *</Label>
                    <Input
                      id="vigenciaFinal"
                      type="date"
                      value={formData.vigenciaFinal}
                      onChange={(e) => setFormData({ ...formData, vigenciaFinal: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="consultoria">Consultoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagamento" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Forma de Pagamento</CardTitle>
                <CardDescription>Defina como o pagamento será realizado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroParcelas">Número de Parcelas *</Label>
                  <Input
                    id="numeroParcelas"
                    type="number"
                    min="1"
                    placeholder="Ex: 2"
                    value={formData.numeroParcelas}
                    onChange={(e) => setFormData({ ...formData, numeroParcelas: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorParcela">Valor da Parcela *</Label>
                  <Input
                    id="valorParcela"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valorParcela}
                    onChange={(e) => setFormData({ ...formData, valorParcela: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodo">Período *</Label>
                  <Select
                    value={formData.periodo}
                    onValueChange={(value) => setFormData({ ...formData, periodo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="bimestral">Bimestral</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revisao" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Revisão</CardTitle>
                <CardDescription>Confira os dados antes de salvar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Cliente:</strong>
                    <p>{formData.cliente || "Não informado"}</p>
                  </div>
                  <div>
                    <strong>Data de Emissão:</strong>
                    <p>{new Date(formData.dataEmissao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <strong>Vigência Início:</strong>
                    <p>{formData.vigenciaInicio ? new Date(formData.vigenciaInicio).toLocaleDateString('pt-BR') : "Não informado"}</p>
                  </div>
                  <div>
                    <strong>Vigência Final:</strong>
                    <p>{formData.vigenciaFinal ? new Date(formData.vigenciaFinal).toLocaleDateString('pt-BR') : "Não informado"}</p>
                  </div>
                  <div>
                    <strong>Categoria:</strong>
                    <p>{formData.categoria || "Não informada"}</p>
                  </div>
                  <div>
                    <strong>Número de Parcelas:</strong>
                    <p>{formData.numeroParcelas || "Não informado"}</p>
                  </div>
                  <div>
                    <strong>Valor da Parcela:</strong>
                    <p>{formData.valorParcela ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(formData.valorParcela)) : "R$ 0,00"}</p>
                  </div>
                  <div>
                    <strong>Período:</strong>
                    <p>{formData.periodo || "Não informado"}</p>
                  </div>
                </div>

                {formData.numeroParcelas && formData.valorParcela && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <strong>Valor Total do Contrato:</strong>
                    <p className="text-lg font-semibold text-blue-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(formData.numeroParcelas) * Number(formData.valorParcela))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {activeTab !== "dados" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeTab === "pagamento") setActiveTab("dados");
                  if (activeTab === "revisao") setActiveTab("pagamento");
                }}
              >
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            
            {activeTab === "dados" && (
              <Button
                type="button"
                onClick={() => setActiveTab("pagamento")}
                disabled={!canProceedToNext("dados")}
              >
                Próximo
              </Button>
            )}
            
            {activeTab === "pagamento" && (
              <Button
                type="button"
                onClick={() => setActiveTab("revisao")}
                disabled={!canProceedToNext("pagamento")}
              >
                Próximo
              </Button>
            )}
            
            {activeTab === "revisao" && (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !isStepComplete("dados") || !isStepComplete("pagamento")}
              >
                {loading ? "Salvando..." : "Salvar Contrato"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
