import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: 'manager' | 'employee' | 'auditor';
  badge_number: string;
  shift: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  isManager: boolean;
  isEmployee: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-mgr-1',
  username: 'ayush.parab',
  full_name: 'Ayush Parab',
  email: 'ayush.parab@prism.ai',
  role: 'manager',
  badge_number: 'PRISM-M01',
  shift: 'General'
};

const AuthContext = createContext<AuthContextType>({
  currentUser: DEFAULT_USER,
  availableUsers: [DEFAULT_USER],
  switchUser: () => {},
  isManager: true,
  isEmployee: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('prism_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([DEFAULT_USER]);

  useEffect(() => {
    api.getUsers()
      .then(res => {
        if (res.users && res.users.length > 0) {
          setAvailableUsers(res.users);
          const found = res.users.find(u => u.id === currentUser.id);
          if (found) setCurrentUser(found);
        }
      })
      .catch(err => console.warn('Could not fetch user list, using fallback:', err));
  }, []);

  const switchUser = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('prism_user', JSON.stringify(user));
    }
  };

  const isManager = currentUser.role === 'manager';
  const isEmployee = currentUser.role === 'employee';

  return (
    <AuthContext.Provider value={{ currentUser, availableUsers, switchUser, isManager, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
