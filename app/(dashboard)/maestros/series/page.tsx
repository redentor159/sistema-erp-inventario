"use client";

import { SeriesList } from "@/components/mst/series-list";
import { FolderGit2 } from "lucide-react";

export default function SeriesPage() {
    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FolderGit2 className="h-6 w-6 text-slate-600" />
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Sistemas y Series Equivalencias
                        </h2>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Gestiona el catálogo maestro de sistemas de perfilería arquitectónica
                        y sus códigos equivalentes en distintos proveedores.
                    </p>
                </div>
            </div>

            <SeriesList />
        </div>
    );
}
