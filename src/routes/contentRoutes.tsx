
import { lazy } from 'react';
import { lazyLoad } from './loaders';
import FacelessIdeas from '../pages/FacelessIdeas'; // Import directly instead of lazy loading

// Lazy load other content-related components
const Niches = lazy(() => import('../pages/Niches'));
const NicheDetails = lazy(() => import('../pages/NicheDetails'));
const FacelessIdeaDetails = lazy(() => import('../pages/FacelessIdeaDetails'));
const FacelessChannelIdeas = lazy(() => import('../pages/FacelessChannelIdeas'));

export const contentRoutes = [
  // Niches
  {
    path: "/niches",
    element: lazyLoad(Niches),
  },
  {
    path: "/niche/:id",
    element: lazyLoad(NicheDetails),
  },
  {
    path: "/niches/:slug",
    element: lazyLoad(NicheDetails),
  },
  
  // Faceless Ideas
  {
    path: "/faceless-ideas",
    element: <FacelessIdeas />, // Use directly imported component
  },
  {
    path: "/faceless-idea/:id",
    element: lazyLoad(FacelessIdeaDetails),
  },
  {
    path: "/faceless-ideas/:ideaId",
    element: lazyLoad(FacelessIdeaDetails),
  },
  {
    path: "/faceless-channel-ideas",
    element: lazyLoad(FacelessChannelIdeas),
  },
];
