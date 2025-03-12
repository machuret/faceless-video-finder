
import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Lazy loading for the channel type pages
const ChannelTypePage = lazy(() => import('../pages/ChannelTypeDetails/components/ChannelTypeDetailsPage'));
const ChannelTypes = lazy(() => import('../pages/ChannelTypes'));

export const channelTypeRoutes = [
  {
    path: "channel-types",
    element: lazyLoad(ChannelTypes),
  },
  {
    path: "channel-types/:typeId",
    element: lazyLoad(ChannelTypePage),
  }
];
