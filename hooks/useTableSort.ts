import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc";

export interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export function useTableSort<T>(data: T[] | undefined, defaultSort?: SortConfig<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(defaultSort || null);

  const handleSort = (key: keyof T | string) => {
    let direction: SortDirection = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data];
    if (sortConfig) {
      sorted.sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Handle nested properties heuristically like mst_clientes?.nombre_completo
        if (typeof sortConfig.key === 'string' && sortConfig.key.includes('.')) {
           const parts = sortConfig.key.split('.');
           valA = parts.reduce((obj, p) => (obj ? obj[p] : undefined), a);
           valB = parts.reduce((obj, p) => (obj ? obj[p] : undefined), b);
        }

        // Handle string comparison
        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [data, sortConfig]);

  return { sortedData, handleSort, sortConfig };
}
