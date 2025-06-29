
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

    if (!signUpData.fullName.trim() || !signUpData.companyName.trim() || !signUpData.accessCode.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      // Limpar e normalizar os dados de entrada
      const cleanCompanyName = signUpData.companyName.trim();
      const cleanAccessCode = signUpData.accessCode.trim();

      console.log('=== DEBUG CADASTRO ===');
      console.log('Nome da empresa digitado:', `"${cleanCompanyName}"`);
      console.log('Código de acesso digitado:', `"${cleanAccessCode}"`);
      console.log('Tamanho do nome da empresa:', cleanCompanyName.length);
      console.log('Tamanho do código de acesso:', cleanAccessCode.length);

      // 1. Primeiro, listar todas as empresas disponíveis para debug
      console.log('Listando todas as empresas disponíveis...');
      const { data: allCompanies, error: listError } = await supabase
        .from('companies')
        .select('id, name, access_code');

      if (listError) {
        console.error('Erro ao listar empresas:', listError);
      } else {
        console.log('Empresas encontradas:', allCompanies);
        allCompanies?.forEach((company, index) => {
          console.log(`Empresa ${index + 1}:`);
          console.log(`  Nome: "${company.name}" (tamanho: ${company.name?.length})`);
          console.log(`  Código: "${company.access_code}" (tamanho: ${company.access_code?.length})`);
        });
      }

      // 2. Verificar se a empresa existe e o código de acesso está correto
      console.log('Buscando empresa com critérios específicos...');
      
      // Primeira tentativa: busca case-sensitive exata
      const { data: exactMatch, error: exactError } = await supabase
        .from('companies')
        .select('id, name, access_code')
        .eq('name', cleanCompanyName)
        .eq('access_code', cleanAccessCode)
        .maybeSingle();

      console.log('Resultado busca exata:', exactMatch);
      if (exactError) console.log('Erro busca exata:', exactError);

      // Segunda tentativa: busca case-insensitive
      const { data: caseInsensitiveMatch, error: caseInsensitiveError } = await supabase
        .from('companies')
        .select('id, name, access_code')
        .ilike('name', cleanCompanyName)
        .ilike('access_code', cleanAccessCode)
        .maybeSingle();

      console.log('Resultado busca case-insensitive:', caseInsensitiveMatch);
      if (caseInsensitiveError) console.log('Erro busca case-insensitive:', caseInsensitiveError);

      // Usar o resultado que funcionou
      let company = exactMatch || caseInsensitiveMatch;

      if (!company) {
        console.log('=== EMPRESA NÃO ENCONTRADA ===');
        console.log('Tentando busca apenas por nome...');
        
        const { data: nameOnlyMatch, error: nameOnlyError } = await supabase
          .from('companies')
          .select('id, name, access_code')
          .ilike('name', cleanCompanyName)
          .maybeSingle();

        console.log('Empresa encontrada apenas por nome:', nameOnlyMatch);
        if (nameOnlyError) console.log('Erro busca por nome:', nameOnlyError);

        if (nameOnlyMatch) {
          console.log('PROBLEMA: Empresa existe mas código de acesso está incorreto');
          console.log(`Código esperado: "${nameOnlyMatch.access_code}"`);
          console.log(`Código fornecido: "${cleanAccessCode}"`);
          setError('Código de acesso incorreto. Verifique se digitou "ZOLKA2024" exatamente como mostrado.');
        } else {
          console.log('PROBLEMA: Empresa não existe no banco de dados');
          setError('Empresa não encontrada. Verifique se digitou "2GO Marketing" exatamente como mostrado.');
        }
        return;
      }

      console.log('Empresa encontrada:', company.name, 'ID:', company.id);

      // 3. Criar usuário no Supabase Auth
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

      // 4. Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          company_id: company.id,
          full_name: signUpData.fullName.trim(),
          email: signUpData.email
        }]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Se o perfil já existe (caso o trigger tenha criado), atualizar
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            company_id: company.id,
            full_name: signUpData.fullName.trim()
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          setError('Erro ao configurar perfil do usuário.');
          return;
        }
      }

      // 5. Atribuir role financeiro
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          company_id: company.id,
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
        description: `Sua conta foi criada para a empresa ${company.name}. Você pode fazer login agora.`,
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
