import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Redirect to the content routes to maintain consistency
const ChannelTypeRedirect = lazy(() => import('../pages/ChannelTypeDetails'));
const ChannelTypes = lazy(() => import('../pages/ChannelTypes'));

// Keeping this file for backward compatibility but using consistent paths with contentRoutes
export const channelTypeRoutes = [
  {
    path: "channel-types",
    element: lazyLoad(ChannelTypes),
  },
  {
    path: "channel-types/:typeId",
    element: lazyLoad(ChannelTypeRedirect),
  }
];
