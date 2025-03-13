
import { lazy } from 'react';
import { lazyLoad } from './loaders';
import { Navigate } from 'react-router-dom';

// Import directly instead of lazy loading to troubleshoot the issue
import ChannelTypes from '../pages/ChannelTypes';
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
