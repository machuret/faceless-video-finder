
import { lazy } from "react";
import ChannelDetails, { getChannelSlug } from "../pages/ChannelDetails";
import ChannelTypes from "../pages/ChannelTypes";
import ChannelTypeDetails from "../pages/ChannelTypeDetails";
import ChannelRankings from "../pages/ChannelRankings";

// Use lazy loading for user-facing pages to improve performance
const ChannelSearch = lazy(() => import("../pages/ChannelSearch"));

export const channelRoutes = [
  {
    path: "/channel-search",
    element: <ChannelSearch />,
  },
  {
    path: "/channel/:slug",
    element: <ChannelDetails />,
  },
  {
    path: "/channel-types",
    element: <ChannelTypes />,
  },
  {
    path: "/channel-types/:typeId",
    element: <ChannelTypeDetails />,
  },
  {
    path: "/channel-rankings",
    element: <ChannelRankings />,
  }
];
