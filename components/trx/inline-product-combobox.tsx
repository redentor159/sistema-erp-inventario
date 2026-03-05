"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { catApi } from "@/lib/api/cat";

interface InlineProductComboboxProps {
  value?: string;
  onChange: (value: string, producto: any) => void;
  disabled?: boolean;
}

export function InlineProductCombobox({
  value,
  onChange,
  disabled,
}: InlineProductComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const [selectedName, setSelectedName] = React.useState("");
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const handleSearch = async (text: string) => {
    if (!text.trim()) {
      // If empty, load initial products
      setLoading(true);
      try {
        const { data } = await catApi.getProductos({ pageSize: 50 });
        setResults(data || []);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      const { data } = await catApi.getProductos({
        search: text,
        pageSize: 50,
      });
      setResults(data || []);
    } catch (err) {
      console.error("Error buscando:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(text), 300);
  };

  const handleSelect = (product: any) => {
    setSelectedName(product.nombre_completo);
    onChange(product.id_sku, product);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  // Carga inicial: 50 productos con stock al abrir
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }
    // Focus input after popover opens
    setTimeout(() => inputRef.current?.focus(), 0);
    if (query) return; // ya tiene búsqueda activa
    setLoading(true);
    try {
      const { data } = await catApi.getProductos({ pageSize: 50 });
      setResults(data || []);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between pl-3 text-left font-normal",
            !value && "text-muted-foreground",
            value && "font-medium text-foreground border-primary/50",
          )}
        >
          <span className="truncate">
            {selectedName || (value ? value : "Buscar SKU o nombre...")}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search input - plain HTML, no cmdk */}
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={handleInputChange}
            placeholder="Escribe SKU o nombre del producto..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Results list - plain HTML, fully scrollable and clickable */}
        <div
          ref={listRef}
          className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1"
          onWheel={(e) => {
            // Prevent Radix Portal from swallowing wheel events
            const el = listRef.current;
            if (!el) return;
            e.stopPropagation();
            el.scrollTop += e.deltaY;
          }}
        >
          {!loading && query && results.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Sin resultados para &quot;{query}&quot;.
            </div>
          )}
          {!loading && !query && results.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Escribe para buscar productos
            </div>
          )}
          {results.map((product) => (
            <div
              key={product.id_sku}
              onClick={() => handleSelect(product)}
              className={cn(
                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer select-none",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors",
                value === product.id_sku && "bg-primary/20 font-bold",
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4 text-primary shrink-0",
                  value === product.id_sku ? "opacity-100" : "opacity-0",
                )}
              />
              <div className="flex flex-col w-full min-w-0">
                <span className="font-medium truncate">
                  {product.nombre_completo}
                </span>
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>SKU: {product.id_sku}</span>
                  <span
                    className={cn(
                      "font-medium",
                      Number(product.stock_actual) > 0
                        ? "text-green-600"
                        : "text-red-500",
                    )}
                  >
                    Stock: {Number(product.stock_actual).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
