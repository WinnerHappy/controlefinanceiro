'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const checkUser = async () => {
      const { user } = await auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  return <Dashboard user={user} />;
}