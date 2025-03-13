
import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Redirect to the content routes to maintain consistency
const ChannelTypeRedirect = lazy(() => import('../pages/ChannelTypeDetails'));
const ChannelTypes = lazy(() => import('../pages/ChannelTypes'));

// Improved routing with additional type-specific path
export const channelTypeRoutes = [
  {
    path: "channel-types",
    element: lazyLoad(ChannelTypes),
  },
  {
    path: "channel-type/:typeId",
    element: lazyLoad(ChannelTypeRedirect),
  },
  {
    path: "channel-types/:typeId",
    element: lazyLoad(ChannelTypeRedirect),
  }
];
