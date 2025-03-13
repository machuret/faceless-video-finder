
import ChannelTypes from '../pages/ChannelTypes';
import ChannelTypeDetails from '../pages/ChannelTypeDetails';

export const channelTypeRoutes = [
  {
    path: "/channel-types",
    element: <ChannelTypes />,
  },
  {
    path: "/channel-type/:typeId",
    element: <ChannelTypeDetails />,
  },
  {
    path: "/channel-types/:typeId",
    element: <ChannelTypeDetails />,
  }
];
