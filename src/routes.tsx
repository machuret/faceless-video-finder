
import { RouteObject } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChannelSearch from "./pages/ChannelSearch";

// Define routes that can be imported into App.tsx
const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/channels",
    element: <ChannelSearch />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
];

export default routes;
