import { Outlet, useLocation } from 'react-router-dom';
import Footer from "./Footer/Footer.jsx";
import {Navbar} from "./NavBar/NavBar.jsx";
import { useAuth } from '../../Context/AutoContext.jsx';
import PATH_URL from './Path';

export default function Layout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const excludedRoutes = PATH_URL;

  const shouldShowNavBar =
    isAuthenticated && !excludedRoutes.includes(location.pathname);
    const shouldShowFooter =
    isAuthenticated && !excludedRoutes.includes(location.pathname);


  return (
    <div>
      {shouldShowNavBar && <Navbar />}
      <Outlet />
      {shouldShowFooter && <Footer />}
    </div>
  );
}