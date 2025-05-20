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
import ProfilePage from './pages/Profile/ProfilePage.jsx';
import UsersPage from "./pages/ListUser/UserPage/UsersPage.jsx";
import FriendsPage from "./pages/ListUser/FriendPage/FriendsPage.jsx";
import Layout from './pages/Layout/Layout.jsx';
import { PostProvider } from './pages/Home/PostContext.jsx';
import FollowingNotMutualPage from "./pages/Home/FollowingNotMutualPage/FollowingNotMutualPage.jsx";
import { NotificationProvider } from './pages/Notification/NotificationContext.jsx';

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
      {
        path: '/user/:id',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/users',
        element: (
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/friends',
        element: (
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/following',
        element: (
          <ProtectedRoute>
            <FollowingNotMutualPage />
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
        <NotificationProvider>
          <PostProvider>
            <React.StrictMode>
              <AppContent />
            </React.StrictMode>
          </PostProvider>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;