"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            type="text"
            placeholder="Search for events, universities, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base border-light focus:border-primary"
          />
        </div>
      </CardContent>
    </Card>
  )
}
