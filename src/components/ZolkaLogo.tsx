import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

interface ZolkaLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function ZolkaLogo({ className = "", width = 120, height = 40 }: ZolkaLogoProps) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(systemDark);
      } else {
        setIsDark(theme === 'dark');
      }
    };

    checkTheme();

    // Listen for system theme changes when theme is 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => checkTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  
  const logoSrc = isDark 
    ? "/lovable-uploads/ZolkaLogoWhite.png" 
    : "/lovable-uploads/ZolkaLogoBlack.png";

  return (
    <img 
      src={logoSrc}
      alt="Zolka ERP Logo"
      width={width}
      height={height}
      className={`object-contain ${className}`}
    />
  );
}
