"use client";

import { SeriesList } from "@/components/mst/series-list";
import { FolderGit2 } from "lucide-react";

export default function SeriesPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-primary">
                        <FolderGit2 className="h-8 w-8 text-indigo-500" />
                        Sistemas y Series Equivalencias
                    </h2>
                    <p className="text-muted-foreground">
                        Gestiona el catálogo maestro de sistemas de perfilería arquitectónica
                        y sus códigos equivalentes en distintos proveedores.
                    </p>
                </div>
            </div>

            <SeriesList />
        </div>
    );
}
