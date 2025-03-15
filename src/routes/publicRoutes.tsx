import Home from "../pages/Home";
import Contact from "../pages/Contact";
import Calculators from "../pages/Calculators";
import FacelessIdeas from "../pages/FacelessIdeas";
import Niches from "../pages/Niches";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import Auth from "../pages/Auth";
import Profile from "../pages/Profile";

export const publicRoutes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/calculators",
    element: <Calculators />,
  },
  {
    path: "/faceless-ideas",
    element: <FacelessIdeas />,
  },
  {
    path: "/niches",
    element: <Niches />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
];
