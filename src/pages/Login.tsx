import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Castle, Mail, Lock, User, ArrowRight, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import { isDemoMode, demoUsers } from '@/services/demoData';
import type { UserRole } from '@/types';

type Mode = 'login' | 'register';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'surveyor', label: 'Site Surveyor' },
  { value: 'conservation_officer', label: 'Conservation Officer' },
  { value: 'budget_holder', label: 'Budget Holder' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'admin', label: 'Administrator' },
];

const roleLabels: Record<string, string> = {
  surveyor: 'Surveyor',
  conservation_officer: 'Conservation',
  budget_holder: 'Budget',
  contractor: 'Contractor',
  admin: 'Admin',
};

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('surveyor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        await register(email, password, name, role);
        setMode('login');
        setError('Account created! Please check your email to confirm, then log in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setError(null);
    setLoading(true);

    try {
      await login(demoEmail, 'demo');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inDemoMode = isDemoMode();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-700">
          <Castle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Castle Door Conservation</h1>
        <p className="text-gray-600">Heritage maintenance management</p>
      </div>

      {inDemoMode && (
        <div className="mb-4 w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Demo Mode</strong> - Supabase not configured. Click a demo user below to log in.
        </div>
      )}

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Sign in to manage conservation projects'
              : 'Register to get started with conservation management'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Demo Users Quick Login */}
          {inDemoMode && mode === 'login' && (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Demo Users (click to log in)
              </div>
              <div className="grid gap-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDemoLogin(user.email)}
                    disabled={loading}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:border-green-500 hover:bg-green-50 disabled:opacity-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      {roleLabels[user.role]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">or enter email</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  error.includes('created')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder={inDemoMode ? 'Password (any value works)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required={!inDemoMode}
                minLength={inDemoMode ? 1 : 6}
              />
            </div>

            {mode === 'register' && !inDemoMode && (
              <Select
                label="Your Role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                options={roleOptions}
              />
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {!inDemoMode && (
            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="font-medium text-green-700 hover:underline"
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium text-green-700 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-gray-500">
        Preserving Ireland's medieval heritage, one door at a time.
      </p>
    </div>
  );
}
