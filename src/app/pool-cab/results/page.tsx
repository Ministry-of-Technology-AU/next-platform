"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Car, Clock, MapPin, Phone, MessageCircle, Filter, Search, Users, Calendar } from "lucide-react"

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

// Sample data for existing cab pools
const samplePools = [
  {
    id: "1",
    name: "Soham Tulsyan",
    contact: "+916291579424",
    time: "03:28 AM",
    route: "Campus to New Delhi",
    day: "Jul 22",
    status: "Available",
    avatar: "https://github.com/sohamtulsyan.png"
  },
  {
    id: "2",
    name: "Priya Sharma",
    contact: "+919876543210",
    time: "08:15 AM",
    route: "Campus to Gurgaon",
    day: "Jul 22",
    status: "Available",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
  },
  {
    id: "3",
    name: "Rahul Kumar",
    contact: "+918765432109",
    time: "06:30 PM",
    route: "New Delhi to Campus",
    day: "Jul 23",
    status: "Full",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    id: "4",
    name: "Ananya Gupta",
    contact: "+917654321098",
    time: "02:45 PM",
    route: "Campus to Airport",
    day: "Jul 22",
    status: "Available",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
  }
]

export default function PoolCabResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get form data from URL params
  const userDate = searchParams.get('date')
  const userFrom = searchParams.get('from')
  const userTo = searchParams.get('to')
  const userTime = searchParams.get('time')
  const userContact = searchParams.get('contact')

  const [filteredPools, setFilteredPools] = React.useState(samplePools)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [dayFilter, setDayFilter] = React.useState("all")
  const [routeFilter, setRouteFilter] = React.useState("all")
  const [entriesPerPage, setEntriesPerPage] = React.useState("10")
  const [currentPage, setCurrentPage] = React.useState(1)

  // Format user's trip details
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
    return `${hour12}:${minutes} ${ampm}`
  }

  const userRoute = `${userFrom} to ${userTo}`

  // Filter pools based on search and filters
  React.useEffect(() => {
    let filtered = samplePools

    if (searchTerm) {
      filtered = filtered.filter(pool => 
        pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.contact.includes(searchTerm)
      )
    }

    if (dayFilter && dayFilter !== "all") {
      filtered = filtered.filter(pool => pool.day === dayFilter)
    }

    if (routeFilter && routeFilter !== "all") {
      filtered = filtered.filter(pool => pool.route === routeFilter)
    }

    setFilteredPools(filtered)
  }, [searchTerm, dayFilter, routeFilter])

  const handleWhatsAppContact = (contact: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, I found your cab pool request on the Platform. I'm interested in joining your trip.`)
    window.open(`https://wa.me/${contact.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  const totalPages = Math.ceil(filteredPools.length / parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * parseInt(entriesPerPage)
  const endIndex = startIndex + parseInt(entriesPerPage)
  const currentPools = filteredPools.slice(startIndex, endIndex)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Car className="h-8 w-8 text-primary" />
            Pool a Cab
          </h1>
        </div>
        <p className="text-muted-foreground">
          Click on the WhatsApp icon to message the person. Below is the list of all people using the service. 
          Please find a person closest to your arrival time and route, and reach out to them using their contact details. 
          Please make sure that they're available for pooling under the status bar before contacting them.
        </p>
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
                  <SelectItem value="Jul 22">Jul 22</SelectItem>
                  <SelectItem value="Jul 23">Jul 23</SelectItem>
                  <SelectItem value="Jul 24">Jul 24</SelectItem>
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
                  <SelectItem value="Campus to New Delhi">Campus to New Delhi</SelectItem>
                  <SelectItem value="Campus to Gurgaon">Campus to Gurgaon</SelectItem>
                  <SelectItem value="New Delhi to Campus">New Delhi to Campus</SelectItem>
                  <SelectItem value="Campus to Airport">Campus to Airport</SelectItem>
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
          {currentPools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cab pools found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {currentPools.map((pool) => (
                <div key={pool.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={pool.avatar} alt={pool.name} />
                      <AvatarFallback>{pool.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="font-medium">{pool.name}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {pool.contact}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {pool.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pool.route}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {pool.day}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={pool.status === "Available" ? "default" : "secondary"}>
                      {pool.status}
                    </Badge>
                    
                    {pool.status === "Available" && (
                      <Button
                        size="sm"
                        onClick={() => handleWhatsAppContact(pool.contact, pool.name)}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPools.length)} of {filteredPools.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                  {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

      {/* Trip Details Section */}
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
                  {userDate ? formatDate(userDate) : 'Not specified'}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                <div className="mt-1 p-3 bg-muted rounded-md flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {userTime ? formatTime(userTime) : 'Not specified'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  If you wish to change the time of your trip, please select your new time here and click 'Update My Time' button below
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Route</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  {userRoute}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Select defaultValue="Available">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Full">Full</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button className="bg-green-600 hover:bg-green-700">
              Found a Cab Pool
            </Button>
            <Button variant="secondary">
              Update My Time
            </Button>
            <Button variant="destructive">
              Cancel My Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}