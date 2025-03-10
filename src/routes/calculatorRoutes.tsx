
import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Lazy load calculator components
const Calculators = lazy(() => import('../pages/Calculators'));
const Calculator = lazy(() => import('../pages/Calculator'));
const GrowthRateCalculator = lazy(() => import('../pages/GrowthRateCalculator'));
const ReachCalculator = lazy(() => import('../pages/ReachCalculator'));
const ChannelEarnings = lazy(() => import('../pages/ChannelEarnings'));

export const calculatorRoutes = [
  {
    path: "/calculators",
    element: lazyLoad(Calculators),
  },
  {
    path: "/calculator",
    element: lazyLoad(Calculator),
  },
  {
    path: "/growth-rate-calculator",
    element: lazyLoad(GrowthRateCalculator),
  },
  {
    path: "/reach-calculator",
    element: lazyLoad(ReachCalculator),
  },
  {
    path: "/channel-earnings",
    element: lazyLoad(ChannelEarnings),
  },
];
