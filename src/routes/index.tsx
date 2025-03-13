
import { publicRoutes } from './publicRoutes';
import { calculatorRoutes } from './calculatorRoutes';
import { channelRoutes } from './channelRoutes';
import { adminRoutes } from './adminRoutes';
import { contentRoutes } from './contentRoutes';
import { channelTypeRoutes } from './channelTypeRoutes';
import { authRoutes } from './authRoutes';
import NotFound from '../pages/NotFound';
import ErrorBoundary from '../components/ErrorBoundary';

// Wrap route elements with ErrorBoundary for better UX
const wrapWithErrorBoundary = (routes) => {
  return routes.map(route => ({
    ...route,
    element: <ErrorBoundary>{route.element}</ErrorBoundary>,
  }));
};

// Order matters - more specific routes should come before less specific ones
const routes = [
  ...wrapWithErrorBoundary(publicRoutes),
  ...wrapWithErrorBoundary(calculatorRoutes),
  ...wrapWithErrorBoundary(contentRoutes),      // Content routes (niches, ideas)
  ...wrapWithErrorBoundary(channelTypeRoutes),  // Channel types routes
  ...wrapWithErrorBoundary(channelRoutes),      // Channel routes
  ...wrapWithErrorBoundary(adminRoutes),
  ...wrapWithErrorBoundary(authRoutes),
  // 404 route should always be last
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
