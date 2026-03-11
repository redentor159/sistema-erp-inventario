import {
  LayoutDashboard,
  Settings,
  Box,
  Users,
  ShoppingCart,
  FileText,
  Trello,
  FileSpreadsheet,
  ClipboardList,
} from "lucide-react";

export type NavItemConfig = {
  href: string;
  icon: any;
  label: string;
  matchPrefix?: boolean;
};

export type NavGroupConfig = {
  label?: string;
  items: NavItemConfig[];
};

export const MAIN_NAVIGATION: NavGroupConfig[] = [
  {
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Panel Principal" },
      { href: "/catalog", icon: Box, label: "Catálogo" },
      { href: "/inventory", icon: Box, label: "Inventario (Kardex)" },
      { href: "/cotizaciones", icon: FileText, label: "Cotizaciones", matchPrefix: true },
      { href: "/production", icon: Trello, label: "Producción" },
    ],
  },
  {
    label: "Maestros",
    items: [
      { href: "/configuracion", icon: Settings, label: "Configuración" },
      { href: "/maestros/series", icon: Box, label: "Sistemas y Series" },
      { href: "/recetas", icon: FileText, label: "Recetas", matchPrefix: true },
      { href: "/clients", icon: Users, label: "Clientes" },
      { href: "/suppliers", icon: ShoppingCart, label: "Proveedores" },
    ],
  },
  {
    label: "Reportes",
    items: [
      { href: "/export", icon: FileSpreadsheet, label: "Exportar Datos" },
      { href: "/hojas-conteo", icon: ClipboardList, label: "Hojas de Conteo" },
    ],
  },
];
