"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";

const Navigation: React.FC = () => {
  const user = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-bold text-purple-600 cursor-pointer"
              onClick={() => router.push('/')}
            >
              Rizz or Risk AI
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/features/delulu-analyzer')}
                >
                  Delulu Analyzer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/features/card-swipe')}
                >
                  Card Swipe
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/auth/login')}
                >
                  Login
                </Button>
                <Button 
                  onClick={() => router.push('/auth/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;