"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Home, MapPin, MessageCircle, Filter, Search, Users, RefreshCw, Mail, IndianRupee } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import PageTitle from "@/components/page-title"

import { AccommodationData } from "../types"
import ActiveAccommodationRequest from "../ActiveAccommodationRequest"

export default function AshokanAroundResults() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [accommodations, setAccommodations] = React.useState<AccommodationData[]>([])
  const [filteredAccommodations, setFilteredAccommodations] = React.useState<AccommodationData[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [cityFilter, setCityFilter] = React.useState("all")
  const [housingTypeFilter, setHousingTypeFilter] = React.useState("all")
  const [genderFilter, setGenderFilter] = React.useState("all")
  const [entriesPerPage, setEntriesPerPage] = React.useState("10")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)

  // Replace with API fetch
  const [userAccommodation, setUserAccommodation] = React.useState<AccommodationData | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)

  const page = searchParams.get('page') || '1'

  // Helper functions
  const getInitials = (username?: string) => {
    if (!username) return '??'
    const parts = username.split(/[_\s]+/)
    if (parts.length === 1) {
      return username.substring(0, 2).toUpperCase()
    }
    return parts.slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  const fetchAccommodations = React.useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/platform/ashokan-around?limit=1000')
      const data = await response.json()

      if (data.success) {
        setAccommodations(data.accommodations || [])
        if (data.userAccommodation) {
          setUserAccommodation(data.userAccommodation)
        }
      } else {
        toast.error('Failed to fetch connections')
      }

      setLoading(false)

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch connections')
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    let filtered = accommodations.filter(acc => acc.attributes.status === 'available')

    if (searchTerm) {
      filtered = filtered.filter(acc => {
        const label = `${acc.attributes.cityDestination} ${acc.attributes.housingTypeWanted} ${acc.attributes.workplaceLocation}`
        return label.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (cityFilter && cityFilter !== "all") {
      filtered = filtered.filter(acc => acc.attributes.cityDestination === cityFilter)
    }

    if (housingTypeFilter && housingTypeFilter !== "all") {
      filtered = filtered.filter(acc => acc.attributes.housingTypeWanted === housingTypeFilter)
    }

    if (genderFilter && genderFilter !== "all") {
      filtered = filtered.filter(acc => acc.attributes.genderPreference === genderFilter)
    }

    setFilteredAccommodations(filtered)
  }, [accommodations, searchTerm, cityFilter, housingTypeFilter, genderFilter])

  const uniqueCities = React.useMemo(() => {
    const cities = [...new Set(accommodations.map(acc => acc.attributes.cityDestination))]
    return cities.sort()
  }, [accommodations])

  const uniqueHousingTypes = React.useMemo(() => {
    const types = [...new Set(accommodations.map(acc => acc.attributes.housingTypeWanted))]
    return types.sort()
  }, [accommodations])

  React.useEffect(() => {
    fetchAccommodations()
  }, [fetchAccommodations])

  React.useEffect(() => {
    setCurrentPage(parseInt(page))
  }, [page])

  const handleWhatsAppContact = (phoneNumber: string, acc: AccommodationData) => {
    const message = encodeURIComponent(
      `Hi! I found your accommodation request on the Platform by Techmin.\n\n` +
      `City: ${acc.attributes.cityDestination}\n` +
      `Housing Type: ${acc.attributes.housingTypeWanted}\n` +
      `Budget: ${acc.attributes.budget}\n\n` +
      `I'm interested in connecting over this!`
    )
    window.open(`https://wa.me/+91${phoneNumber}?text=${message}`, '_blank')
  }

  const handleEmailContact = (email: string, acc: AccommodationData) => {
    const subject = encodeURIComponent('Accommodation Connect Request - Platform')
    const body = encodeURIComponent(
      `Hi,\n\n` +
      `I found your accommodation request on the Platform by Techmin, and I'm interested in connecting.\n\n` +
      `Details:\n` +
      `City: ${acc.attributes.cityDestination}\n` +
      `Housing Type: ${acc.attributes.housingTypeWanted}\n` +
      `Budget: ${acc.attributes.budget}\n\n` +
      `Please let me know if you're still looking.\n\n` +
      `Thanks!`
    )
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  const totalPages = Math.ceil(filteredAccommodations.length / parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * parseInt(entriesPerPage)
  const endIndex = startIndex + parseInt(entriesPerPage)
  const currentListings = filteredAccommodations.slice(startIndex, endIndex)

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Header */}
      <div className="space-y-4 sm:mt-8 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/platform/ashokan-around')}
              className="h-8 w-8 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="text-primary dark:text-primary-bright">Connect with other Ashokans</h2>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAccommodations}
            disabled={loading}
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-primary/20 dark:border-orange-900/40">
        <CardHeader className="cursor-pointer lg:cursor-default" onClick={() => setShowFilters(!showFilters)}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Find Connections
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={(e) => {
                e.stopPropagation()
                setShowFilters(!showFilters)
              }}
            >
              {showFilters ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* City Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Filter by City</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {uniqueCities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Housing Type</Label>
              <Select value={housingTypeFilter} onValueChange={setHousingTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueHousingTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Preferences Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Gender Preference</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any Preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Preference</SelectItem>
                  <SelectItem value="No preference">No preference</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Show entries</Label>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Pools */}
      <Card className="border-primary/20 dark:border-orange-900/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Accommodation Listings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading connections...</p>
            </div>
          ) : currentListings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No results found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {currentListings.map((acc) => (
                <div key={acc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarFallback className="bg-primary-light/70 text-white">{getInitials(acc.attributes.student.data.attributes.username)}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{acc.attributes.student.data.attributes.username}</div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 min-w-0 font-medium">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{acc.attributes.cityDestination} {acc.attributes.workplaceLocation ? `(${acc.attributes.workplaceLocation})` : ''}</span>
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Home className="h-3 w-3 flex-shrink-0" />
                          {acc.attributes.housingTypeWanted}
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <IndianRupee className="h-3 w-3 flex-shrink-0 text-green-600" />
                          {acc.attributes.budget}
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap bg-muted px-2 py-0.5 rounded-full text-[10px]">
                          Prefers: {acc.attributes.genderPreference}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 sm:flex-shrink-0 mt-3 sm:mt-0">
                    <Badge variant="default" className="text-xs bg-green-600">
                      Available
                    </Badge>

                    {acc.attributes.whatsappNumber && (
                      <Button
                        size="sm"
                        onClick={() => handleWhatsAppContact(acc.attributes.whatsappNumber || '', acc)}
                        className="gap-2 flex-1 sm:flex-initial bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </Button>
                    )}

                    {acc.attributes.emailAddress && (
                      <Button
                        size="sm"
                        onClick={() => handleEmailContact(acc.attributes.emailAddress || '', acc)}
                        className="gap-2 flex-1 sm:flex-initial"
                        variant="outline"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAccommodations.length)} of {filteredAccommodations.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1)
                    setCurrentPage(newPage)
                    router.push(`?page=${newPage}`)
                  }}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm"
                >
                  Previous
                </Button>
                <span className="px-2.5 sm:px-3 py-1 bg-primary text-primary-foreground rounded text-xs sm:text-sm whitespace-nowrap">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1)
                    setCurrentPage(newPage)
                    router.push(`?page=${newPage}`)
                  }}
                  disabled={currentPage === totalPages}
                  className="text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's Active Request - Bottom render */}
      {userAccommodation && (
        <>
          <Separator className="my-8" />
          <div className="pb-8">
            <ActiveAccommodationRequest userAccommodation={userAccommodation} />
          </div>
        </>
      )}

    </div>
  )
}
