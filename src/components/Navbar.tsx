"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiGrid, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: <FiHome />,
      showAlways: true
    },
    {
      name: 'Features',
      href: '/features',
      icon: <FiGrid />,
      showAlways: false,
      requiresAuth: true
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <FiUser />,
      showAlways: false,
      requiresAuth: true
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Filter nav items based on authentication status
  const visibleNavItems = navItems.filter(item => {
    if (item.showAlways) return true;
    if (item.requiresAuth) return !!user;
    return true;
  });

  return (
    <>
      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {/* Add your logo here if needed */}
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {visibleNavItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={`text-lg transition-transform group-hover:scale-110 ${
                    isActive(item.href) ? 'text-purple-400' : ''
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">
                    Hey, <span className="text-purple-400 font-medium">{user.email?.split('@')[0]}</span>! 👋
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-all duration-300 border border-red-600/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiLogOut className={`text-lg ${isLoggingOut ? 'animate-spin' : ''}`} />
                    <span className="font-medium">
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </span>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => router.push('/auth/login')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiLogIn className="text-lg" />
                    <span className="font-medium">Login</span>
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/auth/signup')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiUserPlus className="text-lg" />
                    <span>Get Started</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-800/50 bg-black/95 backdrop-blur-lg"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Navigation Items */}
                {visibleNavItems.map((item) => (
                  <motion.button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`text-xl ${isActive(item.href) ? 'text-purple-400' : ''}`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </motion.button>
                ))}

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-gray-800/50">
                  {user ? (
                    <div className="space-y-4">
                      <div className="px-4 py-2 text-sm text-gray-400">
                        Logged in as <span className="text-purple-400 font-medium">{user.email}</span>
                      </div>
                      <motion.button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all duration-300 border border-red-600/30"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiLogOut className={`text-xl ${isLoggingOut ? 'animate-spin' : ''}`} />
                        <span className="font-medium">
                          {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </span>
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <motion.button
                        onClick={() => router.push('/auth/login')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiLogIn className="text-xl" />
                        <span className="font-medium">Login</span>
                      </motion.button>
                      <motion.button
                        onClick={() => router.push('/auth/signup')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiUserPlus className="text-xl" />
                        <span>Get Started</span>
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;