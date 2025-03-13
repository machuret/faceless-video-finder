
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

export interface NavConfig {
  mainNavItems: NavItem[];
}
