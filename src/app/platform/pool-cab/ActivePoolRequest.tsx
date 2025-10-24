"use client";

import * as React from "react"
import { useRouter } from "next/navigation"
import { Clock, MapPin, Calendar, Car } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface PoolData {
  id: string
  attributes: {
    From: string
    To: string
    time: string
    day: string
    status: string
    useEmailContact: boolean
    contactNumber: string | null
  }
}

interface ActivePoolRequestProps {
  userPool: PoolData
}

export default function ActivePoolRequest({ userPool }: ActivePoolRequestProps) {
  const router = useRouter()
  const [updating, setUpdating] = React.useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`
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
        router.refresh()
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

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Your Active Pool Request
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          You have an active pool request. View all available pools or manage your request below.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trip Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Date</Label>
            <div className="p-3 bg-muted rounded-md flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(userPool.attributes.day)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Time</Label>
            <div className="p-3 bg-muted rounded-md flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatTime(userPool.attributes.time)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Route</Label>
            <div className="p-3 bg-muted rounded-md flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userPool.attributes.From} → {userPool.attributes.To}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
          <div className="p-3 rounded-md inline-flex">
            <Badge variant={userPool.attributes.status === 'available' ? 'default' : 'secondary'} className={userPool.attributes.status === 'available' ? 'bg-green' : 'bg-red-500'}>  
              {userPool.attributes.status.charAt(0).toUpperCase() + userPool.attributes.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push('/platform/pool-cab/results')}
            className="flex-1 sm:flex-initial"
          >
            View All Pools
          </Button>
          <div className="flex-1"></div>
          <Button
            className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
            onClick={handleFoundCab}
            disabled={updating || userPool.attributes.status !== 'available'}
          >
            {updating ? 'Processing...' : 'Found a Cab'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelRequest}
            disabled={updating || userPool.attributes.status !== 'available'}
            className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 dark:hover:bg-primary-light"
          >
            {updating ? 'Cancelling...' : 'Cancel Request'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
