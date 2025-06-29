
import { User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePermissions } from "@/hooks/usePermissions";

interface ProfileDropdownProps {
  setActiveModule: (module: string) => void;
}

export function ProfileDropdown({ setActiveModule }: ProfileDropdownProps) {
  const { user, signOut } = useAuth();
  const { profile, company } = useProfile();
  const { userRole } = usePermissions();

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

  const getDisplayName = () => {
    // Try to get from user metadata first
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    // Then try profile
    if (profile?.full_name) {
      return profile.full_name;
    }
    // Finally fallback to email
    return user?.email || "Usuário";
  };

  const getRoleLabel = () => {
    if (userRole?.role === 'financeiro') return 'Financeiro';
    if (userRole?.role === 'proprietario') return 'Proprietário';
    return 'Usuário';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {getFirstName()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {getRoleLabel()}
            </div>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback className="bg-yellow-500 text-white text-sm">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center space-x-2 p-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback className="bg-yellow-500 text-white text-sm">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-xs leading-none text-blue-600 font-medium">
              {getRoleLabel()} • {company?.name || '2GO Marketing'}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setActiveModule("configuracoes")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
