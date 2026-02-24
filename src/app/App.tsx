import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { EmergencyProvider } from './contexts/EmergencyContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <EmergencyProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </EmergencyProvider>
    </AuthProvider>
  );
}
