import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthProvider, LoginCredentials, UserRole } from '@/types';
import { mockUsers } from '@/constants/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithProvider: (provider: AuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
}

// Create a mutable copy of mockUsers that we can modify
let userDatabase = [...mockUsers];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          let user: User | undefined;
          
          if (credentials.provider === 'email' && credentials.email && credentials.password) {
            // Find user by email and password
            user = userDatabase.find(
              u => u.email === credentials.email && 
                   u.password === credentials.password &&
                   u.providers?.includes('email')
            );
          } else if (credentials.provider === 'phone' && credentials.phone && credentials.password) {
            // Find user by phone and password
            user = userDatabase.find(
              u => u.phone === credentials.phone && 
                   u.password === credentials.password &&
                   u.providers?.includes('phone')
            );
          } else {
            throw new Error('Invalid login credentials');
          }
          
          if (!user) {
            throw new Error('Invalid login credentials');
          }
          
          // Create a copy without the password
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          
          set({ 
            user: userWithoutPassword, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Authentication failed. Please try again.', 
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
        }
      },
      
      loginWithProvider: async (provider: AuthProvider) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find a user that has this provider
          const user = userDatabase.find(u => u.providers?.includes(provider));
          
          if (!user) {
            throw new Error(`No user found with ${provider} provider`);
          }
          
          // Create a copy without the password
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          
          set({ 
            user: userWithoutPassword, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Authentication failed. Please try again.', 
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ 
            error: 'Logout failed. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      updateUser: async (userData: Partial<User>) => {
        set({ isLoading: true });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => {
            if (!state.user) return state;
            
            const updatedUser = { ...state.user, ...userData };
            
            // Also update the user in our database
            userDatabase = userDatabase.map(u => 
              u.id === updatedUser.id ? { ...u, ...userData } : u
            );
            
            return {
              user: updatedUser,
              isLoading: false,
              error: null
            };
          });
        } catch (error) {
          set({ 
            error: 'Failed to update profile. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      register: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          // Check if email already exists
          const emailExists = userDatabase.some(u => u.email === userData.email);
          if (emailExists) {
            throw new Error('Email already registered');
          }
          
          // Check if phone already exists
          const phoneExists = userDatabase.some(u => u.phone === userData.phone);
          if (phoneExists) {
            throw new Error('Phone number already registered');
          }
          
          // Create new user
          const newUser: User = {
            id: `user${Date.now()}`,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            password: userData.password,
            role: userData.role || 'orderer',
            providers: userData.providers || ['email', 'phone'],
          };
          
          // Add to database
          userDatabase.push(newUser);
          
          set({ 
            isLoading: false,
            error: null
          });
          
          return;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed. Please try again.', 
            isLoading: false
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Function to switch between mock users (for demo purposes)
export const switchMockUser = async () => {
  const { user } = useAuthStore.getState();
  const currentUserId = user?.id;
  
  // Find the other user
  const nextUser = userDatabase.find(u => u.id !== currentUserId) || userDatabase[0];
  
  // Create a copy without the password
  const userWithoutPassword = { ...nextUser };
  delete userWithoutPassword.password;
  
  await useAuthStore.getState().updateUser(userWithoutPassword);
};