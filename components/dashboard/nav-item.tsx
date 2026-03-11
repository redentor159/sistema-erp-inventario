import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItemProps {
    href: string;
    icon: any;
    label: string;
    collapsed?: boolean;
    active: boolean;
    onClick?: () => void;
}

    export function NavItem({
        href,
        icon: Icon,
        label,
        collapsed = false,
        active,
        onClick,
    }: NavItemProps) {
        return (
            <Link
                href={href}
                onClick={onClick}
                className={cn(
                    "flex items-center px-2.5 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    active
                        ? "bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-500/10 dark:bg-blue-900/20 dark:text-blue-200 dark:ring-blue-500/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                    collapsed ? "justify-center" : "",
                )}
            title={collapsed ? label : undefined}
        >
            <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}
