
import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Lazy load channel type components
const ChannelTypes = lazy(() => import('../pages/ChannelTypes'));
const ChannelTypeDetails = lazy(() => import('../pages/ChannelTypeDetails'));

export const channelTypeRoutes = [
  {
    path: "/channel-types",
    element: lazyLoad(ChannelTypes),
  },
  {
    path: "/channel-type/:typeId",
    element: lazyLoad(ChannelTypeDetails),
  },
  {
    path: "/channel-types/:typeId",
    element: lazyLoad(ChannelTypeDetails),
  }
];
