"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  Users,
  Calendar,
  UserCheck,
  Mail,
} from "lucide-react"
import PageTitle from "@/components/page-title"

interface UserData {
  id: number
  attributes: {
    username: string
    email: string
    phone: string | null
  }
}

interface SubscriptionData {
  id: string
  attributes: {
    service: string
    numberPeople: number
    start: string
    end: string
    status: string
    createdAt: string
    updatedAt: string
    user: {
      data: UserData
    }
  }
}

export default function PoolSubscriptionResults() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionData[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = React.useState<SubscriptionData[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [serviceFilter, setServiceFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [entriesPerPage, setEntriesPerPage] = React.useState("10")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [userSubscription, setUserSubscription] = React.useState<SubscriptionData | null>(null)
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

  const getServiceDisplayName = (service: string) => {
    const serviceMap: Record<string, string> = {
      "netflix": "Netflix",
      "prime": "Amazon Prime Video",
      "chatgpt": "ChatGPT Plus",
      "chegg": "Chegg Study",
      "spotify": "Spotify Premium",
      "grammarly": "Grammarly Premium",
      "duolingo": "Duolingo Plus",
      "others": "Others"
    }
    return serviceMap[service] || service
  }

  const getInitials = (username?: string) => {
    if (!username) return '??'
    const parts = username.split(/[_\s]+/)
    if (parts.length === 1) {
      return username.substring(0, 2).toUpperCase()
    }
    return parts.slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-600'
      case 'full':
        return 'bg-blue-600'
      case 'canceled':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  // Fetch subscriptions from API
  const fetchSubscriptions = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/platform/pool-subscription?page=${currentPage}&limit=${entriesPerPage}`, {
        method: 'GET',
      })
      const data = await response.json()

      if (data.success) {
        setSubscriptions(data.subscriptions || [])
        if (data.userSubscription) {
          setUserSubscription(data.userSubscription)
        }
      } else {
        toast.error(data.error || 'Failed to fetch subscription pools')
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to fetch subscription pools')
    } finally {
      setLoading(false)
    }
  }, [currentPage, entriesPerPage])

  // Filter subscriptions based on search and filters
  React.useEffect(() => {
    let filtered = subscriptions.filter(subscription => subscription.attributes.status === 'open')

    if (searchTerm) {
      filtered = filtered.filter(subscription =>
        getServiceDisplayName(subscription.attributes.service).toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.attributes.user.data.attributes.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (serviceFilter && serviceFilter !== "all") {
      filtered = filtered.filter(subscription => subscription.attributes.service === serviceFilter)
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(subscription => subscription.attributes.status === statusFilter)
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, searchTerm, serviceFilter, statusFilter])

  // Get unique services for filters
  const uniqueServices = React.useMemo(() => {
    const services = [...new Set(subscriptions.map(subscription => subscription.attributes.service))]
    return services.sort()
  }, [subscriptions])

  // Fetch subscriptions on component mount and when page changes
  React.useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  React.useEffect(() => {
    setCurrentPage(parseInt(page))
  }, [page])

  const handleEmailContact = (email: string, subscription: SubscriptionData) => {
    const subject = encodeURIComponent('Subscription Pool Interest - Platform')
    const body = encodeURIComponent(
      `Hi,\n\n` +
      `I found your subscription pool on the Platform by Techmin, and I'm interested in joining.\n\n` +
      `Details:\n` +
      `Service: ${getServiceDisplayName(subscription.attributes.service)}\n` +
      `People Needed: ${subscription.attributes.numberPeople}\n` +
      `Start Date: ${formatDate(subscription.attributes.start)}\n` +
      `End Date: ${formatDate(subscription.attributes.end)}\n\n` +
      `Please let me know if you're still looking for people to share the subscription.\n\n` +
      `Thanks!`
    )
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  const handleCancelRequest = async () => {
    if (!userSubscription) return

    try {
      setUpdating(true)
      const response = await fetch('/api/platform/pool-subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: userSubscription.id,
          status: 'canceled'
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Subscription pool canceled successfully!')
        router.push('/platform/pool-subscription')
      } else {
        toast.error(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkAsFull = async () => {
    if (!userSubscription) return

    try {
      setUpdating(true)
      const response = await fetch('/api/platform/pool-subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: userSubscription.id,
          status: 'full'
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Subscription pool marked as full!')
        router.push('/platform/pool-subscription')
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

  const totalPages = Math.ceil(filteredSubscriptions.length / parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * parseInt(entriesPerPage)
  const endIndex = startIndex + parseInt(entriesPerPage)
  const currentSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

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
                text="Subscription Pool Results"
                icon={Users}
                subheading="Find available subscription pools and manage your requests. Contact other users to share subscription costs and save money."
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptions}
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
              Find Your Subscription Pool
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Service Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Filter by Service</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {uniqueServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {getServiceDisplayName(service)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
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
                  placeholder="Search service or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Subscription Pools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Subscription Pools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading subscription pools...</p>
            </div>
          ) : currentSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscription pools found matching your criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {currentSubscriptions.map((subscription) => (
                <div key={subscription.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarFallback>
                        {getInitials(subscription.attributes.user.data.attributes.username)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h4 className="font-medium text-sm sm:text-base truncate">
                          {getServiceDisplayName(subscription.attributes.service)}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          by {subscription.attributes.user.data.attributes.username}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          <span>{subscription.attributes.numberPeople} people needed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(subscription.attributes.start)} - {formatDate(subscription.attributes.end)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 sm:flex-shrink-0">
                    <Badge 
                      variant="default" 
                      className={`text-xs ${getStatusColor(subscription.attributes.status)}`}
                    >
                      {subscription.attributes.status.charAt(0).toUpperCase() + subscription.attributes.status.slice(1)}
                    </Badge>

                    <Button
                      size="sm"
                      onClick={() => handleEmailContact(subscription.attributes.user.data.attributes.email, subscription)}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm"
                      disabled={subscription.attributes.status !== 'open'}
                    >
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Contact</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSubscriptions.length)} of {filteredSubscriptions.length} entries
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

      {/* User Subscription Details Section - Only show if user has a subscription */}
      {userSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Your Subscription Pool</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Below are your current subscription pool details. You can mark it as full when you&apos;ve found enough people, or cancel if you no longer need it.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Service</Label>
                  <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {getServiceDisplayName(userSubscription.attributes.service)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">People Needed</Label>
                  <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                    <UserCheck className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {userSubscription.attributes.numberPeople} people
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Start Date</Label>
                  <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {formatDate(userSubscription.attributes.start)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">End Date</Label>
                  <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {formatDate(userSubscription.attributes.end)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</Label>
              <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md">
                <Badge 
                  variant="default" 
                  className={`text-xs ${getStatusColor(userSubscription.attributes.status)}`}
                >
                  {userSubscription.attributes.status.charAt(0).toUpperCase() + userSubscription.attributes.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 sm:justify-end">
              <Button
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                onClick={handleMarkAsFull}
                disabled={updating || userSubscription.attributes.status !== 'open'}
              >
                {updating ? 'Processing...' : 'Mark as Full'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelRequest}
                disabled={updating || userSubscription.attributes.status !== 'open'}
                className="w-full sm:w-auto bg-primary hover:bg-primary/80 dark:hover:bg-primary-light"
              >
                {updating ? 'Cancelling...' : 'Cancel Pool'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}