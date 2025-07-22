"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, Calendar, Phone, Hash } from "lucide-react"

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

// Sample services for subscription pooling
const services = [
  "Netflix",
  "Amazon Prime",
  "Disney+ Hotstar",
  "Spotify",
  "YouTube Premium",
  "Adobe Creative Suite",
  "Microsoft Office 365",
  "Canva Pro",
  "Grammarly Premium",
  "ChatGPT Plus",
  "Notion Pro",
  "Figma Professional"
]

export default function PoolSubscription() {
  const router = useRouter()
  const [selectedService, setSelectedService] = React.useState("")
  const [numberOfPeople, setNumberOfPeople] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [contactNumber, setContactNumber] = React.useState("")
  const [phoneError, setPhoneError] = React.useState("")

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  const handlePhoneChange = (value: string) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '')
    
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10)
    
    setContactNumber(limitedValue)
    
    // Validate and set error
    if (limitedValue.length > 0 && !validatePhoneNumber(limitedValue)) {
      if (limitedValue.length < 10) {
        setPhoneError("Phone number must be exactly 10 digits")
      } else {
        setPhoneError("Invalid phone number format")
      }
    } else {
      setPhoneError("")
    }
  }

  const handleNumberOfPeopleChange = (value: string) => {
    // Only allow numbers and limit to reasonable range
    const numericValue = value.replace(/[^0-9]/g, '')
    const limitedValue = numericValue.slice(0, 2) // Max 99 people
    setNumberOfPeople(limitedValue)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !numberOfPeople || !startDate || !endDate || !contactNumber) {
      alert("Please fill in all required fields")
      return
    }

    if (!validatePhoneNumber(contactNumber)) {
      alert("Please enter a valid 10-digit phone number")
      return
    }

    if (parseInt(numberOfPeople) < 1) {
      alert("Number of people must be at least 1")
      return
    }

    // Check if end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      alert("End date must be after start date")
      return
    }

    // Navigate to results page with form data
    const searchParams = new URLSearchParams({
      service: selectedService,
      people: numberOfPeople,
      startDate: startDate,
      endDate: endDate,
      contact: contactNumber,
    })
    
    router.push(`/pool-subscription/results?${searchParams.toString()}`)
  }

  return (
    <div className="flex justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Pool a Subscription
          </h1>
          <p className="text-muted-foreground text-center">
            Share subscription costs with others and save money on your favorite services. 
            Fill in your subscription details below to find potential partners or create a new pool request.
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Select service to pool <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Number of People */}
              <div className="space-y-2">
                <Label htmlFor="people" className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Number of people you want to share with <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="people"
                  type="text"
                  placeholder="Enter number of people"
                  value={numberOfPeople}
                  onChange={(e) => handleNumberOfPeopleChange(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the total number of people you want to share the subscription with (including yourself)
                </p>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Subscription start date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Subscription end date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Enter contact number <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 bg-muted border border-input rounded-md text-sm font-mono text-muted-foreground">
                    +91
                  </div>
                  <div className="flex-1">
                    <Input
                      id="contact"
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={contactNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`font-mono ${phoneError ? 'border-destructive' : ''}`}
                      maxLength={10}
                    />
                    {phoneError && (
                      <p className="text-xs text-destructive mt-1">{phoneError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full gap-2 text-lg py-6"
                  disabled={
                    !selectedService || 
                    !numberOfPeople || 
                    !startDate || 
                    !endDate || 
                    !contactNumber || 
                    !!phoneError ||
                    !validatePhoneNumber(contactNumber) ||
                    parseInt(numberOfPeople) < 1
                  }
                >
                  <Users className="h-5 w-5" />
                  Pool a Subscription!
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}