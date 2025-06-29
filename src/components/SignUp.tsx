
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignUpProps {
  onBackToLogin: () => void;
}

export function SignUp({ onBackToLogin }: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
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

    if (!signUpData.fullName.trim() || !signUpData.companyName.trim() || !signUpData.accessCode.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      // Clean and normalize input data
      const cleanCompanyName = signUpData.companyName.trim();
      const cleanAccessCode = signUpData.accessCode.trim();

      // Verify company exists and access code is correct
      let { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name, access_code')
        .eq('name', cleanCompanyName)
        .eq('access_code', cleanAccessCode)
        .maybeSingle();

      if (companyError) {
        setError('Erro interno. Tente novamente mais tarde.');
        return;
      }

      if (!company) {
        // Try case-insensitive search as fallback
        const { data: fallbackCompany, error: fallbackError } = await supabase
          .from('companies')
          .select('id, name, access_code')
          .ilike('name', cleanCompanyName)
          .ilike('access_code', cleanAccessCode)
          .maybeSingle();

        if (fallbackError) {
          setError('Erro interno. Tente novamente mais tarde.');
          return;
        }

        if (!fallbackCompany) {
          // Check if company exists with wrong access code
          const { data: nameOnlyMatch } = await supabase
            .from('companies')
            .select('id')
            .ilike('name', cleanCompanyName)
            .maybeSingle();

          if (nameOnlyMatch) {
            setError('Código de acesso incorreto. Verifique se digitou "ZOLKA2024" exatamente como mostrado.');
          } else {
            setError('Empresa não encontrada. Verifique se digitou "2GO Marketing" exatamente como mostrado.');
          }
          return;
        }
        
        // Use fallback company if found
        company = fallbackCompany;
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signUpData.fullName,
            company_name: company.name
          }
        }
      });

      if (authError) {
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

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          company_id: company.id,
          full_name: signUpData.fullName.trim(),
          email: signUpData.email
        }]);

      if (profileError) {
        // Try to update existing profile if insert failed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            company_id: company.id,
            full_name: signUpData.fullName.trim()
          })
          .eq('id', authData.user.id);

        if (updateError) {
          setError('Erro ao configurar perfil do usuário.');
          return;
        }
      }

      // Assign financeiro role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          company_id: company.id,
          role: 'financeiro'
        }]);

      if (roleError && roleError.code !== '23505') { // Ignore duplicate error
        setError('Erro ao configurar permissões do usuário.');
        return;
      }

      toast({
        title: "Conta criada com sucesso!",
        description: `Sua conta foi criada para a empresa ${company.name}. Você pode fazer login agora.`,
      });

      // Return to login screen
      onBackToLogin();

    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Label htmlFor="companyName" className="text-yellow-500">Nome da Empresa *</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Digite: 2GO Marketing"
                value={signUpData.companyName}
                onChange={(e) => setSignUpData(prev => ({
                  ...prev,
                  companyName: e.target.value
                }))}
                required
                disabled={isLoading}
                className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
              />
              <p className="text-xs text-gray-400">
                Digite exatamente: <strong>2GO Marketing</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-yellow-500">Código de Acesso da Empresa *</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Digite: ZOLKA2024"
                value={signUpData.accessCode}
                onChange={(e) => setSignUpData(prev => ({
                  ...prev,
                  accessCode: e.target.value
                }))}
                required
                disabled={isLoading}
                className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
              />
              <p className="text-xs text-gray-400">
                Digite exatamente: <strong>ZOLKA2024</strong>
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
              disabled={isLoading}
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
              Se sua empresa não está cadastrada ou você não possui o código de acesso, entre em contato com o administrador do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
