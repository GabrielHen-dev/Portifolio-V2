// Login em dois passos: senha e código 2FA.

import { KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLogin, useVerifyTwoFactor } from './api/admin.api';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { ApiError } from '@/shared/lib/api-client';
import { Button } from '@/shared/ui/button';
import { InputField } from '@/shared/ui/field';

type Step = 'credentials' | 'second-factor';

export function LoginPage() {
  const { t } = useI18n();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const login = useLogin();
  const verify = useVerifyTwoFactor();

  const describeError = (err: unknown): string => {
    if (err instanceof ApiError) {
      if (err.status === 423) return t.admin.login.locked;
      if (err.status === 429) return t.admin.login.rateLimited;
    }
    return t.admin.login.invalid;
  };

  const submitCredentials = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);

    try {
      await login.mutateAsync({ email, password });
      setStep('second-factor');

      setPassword('');
    } catch (err) {
      setError(describeError(err));
    }
  };

  const submitCode = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);

    try {
      await verify.mutateAsync({ code });
    } catch (err) {
      setError(describeError(err));
      setCode('');

      if (err instanceof ApiError && err.status === 401) {
        setStep('credentials');
      }
    }
  };

  const pending = login.isPending || verify.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid px-5">
      <div className="w-full max-w-sm">
        <div className="border border-rule bg-surface p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              {step === 'credentials' ? (
                <Lock className="size-3.5 text-accent" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
              )}
              <span className="eyebrow">{step === 'credentials' ? '01' : '02'}</span>
              <span aria-hidden="true" className="h-px flex-1 bg-rule" />
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t.admin.login.heading}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {step === 'credentials' ? t.admin.login.subheading : t.admin.login.codeHint}
            </p>
          </div>

          {step === 'credentials' ? (
            <form onSubmit={(e) => void submitCredentials(e)} className="grid gap-4">
              <InputField
                label={t.admin.login.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
              <InputField
                label={t.admin.login.password}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              {error && (
                <p role="alert" className="border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={pending} className="mt-1 w-full">
                {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t.admin.login.submit}
              </Button>
            </form>
          ) : (
            <form onSubmit={(e) => void submitCode(e)} className="grid gap-4">
              <InputField
                label={t.admin.login.code}
                value={code}
                onChange={(e) => setCode(e.target.value)}

                autoComplete="one-time-code"
                inputMode="text"
                required
                autoFocus
                className="text-center font-mono text-lg tracking-[0.3em]"
                placeholder="000000"
              />

              {error && (
                <p role="alert" className="border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <KeyRound className="size-4" aria-hidden="true" />
                )}
                {t.admin.login.verify}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setCode('');
                  setError(null);
                }}
                className="link-underline text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {t.admin.login.back}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
