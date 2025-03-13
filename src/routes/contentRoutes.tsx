
import FacelessIdeas from '../pages/FacelessIdeas';
import Niches from '../pages/Niches';
import NicheDetails from '../pages/NicheDetails';
import FacelessIdeaDetails from '../pages/FacelessIdeaDetails';
import FacelessChannelIdeas from '../pages/FacelessChannelIdeas';

export const contentRoutes = [
  // Niches
  {
    path: "/niches",
    element: <Niches />,
  },
  {
    path: "/niche/:id",
    element: <NicheDetails />,
  },
  {
    path: "/niches/:slug",
    element: <NicheDetails />,
  },
  
  // Faceless Ideas
  {
    path: "/faceless-ideas",
    element: <FacelessIdeas />,
  },
  {
    path: "/faceless-idea/:id",
    element: <FacelessIdeaDetails />,
  },
  {
    path: "/faceless-ideas/:ideaId",
    element: <FacelessIdeaDetails />,
  },
  {
    path: "/faceless-channel-ideas",
    element: <FacelessChannelIdeas />,
  },
];
