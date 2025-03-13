
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

// Combine all route groups with error boundaries
const routes = [
  ...wrapWithErrorBoundary(publicRoutes),
  ...wrapWithErrorBoundary(calculatorRoutes),
  ...wrapWithErrorBoundary(channelTypeRoutes), // Move this up in the order
  ...wrapWithErrorBoundary(contentRoutes),
  ...wrapWithErrorBoundary(channelRoutes),
  ...wrapWithErrorBoundary(adminRoutes),
  ...wrapWithErrorBoundary(authRoutes),
  // 404 route should always be last
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
