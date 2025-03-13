
import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Lazy load channel components
const ChannelSearch = lazy(() => import('../pages/ChannelSearch'));
const ChannelDetails = lazy(() => import('../pages/ChannelDetails'));

export const channelRoutes = [
  {
    path: "/channels",
    element: lazyLoad(ChannelSearch),
  },
  // Make sure we handle both the slug and direct ID patterns
  {
    path: "/channel/:slug",
    element: lazyLoad(ChannelDetails),
  },
];
