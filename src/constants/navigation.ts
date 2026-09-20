export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/**
 * Navigation principale (section 10 / 52 / 53).
 * Utilisée à la fois par la BottomNavigation (mobile) et la Sidebar (desktop).
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/plants", label: "Mes plantes", icon: "🌿" },
  { href: "/scanner", label: "Scanner", icon: "📷" },
  { href: "/explore", label: "Explorer", icon: "📖" },
  { href: "/garden", label: "Mon jardin", icon: "🌳" },
];
