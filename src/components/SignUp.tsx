
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";

interface SignUpProps {
  onBackToLogin: () => void;
}

export function SignUp({ onBackToLogin }: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies();
  
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedCompanyId: "",
    accessCode: ""
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    if (!signUpData.fullName.trim() || !signUpData.selectedCompanyId || !signUpData.accessCode.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      // Find selected company
      const selectedCompany = companies.find(company => company.id === signUpData.selectedCompanyId);
      
      if (!selectedCompany) {
        setError('Empresa selecionada não encontrada.');
        return;
      }

      // Verify access code
      if (selectedCompany.access_code !== signUpData.accessCode.trim()) {
        setError('Código de acesso incorreto para a empresa selecionada.');
        return;
      }

      console.log('Creating user with company:', selectedCompany.name);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signUpData.fullName,
            company_name: selectedCompany.name
          }
        }
      });

      if (authError) {
        console.error('Erro na criação do usuário:', authError);
        if (authError.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else if (authError.message.includes('Email domain not allowed')) {
          setError('Este domínio de email não é permitido.');
        } else {
          setError('Erro ao criar conta. Verifique os dados e tente novamente.');
        }
        return;
      }

      if (!authData.user) {
        setError('Erro inesperado ao criar usuário.');
        return;
      }

      console.log('User created, creating profile...');

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          company_id: selectedCompany.id,
          full_name: signUpData.fullName.trim(),
          email: signUpData.email
        }]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Try to update existing profile if insert failed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            company_id: selectedCompany.id,
            full_name: signUpData.fullName.trim()
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          setError('Erro ao configurar perfil do usuário.');
          return;
        }
      }

      console.log('Profile created, creating role...');

      // Assign financeiro role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          company_id: selectedCompany.id,
          role: 'financeiro'
        }]);

      if (roleError && roleError.code !== '23505') { // Ignore duplicate error
        console.error('Erro ao criar role:', roleError);
        setError('Erro ao configurar permissões do usuário.');
        return;
      }

      console.log('Signup completed successfully');

      toast({
        title: "Conta criada com sucesso!",
        description: `Sua conta foi criada para a empresa ${selectedCompany.name}. Você pode fazer login agora.`,
      });

      // Return to login screen
      onBackToLogin();

    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected company for access code hint
  const selectedCompany = companies.find(company => company.id === signUpData.selectedCompanyId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-gray-700 bg-[#0f0f0f]">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              className="text-yellow-500 hover:text-yellow-400"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/52673621-85bc-477d-80da-681dbd853793.png" 
                alt="ZOLKA Logo" 
                className="h-8 w-auto" 
              />
              <CardTitle className="text-xl font-bold text-yellow-500">ERP</CardTitle>
            </div>
          </div>
          <CardDescription className="text-gray-300">
            Criar nova conta no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {companiesError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{companiesError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-yellow-500">Nome Completo *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={signUpData.fullName}
                onChange={(e) => setSignUpData(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))}
                required
                disabled={isLoading}
                className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-yellow-500">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={signUpData.email}
                onChange={(e) => setSignUpData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
                disabled={isLoading}
                className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-yellow-500">Empresa *</Label>
              <Select
                value={signUpData.selectedCompanyId}
                onValueChange={(value) => setSignUpData(prev => ({
                  ...prev,
                  selectedCompanyId: value,
                  accessCode: "" // Reset access code when company changes
                }))}
                disabled={isLoading || companiesLoading}
              >
                <SelectTrigger className="border-gray-600 text-gray-900 bg-white">
                  <SelectValue placeholder={companiesLoading ? "Carregando empresas..." : "Selecione sua empresa"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-600 z-50">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id} className="text-gray-900 hover:bg-gray-100">
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {companies.length > 0 && (
                <p className="text-xs text-gray-400">
                  Selecione a empresa para a qual você foi convidado
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-yellow-500">Código de Acesso da Empresa *</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder={selectedCompany ? `Digite o código para ${selectedCompany.name}` : "Selecione uma empresa primeiro"}
                value={signUpData.accessCode}
                onChange={(e) => setSignUpData(prev => ({
                  ...prev,
                  accessCode: e.target.value
                }))}
                required
                disabled={isLoading || !signUpData.selectedCompanyId}
                className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
              />
              <p className="text-xs text-gray-400">
                Digite o código de acesso fornecido pela empresa selecionada
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-yellow-500">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={signUpData.password}
                onChange={(e) => setSignUpData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                required
                disabled={isLoading}
                className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-yellow-500">Confirmar Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={signUpData.confirmPassword}
                onChange={(e) => setSignUpData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                required
                disabled={isLoading}
                className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              disabled={isLoading || companiesLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Já tem uma conta?{" "}
              <button
                onClick={onBackToLogin}
                className="text-yellow-500 hover:text-yellow-400 underline"
              >
                Fazer login
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Se sua empresa não está listada ou você não possui o código de acesso, entre em contato com o administrador do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
