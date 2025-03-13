
import { publicRoutes } from './publicRoutes';
import { calculatorRoutes } from './calculatorRoutes';
import { channelRoutes } from './channelRoutes';
import { adminRoutes } from './adminRoutes';
import { contentRoutes } from './contentRoutes';
import { channelTypeRoutes } from './channelTypeRoutes';
import { authRoutes } from './authRoutes';
import NotFound from '../pages/NotFound';

// Combine all route groups
const routes = [
  ...publicRoutes,
  ...calculatorRoutes,
  ...channelRoutes,
  ...channelTypeRoutes, // Make sure this comes before contentRoutes to avoid path conflicts
  ...contentRoutes,
  ...adminRoutes,
  ...authRoutes,
  // 404 route should always be last
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
