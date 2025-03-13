
import React from "react";

// Define navigation items with emoji icons
export const navigationItems = [
  {
    path: "/",
    icon: <span className="mr-1">🏠</span>,
    label: "Home",
  },
  {
    path: "/calculators",
    icon: <span className="mr-1">🧮</span>,
    label: "Calculators",
  },
  {
    path: "/faceless-ideas",
    icon: <span className="mr-1">💡</span>,
    label: "Ideas",
  },
  {
    path: "/channel-types",
    icon: <span className="mr-1">📺</span>,
    label: "Channel Types",
  },
  {
    path: "/niches",
    icon: <span className="mr-1">🏷️</span>,
    label: "Niches",
  },
  {
    path: "https://facelesstraining.com/",
    icon: <span className="mr-1">🎓</span>,
    label: "Training",
    isExternal: true,
  },
  {
    path: "/how-it-works",
    icon: <span className="mr-1">❓</span>,
    label: "How It Works",
  },
];

// Function to check if "Ideas" is active
export const isIdeasActive = (pathname: string): boolean => {
  return pathname.startsWith('/faceless-ideas') || 
         pathname === '/faceless-ideas' || 
         pathname.startsWith('/faceless-channel-ideas') || 
         pathname === '/faceless-channel-ideas';
};

// Function to check if "Admin" is active
export const isAdminActive = (pathname: string): boolean => {
  return pathname.startsWith('/admin') || pathname === '/admin';
};

// Function to check if "Niches" is active
export const isNichesActive = (pathname: string): boolean => {
  return pathname.startsWith('/niches') || pathname === '/niches';
};
