import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { ContactsPage } from './pages/ContactsPage';
import { AlertHistoryPage } from './pages/AlertHistoryPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'history', element: <AlertHistoryPage /> },
      { path: 'chatbot', element: <ChatbotPage /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'profile', element: <ProfilePage /> },
    ]
  }
]);
