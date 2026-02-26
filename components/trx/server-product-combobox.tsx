"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
        const { data } = await catApi.getProductos({
          pageSize: 50,
          // Default sorting in API is stock priority, then SKU.
          // If user wants alphabetical, we might need to adjust API or just rely on search.
          // For now, let's respect the "stock" requirement which is default.
        });
        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { data } = await catApi.getProductos({
        search: search,
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

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSearch();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              : "Buscar producto (Enter)..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false} className="overflow-visible">
          <CommandInput
            placeholder="Escribe y presiona ENTER..."
            value={search}
            onValueChange={setSearch}
            onKeyDown={onKeyDown}
          />

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Buscando...
              </span>
            </div>
          )}

          <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden pointer-events-auto">
            {!loading && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {search
                  ? "Sin resultados. Presiona Enter."
                  : "Escribe para buscar..."}
              </div>
            )}

            <CommandGroup>
              {results.map((product) => (
                <CommandItem
                  key={product.id_sku}
                  value={product.id_sku + " " + product.nombre_completo} // Trick to make sure search works if we were filtering client side, but also ensures unique value
                  onSelect={() => {
                    setSelectedObject(product);
                    onChange(product.id_sku, product);
                    setOpen(false);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedObject(product);
                    onChange(product.id_sku, product);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer pointer-events-auto", // Force pointer events
                    "data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary font-medium",
                    value === product.id_sku && "bg-primary/20 font-bold",
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      value === product.id_sku ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col w-full">
                    <span className="font-medium">
                      {product.nombre_completo}
                    </span>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>SKU: {product.id_sku}</span>
                      <span
                        className={cn(
                          Number(product.stock_actual) > 0
                            ? "text-green-600"
                            : "text-red-500",
                        )}
                      >
                        Stock: {Number(product.stock_actual).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
