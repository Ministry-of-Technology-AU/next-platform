"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Car, Clock, MapPin, Phone, MessageCircle, Filter, Search, Users, Calendar, RefreshCw } from "lucide-react"
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
  id: string
  username: string
  email: string
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
  const [newTime, setNewTime] = React.useState("")

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

  const getInitials = (username: string) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase()
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
          setNewTime(data.userPool.attributes.time)
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
        pool.attributes.pooler.data.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.attributes.journey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.attributes.pooler.data.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleWhatsAppContact = (email: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, I found your cab pool request on the Platform. I'm interested in joining your trip. Please contact me at your convenience!`)
    // Since we don't have phone numbers, we'll show a toast with the email
    toast.info(`Contact ${name} at: ${email}`)
  }

  const handleUpdateTime = async () => {
    if (!userPool || !newTime) {
      toast.error('Please select a new time')
      return
    }

    try {
      setUpdating(true)
      const response = await fetch('/api/platform/pool-cab', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: userPool.id,
          time: newTime
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Time updated successfully!')
        fetchPools() // Refresh data
      } else {
        toast.error(data.error || 'Failed to update time')
      }
    } catch (error) {
      console.error('Error updating time:', error)
      toast.error('Failed to update time')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelRequest = async () => {
    if (!userPool) return

    try {
      setUpdating(true)
      const response = await fetch('/api/platform/pool-cab', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: userPool.id })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Request cancelled successfully!')
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
          status: 'full'
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Pool marked as full!')
        fetchPools() // Refresh data
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Page Title */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <PageTitle 
              text="Pool a Cab Results"
              icon={Car}
              subheading="Find available cab pools and manage your requests. Contact other users to share rides and save money on transportation."
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPools}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Your Cab Pool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Day Filter */}
            <div className="space-y-2">
              <Label>Filter by Day</Label>
              <Select value={dayFilter} onValueChange={setDayFilter}>
                <SelectTrigger>
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
              <Label>Filter by Route</Label>
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger>
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
              <Label>Show entries</Label>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger>
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
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, route, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
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
                <div key={pool.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{getInitials(pool.attributes.pooler.data.username)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-medium">{pool.attributes.pooler.data.username}</div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(pool.attributes.time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pool.attributes.journey}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(pool.attributes.day)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="default">
                      Available
                    </Badge>
                    
                    <Button
                      size="sm"
                      onClick={() => handleWhatsAppContact(pool.attributes.pooler.data.email, pool.attributes.pooler.data.username)}
                      className="gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
              <div className="text-sm text-muted-foreground">
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
                >
                  Previous
                </Button>
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
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
            <CardTitle>Your Trip Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              If you found a person to pool a cab with, or wish to change your estimated time of arrival, 
              you can update your details below so that others can contact you for the right trips.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {formatDate(userPool.attributes.day)}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Time</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(userPool.attributes.time)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Update Time</Label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Select your new trip time and click &quot;Update My Time&quot; button below
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Route</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {userPool.attributes.journey}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <Badge variant={userPool.attributes.status === 'available' ? 'default' : 'secondary'}>
                      {userPool.attributes.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleFoundCab}
                disabled={updating || userPool.attributes.status !== 'available'}
              >
                Found a Cab Pool
              </Button>
              <Button 
                variant="secondary"
                onClick={handleUpdateTime}
                disabled={updating || !newTime || newTime === userPool.attributes.time}
              >
                {updating ? 'Updating...' : 'Update My Time'}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancelRequest}
                disabled={updating}
              >
                {updating ? 'Cancelling...' : 'Cancel My Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}