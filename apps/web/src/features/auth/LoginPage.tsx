import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = (data: FormData) => login(data);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cyber-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-cyber-primary" />
          <h1 className="mt-4 text-3xl font-bold text-cyber-text">{t('app.title')}</h1>
          <p className="mt-2 text-cyber-muted">{t('app.tagline')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-cyber-border bg-cyber-card p-6">
          <h2 className="text-xl font-semibold">{t('auth.login')}</h2>

          {error && <div className="rounded-lg bg-cyber-danger/10 p-3 text-sm text-cyber-danger">{error}</div>}

          <Input id="email" label={t('auth.email')} type="email" {...register('email')} error={errors.email?.message} autoComplete="email" />
          <Input id="password" label={t('auth.password')} type="password" {...register('password')} error={errors.password?.message} autoComplete="current-password" />

          <Button type="submit" className="w-full" loading={loading}>{t('auth.login')}</Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cyber-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-cyber-card px-2 text-cyber-muted">{t('auth.orContinueWith')}</span></div>
          </div>

          <Button variant="secondary" className="w-full" type="button" onClick={() => { window.location.href = '/api/auth/google'; }}>
            {t('auth.google')}
          </Button>

          <Button variant="secondary" className="w-full" type="button" onClick={() => login({ email: 'tester@test.com', password: 'Test1234!' })}>
            Continue as Tester
          </Button>

          <p className="text-center text-sm text-cyber-muted">
            {t('auth.noAccount')} <Link to="/register" className="text-cyber-primary hover:underline">{t('auth.register')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
