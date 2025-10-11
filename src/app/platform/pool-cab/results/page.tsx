"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Car, Clock, MapPin, Phone, MessageCircle, Filter, Search, Users, Calendar, RefreshCw, Mail } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import PageTitle from "@/components/page-title"

interface UserData {
  id: number
  attributes: {
    username: string
    email: string
    phone: string | null
  }
}

interface PoolData {
  id: string
  attributes: {
    journey: string
    time: string
    day: string
    status: string
    createdAt: string
    updatedAt: string
    use_email: boolean
    pooler: {
      data: UserData
    }
  }
}

export default function PoolCabResults() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [pools, setPools] = React.useState<PoolData[]>([])
  const [filteredPools, setFilteredPools] = React.useState<PoolData[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [dayFilter, setDayFilter] = React.useState("all")
  const [routeFilter, setRouteFilter] = React.useState("all")
  const [entriesPerPage, setEntriesPerPage] = React.useState("10")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [userPool, setUserPool] = React.useState<PoolData | null>(null)
  const [updating, setUpdating] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)

  // Get pagination from URL
  const page = searchParams.get('page') || '1'

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`
  }

  const getInitials = (username?: string) => {
    if (!username) return '??'
    const parts = username.split(/[_\s]+/)
    if (parts.length === 1) {
      return username.substring(0, 2).toUpperCase()
    }
    return parts.slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  // Fetch pools from API
  const fetchPools = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/platform/pool-cab?page=${currentPage}&limit=${entriesPerPage}`, {
        method: 'GET',
      })
      const data = await response.json()

      if (data.success) {
        setPools(data.pools || [])
        if (data.userPool) {
          setUserPool(data.userPool)
        }
      } else {
        toast.error(data.error || 'Failed to fetch pools')
      }
    } catch (error) {
      console.error('Error fetching pools:', error)
      toast.error('Failed to fetch pools')
    } finally {
      setLoading(false)
    }
  }, [currentPage, entriesPerPage])

  // Filter pools based on search and filters
  React.useEffect(() => {
    let filtered = pools.filter(pool => pool.attributes.status === 'available')

    if (searchTerm) {
      filtered = filtered.filter(pool =>
        pool.attributes.journey.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (dayFilter && dayFilter !== "all") {
      filtered = filtered.filter(pool => pool.attributes.day === dayFilter)
    }

    if (routeFilter && routeFilter !== "all") {
      filtered = filtered.filter(pool => pool.attributes.journey === routeFilter)
    }

    setFilteredPools(filtered)
  }, [pools, searchTerm, dayFilter, routeFilter])

  // Get unique routes and days for filters
  const uniqueRoutes = React.useMemo(() => {
    const routes = [...new Set(pools.map(pool => pool.attributes.journey))]
    return routes.sort()
  }, [pools])

  const uniqueDays = React.useMemo(() => {
    const days = [...new Set(pools.map(pool => pool.attributes.day))]
    return days.sort()
  }, [pools])

  // Fetch pools on component mount and when page changes
  React.useEffect(() => {
    fetchPools()
  }, [fetchPools])

  React.useEffect(() => {
    setCurrentPage(parseInt(page))
  }, [page])

  const handleWhatsAppContact = (phoneNumber: string, pool: PoolData) => {
    const message = encodeURIComponent(
      `Hi! I found your cab pool request on the Platform by Techmin.\n\n` +
      `Route: ${pool.attributes.journey}\n` +
      `Date: ${formatDate(pool.attributes.day)}\n` +
      `Time: ${formatTime(pool.attributes.time)}\n\n` +
      `I'm interested in joining your trip!`
    )
    window.open(`https://wa.me/+91${phoneNumber}?text=${message}`, '_blank')
  }

  const handleEmailContact = (email: string, pool: PoolData) => {
    const subject = encodeURIComponent('Cab Pool Request - Platform')
    const body = encodeURIComponent(
      `Hi,\n\n` +
      `I found your cab pool request on the Platform by Techmin, and I'm interested in joining your trip.\n\n` +
      `Details:\n` +
      `Route: ${pool.attributes.journey}\n` +
      `Date: ${formatDate(pool.attributes.day)}\n` +
      `Time: ${formatTime(pool.attributes.time)}\n\n` +
      `Please let me know if you're still looking for someone to share the cab.\n\n` +
      `Thanks!`
    )
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  const handleCancelRequest = async () => {
    if (!userPool) return

    try {
      setUpdating(true)
      const response = await fetch('/api/platform/pool-cab', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: userPool.id,
          status: 'canceled'
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Pool request canceled successfully!')
        router.push('/platform/pool-cab')
      } else {
        toast.error(data.error || 'Failed to cancel request')
      }
    } catch (error) {
      console.error('Error cancelling request:', error)
      toast.error('Failed to cancel request')
    } finally {
      setUpdating(false)
    }
  }

  const handleFoundCab = async () => {
    if (!userPool) return

    try {
      setUpdating(true)
      const response = await fetch('/api/platform/pool-cab', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: userPool.id,
          status: 'pooled'
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Pool marked as completed!')
        router.push('/platform/pool-cab')
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const totalPages = Math.ceil(filteredPools.length / parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * parseInt(entriesPerPage)
  const endIndex = startIndex + parseInt(entriesPerPage)
  const currentPools = filteredPools.slice(startIndex, endIndex)

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Page Title */}
      <div className="space-y-4 sm:mt-8 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <PageTitle
                text="Pool a Cab Results"
                icon={Car}
                subheading="Find available cab pools and manage your requests. Contact other users to share rides and save money on transportation."
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPools}
            disabled={loading}
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="cursor-pointer lg:cursor-default" onClick={() => setShowFilters(!showFilters)}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Find Your Cab Pool
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
          {/* Mobile: Stacked layout, Tablet: 2 columns, Desktop: 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Day Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Filter by Day</Label>
              <Select value={dayFilter} onValueChange={setDayFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {uniqueDays.map((day) => (
                    <SelectItem key={day} value={day}>
                      {formatDate(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Route Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Filter by Route</Label>
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Routes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {uniqueRoutes.map((route) => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entries per page */}
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

            {/* Search */}
            <div className="space-y-2">
              <Label className="text-sm">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search route..."
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Cab Pools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading cab pools...</p>
            </div>
          ) : currentPools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cab pools found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {currentPools.map((pool) => (
                <div key={pool.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarFallback className="bg-primary-light/70 text-white">{getInitials(pool.attributes.pooler.data.attributes.username)}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{pool.attributes.pooler.data.attributes.username}</div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          {formatTime(pool.attributes.time)}
                        </span>
                        <span className="flex items-center gap-1 min-w-0">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{pool.attributes.journey}</span>
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          {formatDate(pool.attributes.day)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 sm:flex-shrink-0">
                    <Badge variant="default" className="text-xs bg-green-600">
                      Available
                    </Badge>

                    {pool.attributes.use_email ? (
                      <Button
                        size="sm"
                        onClick={() => handleEmailContact(pool.attributes.pooler.data.attributes.email, pool)}
                        className="gap-2 flex-1 sm:flex-initial"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleWhatsAppContact(pool.attributes.pooler.data.attributes.phone || '', pool)}
                        className="gap-2 flex-1 sm:flex-initial dark:bg-green dark:hover:bg-green/70"
                        disabled={!pool.attributes.pooler.data.attributes.phone}
                        variant="destructive"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPools.length)} of {filteredPools.length} entries
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

      <Separator />

      {/* Trip Details Section - Only show if user has a pool */}
      {userPool && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Your Trip Details</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Below are your current pool request details. You can mark it as pooled when you've found someone, or cancel if you no longer need it.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Date</Label>
                  <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{formatDate(userPool.attributes.day)}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Time</Label>
                  <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{formatTime(userPool.attributes.time)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Route</Label>
                  <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">{userPool.attributes.journey}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md">
                    <Badge variant={userPool.attributes.status === 'available' ? 'default' : 'secondary'} className={`text-xs ${userPool.attributes.status === 'available' ? 'bg-green-600' : 'bg-primary'}`}>
                      {userPool.attributes.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 sm:justify-end">
              <Button
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                onClick={handleFoundCab}
                disabled={updating || userPool.attributes.status !== 'available'}
              >
                {updating ? 'Processing...' : 'Found a Pool'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelRequest}
                disabled={updating || userPool.attributes.status !== 'available'}
                className="w-full sm:w-auto bg-primary hover:bg-primary/80 dark:hover:bg-primary-light"
              >
                {updating ? 'Cancelling...' : 'Cancel Pool Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}