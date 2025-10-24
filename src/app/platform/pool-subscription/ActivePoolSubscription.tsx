"use client";

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, Calendar, UserCheck, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

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

interface ActivePoolSubscriptionProps {
  userSubscription: SubscriptionData
}

export default function ActivePoolSubscription({ userSubscription }: ActivePoolSubscriptionProps) {
  const router = useRouter()
  const [updating, setUpdating] = React.useState(false)

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
        router.refresh()
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

  const handleCancelSubscription = async () => {
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

  const handleViewAllPools = () => {
    router.push('/platform/pool-subscription/results')
  }

  if (!userSubscription) return null

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Active Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Active Subscription Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Service</Label>
                <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium">
                    {getServiceDisplayName(userSubscription.attributes.service)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
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

            <div className="space-y-3">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Start Date</Label>
                <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    {formatDate(userSubscription.attributes.start)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
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

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleViewAllPools}
              className="w-full sm:w-auto gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              View All Pools
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              onClick={handleMarkAsFull}
              disabled={updating || userSubscription.attributes.status !== 'open'}
            >
              {updating ? 'Processing...' : 'Mark as Full'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={updating || userSubscription.attributes.status !== 'open'}
              className="w-full sm:w-auto bg-primary hover:bg-primary/80 dark:hover:bg-primary-light"
            >
              {updating ? 'Cancelling...' : 'Cancel Pool'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              • Share your subscription pool with others to find people interested in joining
            </p>
            <p>
              • Once you have enough people, mark the pool as &quot;Full&quot; to stop accepting new members
            </p>
            <p>
              • You can cancel the pool anytime if you no longer need it
            </p>
            <p>
              • Check out other available pools by clicking &quot;View All Pools&quot; above
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}