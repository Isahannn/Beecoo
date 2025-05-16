import React from 'react';
import { createBrowserRouter, RouterProvider, Link,Outlet } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './Context';
import Registration from './components/Auth/Registration/Registration';
import LogIn from './components/Auth/Login/LogIn.jsx';
import Welcome from "./WelcomePage/Welcome.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { path: '/', element: <Welcome/> },
      { path: '/login', element: <LogIn /> },
      { path: '/registration', element: <Registration /> },
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
