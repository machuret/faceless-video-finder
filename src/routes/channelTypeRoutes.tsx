
import ChannelTypes from '../pages/ChannelTypes';
import { lazy } from 'react';
import { lazyLoad } from './loaders';

const ChannelTypeDetails = lazy(() => import('../pages/ChannelTypeDetails'));

export const channelTypeRoutes = [
  {
    path: "/channel-types",
    element: <ChannelTypes />,
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
