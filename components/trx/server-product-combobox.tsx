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

interface ServerProductComboboxProps {
  value?: string;
  initialProduct?: any;
  onChange: (value: string, producto: any) => void;
  disabled?: boolean;
}

export function ServerProductCombobox({
  value,
  initialProduct,
  onChange,
  disabled,
}: ServerProductComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store the selected product object even if it's not in the results
  const [selectedObject, setSelectedObject] = React.useState<any>(
    initialProduct || null,
  );

  React.useEffect(() => {
    if (initialProduct) {
      setSelectedObject(initialProduct);
    }
  }, [initialProduct]);

  // Initial Fetch
  React.useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const { data } = await catApi.getProductos({ pageSize: 50 });
        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleSearch = async (text: string) => {
    if (!text.trim()) {
      // Reload initial products
      setLoading(true);
      try {
        const { data } = await catApi.getProductos({ pageSize: 50 });
        setResults(data || []);
      } catch (err) {
        console.error(err);
        setResults([]);
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
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(text), 300);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearch("");
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
            {selectedObject
              ? selectedObject.nombre_completo
              : "Buscar producto..."}
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
            value={search}
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
          {loading && results.length === 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Buscando...
              </span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {search
                ? "Sin resultados."
                : "Escribe para buscar..."}
            </div>
          )}

          {results.map((product) => (
            <div
              key={product.id_sku}
              onClick={() => {
                setSelectedObject(product);
                onChange(product.id_sku, product);
                setOpen(false);
              }}
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
