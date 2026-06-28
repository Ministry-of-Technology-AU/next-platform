"use client";

import * as React from "react"
import { useRouter } from "next/navigation"
import { MapPin, Home, DollarSign } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import { AccommodationData } from "./types"

interface ActiveAccommodationRequestProps {
  userAccommodation: AccommodationData
}

export default function ActiveAccommodationRequest({ userAccommodation }: ActiveAccommodationRequestProps) {
  const router = useRouter()
  const [updating, setUpdating] = React.useState(false)

  const handleCancelRequest = async () => {
    if (!userAccommodation) return

    try {
      setUpdating(true)
      const response = await fetch('/api/platform/ashokan-around', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userAccommodation.id, status: 'canceled' })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel request')
      }
      
      toast.success('Accommodation request canceled successfully!')
      router.refresh()
      setUpdating(false)

    } catch (error) {
      console.error('Error cancelling request:', error)
      toast.error('Failed to cancel request')
      setUpdating(false)
    }
  }

  const handleFoundAccommodation = async () => {
    if (!userAccommodation) return

    try {
      setUpdating(true)
      const response = await fetch('/api/platform/ashokan-around', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userAccommodation.id, status: 'completed' })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success('Marked as accommodation found!')
      router.refresh()
      setUpdating(false)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
      setUpdating(false)
    }
  }

  return (
    <Card className="max-w-5xl mx-auto border shadow-sm">
      <CardHeader className="pb-3 text-center border-b mb-4">
        <CardTitle className="flex justify-center items-center gap-2 text-xl sm:text-2xl font-bold font-serif px-2 text-primary dark:text-orange-900">
          <Home className="h-6 w-6" />
          Your Active Accommodation Request
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          You have an active accommodation request. View connections or manage your request below.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 px-4 pb-8 max-w-4xl mx-auto w-full">
        {/* Request Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-muted-foreground">City Destination</Label>
            <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">{userAccommodation.attributes.cityDestination}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Housing Type</Label>
            <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">{userAccommodation.attributes.housingTypeWanted}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Budget</Label>
            <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">{userAccommodation.attributes.budget}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</Label>
            <div className="mt-1 p-2.5 sm:p-3 bg-muted rounded-md">
              <Badge variant={userAccommodation.attributes.status === 'available' ? 'default' : 'secondary'} className={`text-xs ${userAccommodation.attributes.status === 'available' ? 'bg-green-600' : 'bg-red-500'}`}>  
                {userAccommodation.attributes.status.charAt(0).toUpperCase() + userAccommodation.attributes.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="border-t my-6" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/platform/ashokan-around/results')}
            className="w-full sm:w-auto"
          >
            View All Connections
          </Button>
          <div className="flex-1"></div>
          <Button
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            onClick={handleFoundAccommodation}
            disabled={updating || userAccommodation.attributes.status !== 'available'}
          >
            {updating ? 'Processing...' : 'Found Accommodation'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelRequest}
            disabled={updating || userAccommodation.attributes.status !== 'available'}
            className="w-full sm:w-auto bg-red-900 hover:bg-red-950 text-white"
          >
            {updating ? 'Cancelling...' : 'Cancel Request'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
