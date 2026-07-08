"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react"

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

export type UserOption = {
  id: string
  label: string
}

interface MultiUserComboboxProps {
  label: string
  initialOptions?: UserOption[]
  options?: UserOption[]
  value: string[]
  onChange: (value: string[]) => void
  onSearch?: (query: string) => Promise<UserOption[]>
}

export function MultiUserCombobox({
  label,
  initialOptions = [],
  options: staticOptions,
  value,
  onChange,
  onSearch,
}: MultiUserComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<UserOption[]>(staticOptions || initialOptions)
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Keep track of all fetched options so we don't lose labels for selected IDs
  const [optionCache, setOptionCache] = React.useState<Map<string, UserOption>>(() => {
    const map = new Map<string, UserOption>()
    initialOptions.forEach(opt => map.set(opt.id, opt))
    if (staticOptions) staticOptions.forEach(opt => map.set(opt.id, opt))
    return map
  })

  // Add new options to cache
  React.useEffect(() => {
    setOptionCache(prev => {
      const newCache = new Map(prev)
      let changed = false
      options.forEach(opt => {
        if (!newCache.has(opt.id) || newCache.get(opt.id)?.label !== opt.label) {
          newCache.set(opt.id, opt)
          changed = true
        }
      })
      return changed ? newCache : prev
    })
  }, [options])

  // Debounced search
  React.useEffect(() => {
    if (!onSearch) return
    
    const handler = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setOptions(initialOptions)
        return
      }
      
      setLoading(true)
      try {
        const results = await onSearch(searchQuery)
        setOptions(results)
      } catch (err) {
        console.error("Search failed", err)
      } finally {
        setLoading(false)
      }
    }, 300)
    
    return () => clearTimeout(handler)
  }, [searchQuery, onSearch, initialOptions])

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
            className="w-full justify-between min-h-10 h-auto py-2"
          >
            {value.length > 0
              ? `${value.length} selected`
              : `Select ${label.toLowerCase()}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command shouldFilter={!onSearch}>
            <CommandInput 
              placeholder={`Search ${label.toLowerCase()}...`} 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            
            <CommandList>
                {loading && (
                  <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                )}
                {!loading && <CommandEmpty>No results found.</CommandEmpty>}

              <CommandGroup>
                {!loading && options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => toggleSelect(option.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
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
          const user = optionCache.get(id)
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
