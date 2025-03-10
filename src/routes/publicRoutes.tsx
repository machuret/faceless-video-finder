
import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Lazy load public page components
const Index = lazy(() => import('../pages/Index'));
const AboutUs = lazy(() => import('../pages/AboutUs'));
const ContactUs = lazy(() => import('../pages/ContactUs'));
const HowItWorks = lazy(() => import('../pages/HowItWorks'));
const Training = lazy(() => import('../pages/Training'));

export const publicRoutes = [
  {
    path: "/",
    element: lazyLoad(Index),
  },
  {
    path: "/about",
    element: lazyLoad(AboutUs),
  },
  {
    path: "/contact",
    element: lazyLoad(ContactUs),
  },
  {
    path: "/how-it-works",
    element: lazyLoad(HowItWorks),
  },
  {
    path: "/training",
    element: lazyLoad(Training),
  },
];
