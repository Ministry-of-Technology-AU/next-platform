"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Car, Clock, MapPin, Phone, Calendar } from "lucide-react"

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

// Sample data for routes
const routes = [
  "Campus to New Delhi",
  "Campus to Gurgaon",
  "Campus to Noida",
  "Campus to Airport",
  "New Delhi to Campus",
  "Gurgaon to Campus",
  "Noida to Campus",
  "Airport to Campus",
]

// Generate dates for the next 30 days
const generateDates = () => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push({
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    })
  }
  return dates
}

// Generate time slots
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour < 12 ? 'AM' : 'PM'
      const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
      slots.push({ value: time24, label: time12 })
    }
  }
  return slots
}

export default function PoolCab() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = React.useState("")
  const [fromLocation, setFromLocation] = React.useState("")
  const [toLocation, setToLocation] = React.useState("")
  const [selectedTime, setSelectedTime] = React.useState("")
  const [contactNumber, setContactNumber] = React.useState("")

  const dates = generateDates()
  const timeSlots = generateTimeSlots()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !fromLocation || !toLocation || !selectedTime || !contactNumber) {
      alert("Please fill in all required fields")
      return
    }

    // Navigate to results page with form data
    const searchParams = new URLSearchParams({
      date: selectedDate,
      from: fromLocation,
      to: toLocation,
      time: selectedTime,
      contact: contactNumber,
    })
    
    router.push(`/pool-cab/results?${searchParams.toString()}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Car className="h-8 w-8 text-primary" />
          Pool a Cab
        </h1>
        <p className="text-muted-foreground">
          Find others traveling on the same route and share a cab to save money and reduce environmental impact. 
          Fill in your travel details below to find potential cab partners or create a new pool request.
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Trip Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select date to pool on <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger id="date">
                  <SelectValue placeholder="Choose your travel date" />
                </SelectTrigger>
                <SelectContent>
                  {dates.map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Location */}
            <div className="space-y-2">
              <Label htmlFor="from" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                From <span className="text-destructive">*</span>
              </Label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger id="from">
                  <SelectValue placeholder="Select departure location" />
                </SelectTrigger>
                <SelectContent>
                  {routes.filter(route => !route.includes(" to ")).map((location) => (
                    <SelectItem key={location} value={location.split(" to ")[0]}>
                      {location.split(" to ")[0]}
                    </SelectItem>
                  ))}
                  <SelectItem value="Campus">Campus</SelectItem>
                  <SelectItem value="New Delhi">New Delhi</SelectItem>
                  <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                  <SelectItem value="Noida">Noida</SelectItem>
                  <SelectItem value="Airport">Airport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <Label htmlFor="to" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                To <span className="text-destructive">*</span>
              </Label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger id="to">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Campus">Campus</SelectItem>
                  <SelectItem value="New Delhi">New Delhi</SelectItem>
                  <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                  <SelectItem value="Noida">Noida</SelectItem>
                  <SelectItem value="Airport">Airport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Select time to pool at <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Choose departure time" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Enter contact number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="font-mono"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full gap-2 text-lg py-6"
                disabled={!selectedDate || !fromLocation || !toLocation || !selectedTime || !contactNumber}
              >
                <Car className="h-5 w-5" />
                Pool a Cab!
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}