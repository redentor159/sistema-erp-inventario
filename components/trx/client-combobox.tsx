"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientComboboxProps {
  value: string;
  onChange: (value: string) => void;
  clientes: any[];
  disabled?: boolean;
}

export function ClientCombobox({
  value,
  onChange,
  clientes = [],
  disabled,
}: ClientComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedClient = clientes?.find((c) => c.id_cliente === value);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return clientes;
    const s = search.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nombre_completo?.toLowerCase().includes(s) ||
        c.nro_doc?.toLowerCase().includes(s)
    );
  }, [clientes, search]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  function handleSelect(cliente: any) {
    onChange(cliente.id_cliente);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedClient ? (
            <>
              <User className="h-4 w-4 opacity-50 flex-shrink-0" />
              <span className="truncate">{selectedClient.nombre_completo}</span>
            </>
          ) : (
            "Seleccionar Cliente..."
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full min-w-[280px] rounded-md border bg-popover shadow-md",
            "flex flex-col overflow-hidden"
          )}
          style={{ maxHeight: "320px" }}
        >
          {/* Search input */}
          <div className="flex items-center border-b px-3 py-2 flex-shrink-0">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: "260px" }}>
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No se encontró cliente.
              </div>
            ) : (
              filtered.map((cliente) => (
                <div
                  key={cliente.id_cliente}
                  onMouseDown={(e) => {
                    // use mousedown to fire before blur
                    e.preventDefault();
                    handleSelect(cliente);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === cliente.id_cliente && "bg-accent/60 font-medium"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      value === cliente.id_cliente ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{cliente.nombre_completo}</span>
                    {cliente.nro_doc && (
                      <span className="text-xs text-muted-foreground">
                        Doc: {cliente.nro_doc}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
