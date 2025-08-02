import { useSelectedCompany } from "@/contexts/SelectedCompanyContext";
import { useProfile } from "@/hooks/useProfile";
import { useClientManagement } from "@/hooks/useClientManagement";

/**
 * Hook que retorna a empresa ativa no contexto atual
 * - Para admin BPO: retorna a empresa selecionada no dropdown, ou a empresa BPO se nenhuma estiver selecionada
 * - Para usuários normais: retorna sempre a empresa do próprio usuário
 */
export const useActiveCompany = () => {
  const { selectedCompanyId } = useSelectedCompany();
  const { company: userCompany } = useProfile();
  const { isAdminBPO, clientCompanies } = useClientManagement();

  // Se for admin BPO
  if (isAdminBPO) {
    if (selectedCompanyId) {
      // Retorna a empresa selecionada
      const selectedCompany = clientCompanies.find(c => c.id === selectedCompanyId);
      return {
        activeCompanyId: selectedCompanyId,
        activeCompany: selectedCompany || null,
        isManagingOtherCompany: selectedCompany?.company_type === 'client'
      };
    }
    // Se nenhuma empresa foi selecionada, usar a empresa BPO (própria empresa do admin)
    return {
      activeCompanyId: userCompany?.id || null,
      activeCompany: userCompany || null,
      isManagingOtherCompany: false
    };
  }

  // Para usuários normais, sempre usar a própria empresa
  return {
    activeCompanyId: userCompany?.id || null,
    activeCompany: userCompany || null,
    isManagingOtherCompany: false
  };
};