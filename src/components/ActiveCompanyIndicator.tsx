import { Building2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useActiveCompany } from "@/hooks/useActiveCompany";

export function ActiveCompanyIndicator() {
  const { activeCompany, isManagingOtherCompany } = useActiveCompany();

  if (!activeCompany) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isManagingOtherCompany ? (
        <Users className="h-4 w-4 text-blue-600" />
      ) : (
        <Building2 className="h-4 w-4 text-green-600" />
      )}
      <span className="text-muted-foreground">
        {isManagingOtherCompany ? "Gerenciando:" : "Empresa:"}
      </span>
      <Badge variant={isManagingOtherCompany ? "secondary" : "default"}>
        {activeCompany.name}
      </Badge>
    </div>
  );
}