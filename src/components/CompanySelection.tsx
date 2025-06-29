
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Tables } from "@/integrations/supabase/types";

type Company = Tables<'companies'>;

interface CompanySelectionProps {
  companies: Company[];
  companiesLoading: boolean;
  companiesError: string | null;
  selectedCompanyId: string;
  accessCode: string;
  onCompanyChange: (companyId: string) => void;
  onAccessCodeChange: (accessCode: string) => void;
  disabled: boolean;
}

export function CompanySelection({
  companies,
  companiesLoading,
  companiesError,
  selectedCompanyId,
  accessCode,
  onCompanyChange,
  onAccessCodeChange,
  disabled
}: CompanySelectionProps) {
  const selectedCompany = companies.find(company => company.id === selectedCompanyId);

  return (
    <>
      {companiesError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{companiesError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="company" className="text-yellow-500">Empresa *</Label>
        <Select
          value={selectedCompanyId}
          onValueChange={(value) => {
            onCompanyChange(value);
            onAccessCodeChange(""); // Reset access code when company changes
          }}
          disabled={disabled || companiesLoading}
        >
          <SelectTrigger className="border-gray-600 text-gray-900 bg-white">
            <SelectValue placeholder={companiesLoading ? "Carregando empresas..." : "Selecione sua empresa"} />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-600 z-50">
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id} className="text-gray-900 hover:bg-gray-100">
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {companies.length > 0 && (
          <p className="text-xs text-gray-400">
            Selecione a empresa para a qual você foi convidado
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessCode" className="text-yellow-500">Código de Acesso da Empresa *</Label>
        <Input
          id="accessCode"
          type="text"
          placeholder={selectedCompany ? `Digite o código para ${selectedCompany.name}` : "Selecione uma empresa primeiro"}
          value={accessCode}
          onChange={(e) => onAccessCodeChange(e.target.value)}
          required
          disabled={disabled || !selectedCompanyId}
          className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
        />
        <p className="text-xs text-gray-400">
          Digite o código de acesso fornecido pela empresa selecionada
        </p>
      </div>
    </>
  );
}
