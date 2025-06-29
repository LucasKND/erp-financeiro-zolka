
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileDropdown } from "./ProfileDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface TopBarProps {
  setActiveModule: (module: string) => void;
}

export function TopBar({ setActiveModule }: TopBarProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

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

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Greeting Section */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Olá, {getFirstName()}
        </h1>
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
    </header>
  );
}
