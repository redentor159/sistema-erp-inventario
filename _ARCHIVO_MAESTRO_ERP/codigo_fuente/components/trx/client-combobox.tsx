"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ClientComboboxProps {
    value: string
    onChange: (value: string) => void
    clientes: any[]
    disabled?: boolean
}

export function ClientCombobox({ value, onChange, clientes = [], disabled }: ClientComboboxProps) {
    const [open, setOpen] = React.useState(false)

    // Find selected client
    const selectedClient = clientes?.find((c) => c.id_cliente === value)

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
                        !value && "text-muted-foreground"
                    )}
                >
                    {selectedClient ? (
                        <span className="flex items-center gap-2 truncate">
                            <User className="h-4 w-4 opacity-50" />
                            {selectedClient.nombre_completo}
                        </span>
                    ) : (
                        "Seleccionar Cliente..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                        <CommandEmpty>No se encontró cliente.</CommandEmpty>
                        <CommandGroup>
                            {clientes?.map((cliente) => (
                                <CommandItem
                                    key={cliente.id_cliente}
                                    value={cliente.nombre_completo}
                                    onSelect={() => {
                                        onChange(cliente.id_cliente)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === cliente.id_cliente ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{cliente.nombre_completo}</span>
                                        {cliente.nro_doc && (
                                            <span className="text-xs text-muted-foreground">
                                                ID: {cliente.nro_doc}
                                            </span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
