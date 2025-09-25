import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, ChevronDown, Globe, ShoppingBag, Wallet, CircleUser as UserCircle, LogOut, Settings, Bell, Search } from 'lucide-react';
import { Button, SearchBar, NotificationDropdown } from '../../ui';
import { AuthModal } from '../../auth';
import { useLanguage } from '../../../hooks';
import { useNotifications } from '../../../hooks/useSupabase';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants';

interface HeaderProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  showSidebarToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSidebarToggle, 
  isSidebarOpen, 
  showSidebarToggle = true 
}) => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleLanguageMenu = () => setIsLanguageMenuOpen(!isLanguageMenuOpen);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const userMenuItems = [
    { href: ROUTES.DASHBOARD, label: t('navigation.dashboard'), icon: UserCircle },
    { href: ROUTES.WALLET, label: t('navigation.wallet'), icon: Wallet },
    { href: ROUTES.REFERRALS, label: t('navigation.referrals'), icon: ShoppingBag },
    { href: ROUTES.PROFILE, label: t('navigation.profile'), icon: Settings },
  ];

  // Pages that should show search bar
  const shouldShowSearch = ['/', '/stores', '/categories', '/offers'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
            {/* Hamburger Menu - Always show */}
            {showSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            {/* Logo - Show when sidebar is closed or always on mobile */}
            <Link 
              to={ROUTES.HOME} 
              className="flex items-center space-x-2 flex-shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-teal-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">SaveMoney</span>
            </Link>
          </div>

          {/* Center - Search Bar (only on specific pages) */}
          {shouldShowSearch && (
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchBar
                placeholder={t('home.searchPlaceholder')}
                onSearch={(query) => {
                  console.log('Search:', query);
                }}
                className="w-full"
              />
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Notifications */}
            {isAuthenticated && (
              <NotificationDropdown />
            )}

            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={toggleLanguageMenu}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {isLanguageMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <button
                      onClick={() => {
                        changeLanguage('en');
                        toggleLanguageMenu();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        changeLanguage('hi');
                        toggleLanguageMenu();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                    >
                      हिन्दी
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <img
                    src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">Premium Member</div>
                  </div>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={toggleUserMenu}
                          className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors duration-200"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          toggleUserMenu();
                          logout();
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('navigation.logout')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleAuthClick('login')}
                  className="hidden sm:flex"
                >
                  {t('navigation.login')}
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleAuthClick('signup')}
                  className="bg-orange-500 hover:bg-orange-600 font-semibold"
                >
                  {t('navigation.signup')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (only on specific pages) */}
        {shouldShowSearch && (
          <div className="md:hidden pb-3">
            <SearchBar
              placeholder={t('home.searchPlaceholder')}
              onSearch={(query) => {
                console.log('Mobile search:', query);
              }}
            />
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </header>
  );
};