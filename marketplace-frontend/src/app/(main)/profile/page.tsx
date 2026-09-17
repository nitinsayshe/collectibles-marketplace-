'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { usersService, UpdateProfilePayload } from '@/services/users.service';
import { productsService } from '@/services/products.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { User } from '@/types/user.types';
import { Product } from '@/types/product.types';

type Tab = 'profile' | 'contact' | 'password';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">{title}</h2>
      {children}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const router = useRouter();
  const { user: storeUser, setAuth, token, isAuthenticated } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [form, setForm] = useState<UpdateProfilePayload>({
    displayName: '',
    bio: '',
    avatarUrl: '',
    isProfilePublic: true,
    city: '',
    whatsapp: '',
    instagram: '',
    phone: '',
  });

  // Password form state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }

    Promise.all([
      usersService.getMyProfile(),
      productsService.getMine(),
    ]).then(([u, p]) => {
      setUser(u);
      setProducts(p);
      setForm({
        displayName: u.displayName || '',
        bio: u.bio || '',
        avatarUrl: u.avatarUrl || '',
        isProfilePublic: u.isProfilePublic ?? true,
        city: u.city || '',
        whatsapp: u.whatsapp || '',
        instagram: u.instagram || '',
        phone: u.phone || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await usersService.updateProfile(form);
      setUser(updated);
      if (token) setAuth(updated, token);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    setPwSaving(true);
    try {
      await usersService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setPwError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const initials = (user?.displayName || user?.username || '?')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const forSale = products.filter((p) => p.status === 'for_sale').length;
  const forTrade = products.filter((p) => p.status === 'for_trade').length;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {form.avatarUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden relative">
                <Image src={form.avatarUrl} alt="avatar" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {user?.displayName || user?.username}
            </h1>
            <p className="text-sm text-gray-400 mb-1">@{user?.username}</p>
            {user?.bio && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{user.bio}</p>}
            <p className="text-xs text-gray-400">Member since {memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-3 gap-4">
          <StatPill label="Items" value={products.length} />
          <StatPill label="For Sale" value={forSale} />
          <StatPill label="For Trade" value={forTrade} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['profile', 'contact', 'password'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'profile' ? 'Edit Profile' : t === 'contact' ? 'Contact Info' : 'Change Password'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Section title="Profile Information">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Display name"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Your full name"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                maxLength={500}
                placeholder="Tell other collectors about yourself..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{(form.bio || '').length}/500</p>
            </div>

            <ImageUpload
              label="Avatar"
              value={form.avatarUrl}
              onChange={(url) => setForm({ ...form, avatarUrl: url })}
            />

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-800">Public profile</p>
                <p className="text-xs text-gray-500 mt-0.5">Other collectors can find and view your profile</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isProfilePublic: !form.isProfilePublic })}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  form.isProfilePublic ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.isProfilePublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
            )}

            <div className="pt-1">
              <Button type="submit" loading={saving}>Save changes</Button>
            </div>
          </form>
        </Section>
      )}

      {tab === 'contact' && (
        <Section title="Contact Information">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <p className="text-xs text-gray-500 -mt-1 mb-2">
              Contact details are only shown to collectors you've connected with.
            </p>

            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Mumbai"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">WhatsApp number</label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                <span className="px-3 flex items-center text-sm text-gray-500 bg-gray-50 border-r border-gray-300 select-none">
                  +
                </span>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="91 98765 43210"
                  className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Instagram handle</label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                <span className="px-3 flex items-center text-sm text-gray-500 bg-gray-50 border-r border-gray-300 select-none">
                  @
                </span>
                <input
                  type="text"
                  value={form.instagram?.replace(/^@/, '')}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value.replace(/^@/, '') })}
                  placeholder="yourusername"
                  className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none"
                />
              </div>
            </div>

            <Input
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
            )}

            <div className="pt-1">
              <Button type="submit" loading={saving}>Save changes</Button>
            </div>
          </form>
        </Section>
      )}

      {tab === 'password' && (
        <Section title="Change Password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              placeholder="••••••••"
              required
            />
            <Input
              label="New password"
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              placeholder="min. 8 characters"
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
            />

            {pwError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{pwSuccess}</p>
            )}

            <div className="pt-1">
              <Button type="submit" loading={pwSaving}>Update password</Button>
            </div>
          </form>
        </Section>
      )}
    </div>
  );
}
