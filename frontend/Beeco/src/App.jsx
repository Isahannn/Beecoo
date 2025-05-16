import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './Context';
import Registration from './components/Auth/Registration/Registration';
import LogIn from './components/Auth/Login/LogIn.jsx';
import Welcome from './WelcomePage/Welcome.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import NotFound from './pages/ErrorPage/NotFound.jsx';
import Home from './pages/Home/Home.jsx';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute'; // 👈 добавлен
import Layout from './pages/Layout/Layout.jsx';

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

function App() {
  return (
    <GoogleOAuthProvider clientId="604621430295-16qjcu4fjjbda1uc13kc5ufpjinr3ai4.apps.googleusercontent.com">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
