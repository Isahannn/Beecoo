import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './Context/AutoContext.jsx';
import Registration from './components/Auth/Registration/Registration';
import LogIn from './components/Auth/Login/LogIn.jsx';
import Welcome from './WelcomePage/Welcome.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import NotFound from './pages/ErrorPage/NotFound.jsx';
import Home from './pages/Home/Home.jsx';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import Layout from './pages/Layout/Layout.jsx';
import {Navbar} from "./pages/Layout/NavBar/NavBar.jsx";
import Footer from "./pages/Layout/Footer/Footer.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <Welcome /> },
      {
        path: '/login',
        element: (
          <PublicRoute>
            <LogIn />
          </PublicRoute>
        ),
      },
      {
        path: '/registration',
        element: (
          <PublicRoute>
            <Registration />
          </PublicRoute>
        ),
      },
      {
        path: '/home',
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function AppContent() {

  const { isAuthenticated } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main>
        <RouterProvider router={router} />
      </main>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId="604621430295-16qjcu4fjjbda1uc13kc5ufpjinr3ai4.apps.googleusercontent.com">
      <AuthProvider>
        <React.StrictMode>
        <AppContent />
        </React.StrictMode>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
