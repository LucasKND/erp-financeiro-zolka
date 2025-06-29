
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CompanySetupProps {
  onSetupComplete: () => void;
}

export function CompanySetup({ onSetupComplete }: CompanySetupProps) {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      console.log('Setting up company for user:', user.id);
      
      // First, ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Existing profile:', existingProfile);

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{ name: companyName }])
        .select()
        .single();

      if (companyError) throw companyError;
      console.log('Company created:', company);

      // Create or update user profile with company_id
      if (existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ company_id: company.id })
          .eq('id', user.id);

        if (profileError) throw profileError;
        console.log('Profile updated with company_id');
      } else {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            company_id: company.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email
          }]);

        if (profileError) throw profileError;
        console.log('Profile created with company_id');
      }

      // Create admin role for the user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: user.id,
          company_id: company.id,
          role: 'admin'
        }]);

      if (roleError) throw roleError;
      console.log('Admin role created');

      toast({
        title: "Empresa configurada!",
        description: "Sua empresa foi criada com sucesso.",
      });

      onSetupComplete();
    } catch (error) {
      console.error('Error setting up company:', error);
      toast({
        title: "Erro na configuração",
        description: "Não foi possível configurar sua empresa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <CardTitle className="text-2xl">Configurar Empresa</CardTitle>
          <CardDescription>
            Configure sua empresa para começar a usar o Zolka ERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Digite o nome da sua empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !companyName.trim()}>
              {loading ? "Configurando..." : "Configurar Empresa"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
