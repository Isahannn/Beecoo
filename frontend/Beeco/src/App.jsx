import React from 'react';
import { createBrowserRouter, RouterProvider, Link,Outlet } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './Context';
import Registration from './components/Auth/Registration/Registration';

const Layout = () => (
  <div className="layout">
    <header className="header">My App</header>
    <main className="main-content">
      <h1>Welcome to My App</h1>
      <div className="buttons-container">
        <Link to="/login">
          <button className="button">Log In</button>
        </Link>
        <Link to="/registration">
          <button className="button">Sign Up</button>
        </Link>
      </div>
         <Outlet />
    </main>
  </div>
);

// Пример компонента LogIn
const LogIn = () => (
  <div className="login-container">
    <h2>Login</h2>
    <input type="text" placeholder="Username" />
    <input type="password" placeholder="Password" />
    <button>Log In</button>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <h2>Home Page</h2> },
      { path: '/login', element: <LogIn /> },
      { path: '/registration', element: <Registration /> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
