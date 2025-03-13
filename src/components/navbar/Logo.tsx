
import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="inline-block font-bold text-2xl">{siteConfig.name}</span>
    </Link>
  );
}
