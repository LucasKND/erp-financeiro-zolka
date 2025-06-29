
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
  const [companyName, setCompanyName] = useState("2GO Marketing");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      console.log('Setting up company for user:', user.id);
      
      // Verificar se já existe uma empresa com esse nome
      let { data: existingCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('name', companyName)
        .maybeSingle();

      let companyId;
      
      if (existingCompany) {
        companyId = existingCompany.id;
        console.log('Using existing company:', existingCompany);
      } else {
        // Criar nova empresa
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert([{ name: companyName }])
          .select()
          .single();

        if (companyError) {
          console.error('Error creating company:', companyError);
          throw companyError;
        }
        
        companyId = newCompany.id;
        console.log('Company created:', newCompany);
      }

      // Verificar se perfil já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Atualizar perfil existente
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ company_id: companyId })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
        console.log('Profile updated with company_id');
      } else {
        // Criar novo perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            company_id: companyId,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email || ''
          }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }
        console.log('Profile created');
      }

      // Criar role financeiro
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: user.id,
          company_id: companyId,
          role: 'financeiro'
        }]);

      if (roleError && roleError.code !== '23505') { // Ignorar erro de duplicata
        console.error('Error creating role:', roleError);
        throw roleError;
      }
      console.log('Role created or already exists');

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
