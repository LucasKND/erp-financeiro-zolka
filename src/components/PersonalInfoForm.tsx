
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PersonalInfoFormProps {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  disabled: boolean;
}

export function PersonalInfoForm({
  fullName,
  email,
  password,
  confirmPassword,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  disabled
}: PersonalInfoFormProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-yellow-500">Nome Completo *</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          required
          disabled={disabled}
          className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-yellow-500">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={disabled}
          className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-yellow-500">Senha *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          disabled={disabled}
          className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-yellow-500">Confirmar Senha *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          required
          disabled={disabled}
          className="border-gray-600 text-gray-900 placeholder-gray-400 bg-white"
        />
      </div>
    </>
  );
}
