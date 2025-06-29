import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileDropdown } from "./ProfileDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePermissions } from "@/hooks/usePermissions";
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
    if (userRole?.role === 'financeiro') return 'Financeiro';
    if (userRole?.role === 'proprietario') return 'Proprietário';
    return 'Usuário';
  };
  return <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Left Section - Company Name */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {company?.name || '2GO Marketing'}
            </h1>
          </div>
        </div>
        
        <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Olá, {getFirstName()}
          </span>
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