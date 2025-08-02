import { Bell, User, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileDropdown } from "./ProfileDropdown";
import { CompanySelector } from "./CompanySelector";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { useClientManagement } from "@/hooks/useClientManagement";
import { useState } from "react";
interface TopBarProps {
  setActiveModule: (module: string) => void;
}
export function TopBar({
  setActiveModule
}: TopBarProps) {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile,
    company
  } = useProfile();
  const {
    userRole
  } = usePermissions();

  const { isAdminBPO } = useClientManagement();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Extract first name from various sources
  const getFirstName = () => {
    // Try to get from user metadata first
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    // Then try profile
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    // Finally fallback to email prefix
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Usuário";
  };
  const getRoleLabel = () => {
    if (userRole?.role === 'admin_bpo') return 'Admin';
    if (userRole?.role === 'financeiro') return 'Financeiro';
    if (userRole?.role === 'proprietario') return 'Proprietário';
    return 'Usuário';
  };

  const handleEditName = () => {
    setEditedName(getFirstName());
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    // TODO: Implement name update logic here
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };
  const getCompanyDisplayName = () => {
    if (isAdminBPO) {
      // Se for admin BPO, mostrar "APV Financeiro" ou empresa selecionada
      return selectedCompanyId ? 'Empresa Cliente Selecionada' : 'APV Financeiro';
    }
    // Se for usuário normal, mostrar nome da empresa dele
    return company?.name || 'Empresa';
  };

  return <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border shadow-sm">
      {/* Left Section - Company Name */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {getCompanyDisplayName()}
            </h1>
          </div>
        </div>
        
        {/* Company Selector for Admin BPO */}
        {isAdminBPO && (
          <>
            <div className="hidden md:block h-6 w-px bg-border"></div>
            <CompanySelector 
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
          </>
        )}
        
        <div className="hidden md:block h-6 w-px bg-border"></div>
        
        <div className="hidden md:flex items-center space-x-2">
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-7 w-24 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleSaveName}>
                ✓
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleCancelEdit}>
                ✕
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">
                Olá, {getFirstName()}
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                onClick={handleEditName}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Badge variant="secondary" className="text-xs">
            {getRoleLabel()}
          </Badge>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationDropdown setActiveModule={setActiveModule} />

        {/* Profile Dropdown */}
        <ProfileDropdown setActiveModule={setActiveModule} />
      </div>
    </header>;
}