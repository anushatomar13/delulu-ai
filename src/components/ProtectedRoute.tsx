"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }} = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      }
    }
    
    checkSession()
  }, [router, supabase])

  return <>{children}</>
}
