
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const { data, error } = await supabase.auth.signInWithPassword({
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md bg-black border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Building2 className="w-8 h-8 text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-500">ZOLKA ERP</CardTitle>
          <CardDescription className="text-gray-300">
            Gestão financeira empresarial completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
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
                onChange={(e) =>
                  setLoginData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                disabled={isLoading}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-yellow-500">Senha</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Sua senha"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                disabled={isLoading}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" disabled={isLoading}>
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
        </CardContent>
      </Card>
    </div>
  );
}
