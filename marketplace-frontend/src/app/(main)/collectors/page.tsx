'use client';

import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { CollectorCard } from '@/components/collectors/CollectorCard';
import { User } from '@/types/user.types';
import { Spinner } from '@/components/ui/Spinner';

export default function CollectorsPage() {
  const [collectors, setCollectors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    usersService.getCollectors()
      .then(setCollectors)
      .finally(() => setLoading(false));
  }, []);

  const filtered = collectors.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Collectors</h1>

      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search collectors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">👤</p>
          <p className="font-medium">No collectors found</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} collector{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((u) => <CollectorCard key={u._id} user={u} />)}
          </div>
        </>
      )}
    </div>
  );
}
