
import { Button } from "@/components/ui/button"
import Link from "next/link" // Import Link
import { LayoutDashboard, Settings, User, Box, Users, ShoppingCart, FileText, Trello } from "lucide-react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
