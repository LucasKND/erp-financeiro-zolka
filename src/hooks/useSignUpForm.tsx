
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  selectedCompanyId: string;
  accessCode: string;
}

export function useSignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies();
  
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedCompanyId: "",
    accessCode: ""
  });

  const updateField = (field: keyof SignUpFormData, value: string) => {
    setSignUpData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (signUpData.password !== signUpData.confirmPassword) {
      return 'As senhas não coincidem.';
    }

    if (signUpData.password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (!signUpData.fullName.trim() || !signUpData.selectedCompanyId || !signUpData.accessCode.trim()) {
      return 'Por favor, preencha todos os campos obrigatórios.';
    }

    return null;
  };

  const handleSignUp = async (onSuccess: () => void) => {
    setIsLoading(true);
    setError(null);

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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
      console.log('Access code verified:', signUpData.accessCode);

      // Create user in Supabase Auth
      // O trigger automático criará perfil e role quando o usuário for inserido
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

      console.log('User created successfully, user ID:', authData.user.id);
      console.log('Trigger automático criará perfil e role automaticamente');

      // Aguardar um pouco para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Signup completed successfully');

      toast({
        title: "Conta criada com sucesso!",
        description: `Sua conta foi criada para a empresa ${selectedCompany.name}. ${
          authData.user.email_confirmed_at ? 'Você pode fazer login agora.' : 'Verifique seu email para confirmar a conta antes de fazer login.'
        }`,
      });

      onSuccess();

    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUpData,
    updateField,
    handleSignUp,
    isLoading,
    error,
    companies,
    companiesLoading,
    companiesError
  };
}
