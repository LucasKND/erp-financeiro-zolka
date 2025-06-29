
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SignUp } from "./SignUp";

export function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Tentando fazer login com:', loginData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      console.log('Resposta do login:', { data, error });

      if (error) {
        console.error('Erro de login:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          // Verificar se o usuário realmente existe e se o email foi confirmado
          console.log('Erro de email não confirmado, verificando status...');
          
          setError('Seu email ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de confirmação. Se não recebeu o email, você pode solicitar um novo.');
          
          // Oferecer opção de reenviar email de confirmação
          toast({
            title: "Email não confirmado",
            description: "Verifique sua caixa de entrada ou spam. Se necessário, faça um novo cadastro.",
            variant: "destructive"
          });
        } else {
          setError(`Erro ao fazer login: ${error.message}`);
        }
        return;
      }

      if (data.user) {
        console.log('Login bem-sucedido para usuário:', data.user.id);
        console.log('Email confirmado:', data.user.email_confirmed_at);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Sistema ERP."
        });
      }
    } catch (err) {
      console.error('Erro inesperado no login:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!loginData.email) {
      setError('Digite seu email primeiro.');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: loginData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Erro ao reenviar confirmação:', error);
        setError('Erro ao reenviar email de confirmação.');
      } else {
        toast({
          title: "Email reenviado!",
          description: "Verifique sua caixa de entrada para confirmar seu email."
        });
      }
    } catch (err) {
      console.error('Erro ao reenviar confirmação:', err);
      setError('Erro inesperado ao reenviar confirmação.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSignUp) {
    return <SignUp onBackToLogin={() => setShowSignUp(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-gray-700 bg-[#0f0f0f]">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/52673621-85bc-477d-80da-681dbd853793.png" 
              alt="ZOLKA Logo" 
              className="h-12 w-auto" 
            />
            <CardTitle className="text-2xl font-bold text-yellow-500">ERP</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Gestão financeira empresarial completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error}
                {error.includes('não foi confirmado') && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      Reenviar email de confirmação
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-yellow-500">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
                disabled={isLoading}
                className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-yellow-500">Senha</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Sua senha"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({
                  ...prev,
                  password: e.target.value
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
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Não tem uma conta?{" "}
              <button
                onClick={() => setShowSignUp(true)}
                className="text-yellow-500 hover:text-yellow-400 underline"
              >
                Criar conta
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
