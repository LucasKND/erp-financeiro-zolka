
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { CompanySelection } from "./CompanySelection";

interface SignUpProps {
  onBackToLogin: () => void;
}

export function SignUp({ onBackToLogin }: SignUpProps) {
  const {
    signUpData,
    updateField,
    handleSignUp,
    isLoading,
    error,
    companies,
    companiesLoading,
    companiesError
  } = useSignUpForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignUp(onBackToLogin);
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

          <form onSubmit={onSubmit} className="space-y-4">
            <PersonalInfoForm
              fullName={signUpData.fullName}
              email={signUpData.email}
              password={signUpData.password}
              confirmPassword={signUpData.confirmPassword}
              onFullNameChange={(value) => updateField('fullName', value)}
              onEmailChange={(value) => updateField('email', value)}
              onPasswordChange={(value) => updateField('password', value)}
              onConfirmPasswordChange={(value) => updateField('confirmPassword', value)}
              disabled={isLoading}
            />

            <CompanySelection
              companies={companies}
              companiesLoading={companiesLoading}
              companiesError={companiesError}
              selectedCompanyId={signUpData.selectedCompanyId}
              accessCode={signUpData.accessCode}
              onCompanyChange={(value) => updateField('selectedCompanyId', value)}
              onAccessCodeChange={(value) => updateField('accessCode', value)}
              disabled={isLoading}
            />

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
