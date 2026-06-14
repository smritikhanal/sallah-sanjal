import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './utils/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerSearch from './pages/WorkerSearch';
import WorkerProfile from './pages/WorkerProfile';
import BookNow from './pages/BookNow';
import ClientDashboard from './pages/ClientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import Booking from './pages/Booking';

// Components
import PrivateRoute from './components/PrivateRoute';
import LogoPreloader from './components/LogoPreloader';

function App() {
  const { user, setUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token && !user) {
          // Try to fetch user from backend using token
          const response = await fetch('http://localhost:5000/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUser({
                id: data.user.id,
                role: data.user.role,
                email: data.user.email,
                name: data.user.name,
              });
            } else {
              logout();
            }
          } else {
            logout();
          }
        } else if (!token && user) {
          // No token means the session is not valid anymore; clear stale user state.
          logout();
        }
      } catch (error) {
        console.log('Auth restoration failed, user will need to login again');
        logout();
      }
      
      // Set minimum preloader display time of 2.5 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 2500);
    };

    restoreAuth();
  }, [user, setUser, logout]);

  return (
    <>
      <LogoPreloader isLoading={isLoading} size="medium" text="Loading Sallah Sanjal..." />
      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnHover draggable />
      
      {!isLoading && (
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/workers" element={<WorkerSearch />} />
            <Route path="/workers/:workerId" element={<WorkerProfile />} />
            <Route path="/book/:workerId" element={<PrivateRoute roles={['client']}><BookNow /></PrivateRoute>} />
            {/* <Route path="/booking/:workerId" element={<PrivateRoute><Booking /></PrivateRoute>} /> */}
            <Route path="/chat/:conversationId" element={<PrivateRoute><Chat /></PrivateRoute>} />
            
            {/* Role-based dashboards */}
            <Route path="/dashboard/client" element={<PrivateRoute roles={['client']}><ClientDashboard /></PrivateRoute>} />
            <Route path="/dashboard/worker" element={<PrivateRoute roles={['worker']}><WorkerDashboard /></PrivateRoute>} />
            <Route path="/dashboard/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
