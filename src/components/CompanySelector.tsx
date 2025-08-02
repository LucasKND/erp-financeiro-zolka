import { useState, useEffect } from 'react';
import { ChevronDown, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useClientManagement, ClientCompany } from '@/hooks/useClientManagement';
import { useProfile } from '@/hooks/useProfile';

interface CompanySelectorProps {
  selectedCompanyId: string | null;
  onCompanyChange: (companyId: string) => void;
}

export function CompanySelector({ selectedCompanyId, onCompanyChange }: CompanySelectorProps) {
  const { clientCompanies, loading, isAdminBPO } = useClientManagement();
  const { company: userCompany } = useProfile();
  const [selectedCompany, setSelectedCompany] = useState<ClientCompany | null>(null);

  useEffect(() => {
    if (selectedCompanyId && clientCompanies.length > 0) {
      const company = clientCompanies.find(c => c.id === selectedCompanyId);
      setSelectedCompany(company || null);
    }
  }, [selectedCompanyId, clientCompanies]);

  const handleCompanySelect = (company: ClientCompany) => {
    setSelectedCompany(company);
    onCompanyChange(company.id);
  };

  // Se não for admin BPO, não mostrar o seletor
  if (!isAdminBPO) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Building className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Carregando empresas...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span className="truncate">
              {selectedCompany ? selectedCompany.name : 'Selecionar Empresa'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Empresas Cliente</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {clientCompanies.length === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">Nenhuma empresa cadastrada</span>
          </DropdownMenuItem>
        ) : (
          clientCompanies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleCompanySelect(company)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">{company.name}</span>
                <span className="text-xs text-muted-foreground">
                  {company.access_code}
                </span>
              </div>
              {selectedCompanyId === company.id && (
                <Badge variant="secondary" className="ml-2">
                  Selecionada
                </Badge>
              )}
            </DropdownMenuItem>
          ))
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Total: {clientCompanies.length} empresa(s)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}