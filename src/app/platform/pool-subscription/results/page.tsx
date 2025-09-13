"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Users, Calendar, Phone, MessageCircle, Filter, Search, Hash } from "lucide-react"

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

// Sample data for existing subscription pools
const samplePools = [
  {
    id: "1",
    name: "Joshua Kyle Cousins",
    contact: "+910120391911",
    service: "Netflix",
    peopleRequired: 10,
    startDate: "Jan 06 2025",
    endDate: "Dec 31 2025",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
  },
  {
    id: "2",
    name: "SPANDNA SOMANI",
    contact: "+916032767032",
    service: "ChatGPT",
    peopleRequired: 5,
    startDate: "Aug 21 2024",
    endDate: "Aug 21 2027",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
  },
  {
    id: "3",
    name: "KHUSHI SETHI",
    contact: "+916283379724",
    service: "Grammarly",
    peopleRequired: 2,
    startDate: "Sep 04 2024",
    endDate: "Sep 04 2025",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
  },
  {
    id: "4",
    name: "Samadrita De",
    contact: "+916289104815",
    service: "Chegg",
    peopleRequired: 5,
    startDate: "Sep 01 2024",
    endDate: "May 31 2025",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  },
  {
    id: "5",
    name: "Soham Tulsyan",
    contact: "+916291579424",
    service: "ChatGPT",
    peopleRequired: 2,
    startDate: "Jul 22 2025",
    endDate: "Sep 30 2025",
    status: "Open",
    avatar: "https://github.com/sohamtulsyan.png"
  },
  {
    id: "6",
    name: "Shreerang Gaidhani",
    contact: "+916364317317",
    service: "Spotify",
    peopleRequired: 5,
    startDate: "Sep 01 2024",
    endDate: "May 01 2025",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    id: "7",
    name: "John Singh",
    contact: "+917003294064",
    service: "Grammarly",
    peopleRequired: 5,
    startDate: "Aug 01 2024",
    endDate: "Dec 31 2024",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  },
  {
    id: "8",
    name: "Uday Kapoor",
    contact: "+917011159270",
    service: "ChatGPT",
    peopleRequired: 3,
    startDate: "Aug 24 2024",
    endDate: "Dec 31 2024",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
  },
  {
    id: "9",
    name: "Mansi Bahl 251",
    contact: "+917290948309",
    service: "ChatGPT",
    peopleRequired: 10,
    startDate: "Jul 22 2024",
    endDate: "Mar 17 2025",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
  },
  {
    id: "10",
    name: "Yuvraj Verma",
    contact: "+917428725886",
    service: "ChatGPT",
    peopleRequired: 2,
    startDate: "Nov 01 2024",
    endDate: "Dec 01 2024",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150"
  }
]

export default function PoolSubscriptionResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get form data from URL params
  const userService = searchParams.get('service')
  const userPeople = searchParams.get('people')
  const userStartDate = searchParams.get('startDate')
  const userEndDate = searchParams.get('endDate')
  const userContact = searchParams.get('contact')

  const [filteredPools, setFilteredPools] = React.useState(samplePools)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [serviceFilter, setServiceFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [entriesPerPage, setEntriesPerPage] = React.useState("10")
  const [currentPage, setCurrentPage] = React.useState(1)

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Filter pools based on search and filters
  React.useEffect(() => {
    let filtered = samplePools

    if (searchTerm) {
      filtered = filtered.filter(pool => 
        pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.contact.includes(searchTerm)
      )
    }

    if (serviceFilter && serviceFilter !== "all") {
      filtered = filtered.filter(pool => pool.service === serviceFilter)
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(pool => pool.status === statusFilter)
    }

    setFilteredPools(filtered)
  }, [searchTerm, serviceFilter, statusFilter])

  const handleWhatsAppContact = (contact: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, I found your subscription pool request on the Platform. I'm interested in joining your ${userService || 'subscription'} pool.`)
    window.open(`https://wa.me/${contact.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  const totalPages = Math.ceil(filteredPools.length / parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * parseInt(entriesPerPage)
  const endIndex = startIndex + parseInt(entriesPerPage)
  const currentPools = filteredPools.slice(startIndex, endIndex)

  // Get unique services for filter
  const uniqueServices = [...new Set(samplePools.map(pool => pool.service))]

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
            <Users className="h-8 w-8 text-primary" />
            Pool a Subscription Together
          </h1>
        </div>
        <p className="text-muted-foreground">
          Click on the WhatsApp icon to message the person. Below is the list of all people using the service. 
          Please find a person who qualifies, and reach out to them using their contact details. 
          Please make sure that they&apos;re available for pooling under the status bar before contacting them.
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Your Subscription Pool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Service Filter */}
            <div className="space-y-2">
              <Label>Filter by Service</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {uniqueServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
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
                  placeholder="Search name, service, contact..."
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
            Available Subscription Pools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscription pools found matching your criteria.
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
                          <Users className="h-3 w-3" />
                          {pool.service}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {pool.peopleRequired} people
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {pool.startDate} - {pool.endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={pool.status === "Open" ? "default" : "secondary"}>
                      {pool.status}
                    </Badge>
                    
                    {pool.status === "Open" && (
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

      {/* Subscription Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Subscription Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            If you found a person to pool a subscription with, or wish to change your subscription details, 
            you can update your details below so that others can contact you for the right subscriptions.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  {userService || 'Not specified'}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Number of People</Label>
                <div className="mt-1 p-3 bg-muted rounded-md flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {userPeople ? `${userPeople} people` : 'Not specified'}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  {userStartDate && userEndDate 
                    ? `${formatDate(userStartDate)} - ${formatDate(userEndDate)}`
                    : 'Not specified'
                  }
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Select defaultValue="Open">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Full">Full</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6 justify-end">
            <Button className="bg-green-600 hover:bg-green-700">
              Found a Subscription Pool
            </Button>
            <Button variant="secondary">
              Update My Details
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