import { Outlet, useLocation } from 'react-router-dom';
import Footer from "./Footer/Footer.jsx";
import {Navbar} from "./NavBar/NavBar.jsx";
import { useAuth } from '../../Context';
import PATH_URL from './Path';

export default function Layout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const excludedRoutes = PATH_URL;

  const shouldShowNavBar =
    isAuthenticated && !excludedRoutes.includes(location.pathname);

  return (
    <div>
      {shouldShowNavBar && <Navbar />}
      <Outlet />
      <Footer />
    </div>
  );
}