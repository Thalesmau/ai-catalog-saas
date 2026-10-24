import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { handleFormError } from '@/lib/formErrors';

import { useAuth } from '../authContext';
import { AuthLayout } from '../components/AuthLayout';
import { type SignInValues, signInSchema } from '../schemas';

const DEMO_ACCOUNTS = [
  { label: 'Admin TechNova', email: 'admin@technova.com' },
  { label: 'User TechNova', email: 'user@technova.com' },
  { label: 'Admin Verde Vida', email: 'admin@verdevida.com' },
  { label: 'User Verde Vida', email: 'user@verdevida.com' },
];
const DEMO_PASSWORD = 'Senha@123';
const SHOW_DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      handleFormError(error, setError, ['email', 'password']);
    }
  });

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', DEMO_PASSWORD, { shouldValidate: true });
  };

  return (
    <AuthLayout title="Entrar" description="Acesse o catálogo da sua empresa.">
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          label="Senha"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="animate-spin" />}
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{' '}
        <Link to="/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
          Cadastre-se
        </Link>
      </p>

      {SHOW_DEMO && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <p className="text-sm font-medium">Contas de demonstração</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(account => (
              <Button key={account.email} type="button" variant="outline" size="sm" onClick={() => fillDemo(account.email)}>
                {account.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Preenche o formulário com os dados do seed.</p>
        </div>
      )}
    </AuthLayout>
  );
}
