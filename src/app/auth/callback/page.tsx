'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth-failed');
          return;
        }

        if (data.session) {
          // Ensure user record exists in database
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: data.session.user.id,
              email: data.session.user.email,
              responses: JSON.stringify([])
            });

          if (upsertError) {
            console.error('Error creating user record:', upsertError);
          }

          router.push('/');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Signing you in...</p>
      </div>
    </div>
  );
}