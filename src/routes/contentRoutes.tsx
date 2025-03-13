
import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Lazy load content-related components
const Niches = lazy(() => import('../pages/Niches'));
const NicheDetails = lazy(() => import('../pages/NicheDetails'));
const FacelessIdeas = lazy(() => import('../pages/FacelessIdeas'));
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
    element: lazyLoad(FacelessIdeas),
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
