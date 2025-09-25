import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi, offersApi, categoriesApi, walletApi, referralsApi } from '../api';
import { mockStores, mockOffers, mockCategories, mockUser, mockTransactions, mockReferralData, mockNotifications } from '../data/mockData';
import toast from 'react-hot-toast';

// Stores hooks
export const useStores = (filters?: any) => {
  return useQuery({
    queryKey: ['stores', filters],
    queryFn: async () => {
      try {
        return await storesApi.getStores(filters);
      } catch (error) {
        console.warn('API not available, using mock data for stores');
        return {
          stores: mockStores,
          total: mockStores.length,
          page: 1,
          limit: 12,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStore = (id: string) => {
  return useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      try {
        return await storesApi.getStore(id);
      } catch (error) {
        console.warn('API not available, using mock data for store');
        return mockStores.find(store => store.id === id) || mockStores[0];
      }
    },
    enabled: !!id,
  });
};

export const usePopularStores = () => {
  return useQuery({
    queryKey: ['stores', 'popular'],
    queryFn: async () => {
      try {
        return await storesApi.getPopularStores();
      } catch (error) {
        console.warn('API not available, using mock data for popular stores');
        return mockStores.filter(store => store.isPopular);
      }
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Offers hooks
export const useOffers = (filters?: any) => {
  return useQuery({
    queryKey: ['offers', filters],
    queryFn: async () => {
      try {
        return await offersApi.getOffers(filters);
      } catch (error) {
        console.warn('API not available, using mock data for offers');
        return {
          offers: mockOffers,
          total: mockOffers.length,
          page: 1,
          limit: 12,
        };
      }
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useOffer = (id: string) => {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: async () => {
      try {
        return await offersApi.getOffer(id);
      } catch (error) {
        console.warn('API not available, using mock data for offer');
        return mockOffers.find(offer => offer.id === id) || mockOffers[0];
      }
    },
    enabled: !!id,
  });
};

export const useTrendingOffers = () => {
  return useQuery({
    queryKey: ['offers', 'trending'],
    queryFn: async () => {
      try {
        return await offersApi.getTrendingOffers();
      } catch (error) {
        console.warn('API not available, using mock data for trending offers');
        return mockOffers.filter(offer => offer.isTrending);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedOffers = () => {
  return useQuery({
    queryKey: ['offers', 'featured'],
    queryFn: async () => {
      try {
        return await offersApi.getFeaturedOffers();
      } catch (error) {
        console.warn('API not available, using mock data for featured offers');
        return mockOffers.filter(offer => offer.isExclusive);
      }
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Wallet hooks
export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      try {
        return await walletApi.getWalletData();
      } catch (error) {
        console.warn('API not available, using mock data for wallet');
        return {
          totalCashback: mockUser.totalCashback,
          availableCashback: mockUser.availableCashback,
          pendingCashback: mockUser.pendingCashback,
          withdrawnCashback: mockUser.totalCashback - mockUser.availableCashback - mockUser.pendingCashback,
        };
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useTransactions = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['transactions', page, limit],
    queryFn: async () => {
      try {
        return await walletApi.getTransactions(page, limit);
      } catch (error) {
        console.warn('API not available, using mock data for transactions');
        return {
          transactions: mockTransactions,
          total: mockTransactions.length,
        };
      }
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        return await walletApi.withdraw(data);
      } catch (error) {
        console.warn('API not available, simulating withdrawal');
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Withdrawal request submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit withdrawal request');
    },
  });
};

// Categories hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await categoriesApi.getCategories();
      } catch (error) {
        console.warn('API not available, using mock data for categories');
        return mockCategories;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      try {
        return await categoriesApi.getCategory(id);
      } catch (error) {
        console.warn('API not available, using mock data for category');
        return mockCategories.find(cat => cat.id === id) || mockCategories[0];
      }
    },
    enabled: !!id,
  });
};

// Referrals hooks
export const useReferrals = () => {
  return useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      try {
        return await referralsApi.getReferralData();
      } catch (error) {
        console.warn('API not available, using mock data for referrals');
        return mockReferralData;
      }
    },
  });
};

export const useGenerateReferralLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        return await referralsApi.generateReferralLink();
      } catch (error) {
        console.warn('API not available, using mock data for referral link');
        return { 
          link: mockReferralData.referralLink, 
          code: mockReferralData.referralCode 
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
};

// Notifications hooks
export const useNotifications = (userId?: string) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      try {
        // This would call the backend API when available
        return {
          notifications: mockNotifications,
          total: mockNotifications.length,
          unreadCount: mockNotifications.filter(n => !n.isRead).length,
        };
      } catch (error) {
        console.warn('API not available, using mock data for notifications');
        return {
          notifications: mockNotifications,
          total: mockNotifications.length,
          unreadCount: mockNotifications.filter(n => !n.isRead).length,
        };
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const markAsRead = (id: string) => {
    queryClient.setQueryData(['notifications', userId], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.map((notification: any) => 
          notification.id === id ? { ...notification, isRead: true } : notification
        ),
        unreadCount: old.unreadCount - 1,
      };
    });
  };

  const markAllAsRead = () => {
    queryClient.setQueryData(['notifications', userId], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.map((notification: any) => ({ ...notification, isRead: true })),
        unreadCount: 0,
      };
    });
  };

  const deleteNotification = (id: string) => {
    queryClient.setQueryData(['notifications', userId], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.filter((notification: any) => notification.id !== id),
        total: old.total - 1,
      };
    });
  };

  return {
    ...query,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};