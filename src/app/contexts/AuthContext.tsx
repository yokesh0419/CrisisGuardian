import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('crisisGuardianUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get users from localStorage
      const usersData = localStorage.getItem('crisisGuardianUsers');
      const users = usersData ? JSON.parse(usersData) : [];
      
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('crisisGuardianUser', JSON.stringify(userWithoutPassword));
        return true;
      }
      
      // Default admin login
      if (email === 'admin@crisisguardian.com' && password === 'admin123') {
        const adminUser: User = {
          id: 'admin-1',
          email: 'admin@crisisguardian.com',
          name: 'Admin User',
          phone: '+1234567890',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        setUser(adminUser);
        localStorage.setItem('crisisGuardianUser', JSON.stringify(adminUser));
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get existing users
      const usersData = localStorage.getItem('crisisGuardianUsers');
      const users = usersData ? JSON.parse(usersData) : [];
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        return false;
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        phone,
        password,
        role: 'user' as const,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('crisisGuardianUsers', JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('crisisGuardianUser', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crisisGuardianUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
