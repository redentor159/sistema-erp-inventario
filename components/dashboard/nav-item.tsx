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
                "flex items-center px-2.5 py-2 text-sm font-medium rounded-md transition-colors",
                active
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
                collapsed ? "justify-center" : "",
            )}
            title={collapsed ? label : undefined}
        >
            <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}
