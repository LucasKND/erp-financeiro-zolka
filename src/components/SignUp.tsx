
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
    companyName: ""
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validações básicas
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

    if (!signUpData.fullName.trim() || !signUpData.companyName.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Iniciando cadastro para:', signUpData.email);

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signUpData.fullName,
            company_name: signUpData.companyName
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

      console.log('Usuário criado:', authData.user.id);

      // 2. Criar ou buscar empresa
      let companyId;
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', signUpData.companyName.trim())
        .maybeSingle();

      if (existingCompany) {
        companyId = existingCompany.id;
        console.log('Empresa existente encontrada:', companyId);
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert([{ name: signUpData.companyName.trim() }])
          .select()
          .single();

        if (companyError) {
          console.error('Erro ao criar empresa:', companyError);
          setError('Erro ao registrar empresa. Tente novamente.');
          return;
        }

        companyId = newCompany.id;
        console.log('Nova empresa criada:', companyId);
      }

      // 3. Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          company_id: companyId,
          full_name: signUpData.fullName.trim(),
          email: signUpData.email
        }]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Se o perfil já existe (caso o trigger tenha criado), atualizar
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            company_id: companyId,
            full_name: signUpData.fullName.trim()
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          setError('Erro ao configurar perfil do usuário.');
          return;
        }
      }

      // 4. Atribuir role financeiro
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          company_id: companyId,
          role: 'financeiro'
        }]);

      if (roleError && roleError.code !== '23505') { // Ignora erro de duplicata
        console.error('Erro ao criar role:', roleError);
        setError('Erro ao configurar permissões do usuário.');
        return;
      }

      console.log('Cadastro concluído com sucesso');

      toast({
        title: "Conta criada com sucesso!",
        description: "Sua conta foi criada. Você pode fazer login agora.",
      });

      // Voltar para tela de login
      onBackToLogin();

    } catch (err) {
      console.error('Erro inesperado no cadastro:', err);
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
              <CardTitle className="text-xl font-bold text-yellow-500">ZOLKA ERP</CardTitle>
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
                className="border-gray-600 text-white placeholder-gray-400 bg-slate-50"
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
                className="border-gray-600 text-white placeholder-gray-400 bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-yellow-500">Nome da Empresa *</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Nome da sua empresa"
                value={signUpData.companyName}
                onChange={(e) => setSignUpData(prev => ({
                  ...prev,
                  companyName: e.target.value
                }))}
                required
                disabled={isLoading}
                className="border-gray-600 text-white placeholder-gray-400 bg-slate-50"
              />
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
                className="border-gray-600 text-white placeholder-gray-400 bg-slate-50"
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
                className="border-gray-600 text-white placeholder-gray-400 bg-slate-50"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
