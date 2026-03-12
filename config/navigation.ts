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
  Database,
  BookOpen,
  FolderGit2,
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
      { href: "/cotizaciones", icon: FileText, label: "Cotizaciones", matchPrefix: true },
      { href: "/production", icon: Trello, label: "Producción" },
      { href: "/inventory", icon: Box, label: "Inventario (Kardex)" },
      { href: "/catalog", icon: BookOpen, label: "Catálogo" },
    ],
  },
  {
    label: "Maestros",
    items: [
      { href: "/clients", icon: Users, label: "Clientes" },
      { href: "/suppliers", icon: ShoppingCart, label: "Proveedores" },
      { href: "/maestros/series", icon: FolderGit2, label: "Sistemas y Series" },
      { href: "/recetas", icon: FileText, label: "Recetas", matchPrefix: true },
      { href: "/maestros", icon: Database, label: "Datos Maestros" },
    ],
  },
  {
    label: "Reportes",
    items: [
      { href: "/hojas-conteo", icon: ClipboardList, label: "Hojas de Conteo" },
      { href: "/export", icon: FileSpreadsheet, label: "Exportar Datos" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/configuracion", icon: Settings, label: "Configuración" },
    ],
  },
];
