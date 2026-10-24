import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { type FieldErrors, type Path, useForm, type UseFormRegister } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { handleFormError } from '@/lib/formErrors';

import { useAuth } from '../authContext';
import { AuthLayout } from '../components/AuthLayout';
import {
  type CreateCompanyValues,
  createCompanySchema,
  type JoinCompanyValues,
  joinCompanySchema,
} from '../schemas';

export function SignUpPage() {
  return (
    <AuthLayout title="Criar conta" description="Crie sua empresa ou entre em uma com o código de convite.">
      <Tabs defaultValue="create">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Criar empresa</TabsTrigger>
          <TabsTrigger value="join">Tenho um convite</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="pt-4">
          <CreateCompanyForm />
        </TabsContent>
        <TabsContent value="join" className="pt-4">
          <JoinCompanyForm />
        </TabsContent>
      </Tabs>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link to="/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}

function CreateCompanyForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CreateCompanyValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { companyName: '', name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (error) {
      handleFormError(error, setError, ['companyName', 'name', 'email', 'password']);
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <FormField
        label="Nome da empresa"
        autoComplete="organization"
        placeholder="Minha Loja"
        hint="Você será o administrador."
        error={errors.companyName?.message}
        {...register('companyName')}
      />
      <AccountFields register={register} errors={errors} />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="animate-spin" />}
        Criar empresa
      </Button>
    </form>
  );
}

function JoinCompanyForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<JoinCompanyValues>({
    resolver: zodResolver(joinCompanySchema),
    defaultValues: { inviteCode: '', name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (error) {
      handleFormError(error, setError, ['inviteCode', 'name', 'email', 'password']);
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <FormField
        label="Código de convite"
        placeholder="TECHNOVA"
        autoComplete="off"
        maxLength={8}
        className="font-mono uppercase tracking-widest"
        hint="Peça ao administrador da sua empresa."
        error={errors.inviteCode?.message}
        {...register('inviteCode')}
      />
      <AccountFields register={register} errors={errors} />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="animate-spin" />}
        Entrar na empresa
      </Button>
    </form>
  );
}

type AccountValues = { name: string; email: string; password: string };

function AccountFields<T extends AccountValues>({ register, errors }: { register: UseFormRegister<T>; errors: FieldErrors<T> }) {
  const field = (name: keyof AccountValues) => ({
    error: errors[name]?.message as string | undefined,
    ...register(name as Path<T>),
  });

  return (
    <>
      <FormField label="Seu nome" autoComplete="name" {...field('name')} />
      <FormField label="Email" type="email" autoComplete="email" placeholder="voce@empresa.com" {...field('email')} />
      <FormField
        label="Senha"
        type="password"
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres."
        {...field('password')}
      />
    </>
  );
}
