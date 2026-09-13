import { Home, Users, BarChart3, CalendarDays, Images } from "lucide-react";

export const PUBLIC_NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/squad", label: "Squad", icon: Users },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/gallery", label: "Gallery", icon: Images },
] as const;
