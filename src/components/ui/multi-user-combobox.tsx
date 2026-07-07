"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

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

type UserOption = {
  id: string
  label: string
}

interface MultiUserComboboxProps {
  label: string
  options: UserOption[]
  value: string[]
  onChange: (value: string[]) => void
}

export function MultiUserCombobox({
  label,
  options,
  value,
  onChange,
}: MultiUserComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const toggleSelect = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const removeChip = (id: string) => {
    onChange(value.filter((v) => v !== id))
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between min-h-10"
          >
            {value.length > 0
              ? `${value.length} selected`
              : `Select ${label.toLowerCase()}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandList>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => toggleSelect(option.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Chips */}
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((id) => {
          const user = options.find((o) => o.id === id)
          if (!user) return null

          return (
            <div
              key={id}
              className="flex items-center gap-1 bg-muted text-foreground px-2 py-1 rounded-md text-xs"
            >
              {user.label}
              <X
                className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
                onClick={() => removeChip(id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
