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

interface ProductComboboxProps {
  value?: string;
  onChange: (value: string, producto: any) => void;
  productos: any[];
}

export function ProductCombobox({
  value,
  onChange,
  productos,
}: ProductComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Find selected product
  const selectedProduct = React.useMemo(
    () => productos?.find((p) => p.id_sku === value),
    [productos, value],
  );

  // Filter Logic for SPEED: filtering in memory before rendering
  // This avoids rendering thousands of hidden DOM nodes
  const filteredProducts = React.useMemo(() => {
    if (!productos) return [];
    if (!search) return productos.slice(0, 2000); // Show top 2000 by default (Allows scrolling)

    const lowerSearch = search.toLowerCase();
    return productos
      .filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(lowerSearch) ||
          p.id_sku.toLowerCase().includes(lowerSearch),
      )
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)) // Sort by name to avoid 0-stock items being buried
      .slice(0, 3000); // Increased limit to 3000 to ensure new products (0 stock) appear even if many matches
  }, [productos, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between pl-3 text-left font-normal",
            !value && "text-muted-foreground",
            value && "font-medium text-foreground border-primary/50", // Highlighting selected state
          )}
        >
          <span className="truncate">
            {selectedProduct
              ? selectedProduct.nombre_completo
              : "Buscar SKU..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar SKU o nombre..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <CommandEmpty>No se encontraron productos.</CommandEmpty>
            <CommandGroup>
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id_sku}
                  value={product.id_sku} // Using unique ID as value
                  onSelect={() => {
                    onChange(product.id_sku, product);
                    setOpen(false);
                    setSearch(""); // Reset search
                  }}
                  className={cn(
                    "cursor-pointer",
                    value === product.id_sku && "bg-primary/20 font-bold", // Distinct visual selection
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      value === product.id_sku ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between">
                      <span>{product.nombre_completo}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>SKU: {product.id_sku}</span>
                      <span
                        className={cn(
                          Number(product.stock_actual) > 0
                            ? "text-green-600 font-medium"
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
