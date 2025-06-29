import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login.');
        } else {
          setError('Erro ao fazer login. Verifique suas credenciais.');
        }
        return;
      }
      if (data.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Sistema ERP."
        });
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-gray-700 bg-[#0f0f0f]">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/lovable-uploads/52673621-85bc-477d-80da-681dbd853793.png" alt="ZOLKA Logo" className="h-12 w-auto" />
            <CardTitle className="text-2xl font-bold text-yellow-500">ZOLKA ERP</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Gestão financeira empresarial completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4 px-0 py-0 my-0 mx-0">
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-yellow-500">Email</Label>
              <Input id="login-email" type="email" placeholder="seu@email.com" value={loginData.email} onChange={e => setLoginData(prev => ({
              ...prev,
              email: e.target.value
            }))} required disabled={isLoading} className="border-gray-600 text-white placeholder-gray-400 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-yellow-500">Senha</Label>
              <Input id="login-password" type="password" placeholder="Sua senha" value={loginData.password} onChange={e => setLoginData(prev => ({
              ...prev,
              password: e.target.value
            }))} required disabled={isLoading} className="border-gray-600 text-white placeholder-gray-400 bg-slate-50" />
            </div>
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" disabled={isLoading}>
              {isLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </> : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
}