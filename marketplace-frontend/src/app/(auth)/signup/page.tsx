'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token, user } = await authService.signup(form);
      setAuth(user, access_token);
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand */}
      <div className="hidden lg:flex lg:w-5/12 bg-gray-900 flex-col justify-between p-12">
        <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-primary-400">◆</span> Collectibles
        </Link>
        <div>
          <p className="text-3xl font-bold text-white leading-snug mb-4">
            Start your collection<br />today — it&apos;s free.
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            {['List any collectible in seconds', 'Trade with verified collectors', 'Real-time chat with buyers'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="text-primary-400">✓</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Collectibles Marketplace</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#fafaf8]">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden text-lg font-bold text-gray-900 flex items-center gap-2 mb-8">
            <span className="text-primary-500">◆</span> Collectibles
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-7">Join collectors worldwide — no fees, ever.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="your_handle"
              required
            />
            <Input
              label="Display name"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Your name"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="min. 8 characters"
              required
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
