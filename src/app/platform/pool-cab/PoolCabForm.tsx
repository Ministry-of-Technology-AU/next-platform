"use client";

import * as React from "react"
import { useRouter } from "next/navigation"
import { Car, ChevronDownIcon, MapPin } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FormContainer,
  SingleSelect,
  PhoneInput,
} from "@/components/form"

export default function PoolCabForm() {
  const router = useRouter()
  
  // Form state
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = React.useState("")
  const [fromLocation, setFromLocation] = React.useState("")
  const [toLocation, setToLocation] = React.useState("")
  const [contactNumber, setContactNumber] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)

  // Location options
  const locationOptions = [
    { value: "Campus", label: "Campus" },
    { value: "New Delhi", label: "New Delhi" },
    { value: "Gurgaon", label: "Gurgaon" },
    { value: "Noida", label: "Noida" },
    { value: "Airport", label: "Airport" },
    { value: "Jahangirpuri", label: "Jahangirpuri" },
    { value: "Azadpur", label: "Azadpur" },
    { value: "Chandigarh", label: "Chandigarh" },
    { value: "Jaipur", label: "Jaipur" },
    { value: "Ludhiana", label: "Ludhiana" },
    { value: "Ghaziabad", label: "Ghaziabad" },
    { value: "Nizamuddin", label: "Nizamuddin" },
    { value: "Agra", label: "Agra" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!selectedDate || !fromLocation || !toLocation || !selectedTime || !contactNumber) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(selectedTime)) {
      toast.error("Please enter a valid time")
      return
    }

    setIsSubmitting(true)

    try {
      // Convert date to YYYY-MM-DD format
      const formattedDate = selectedDate.toISOString().split('T')[0]
      
      // Parse time to get hour, minute, and period
      const [hourStr, minuteStr] = selectedTime.split(':')
      const hour24 = parseInt(hourStr)
      const minute = parseInt(minuteStr)
      
      // Convert to 12-hour format for API compatibility
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const period = hour24 >= 12 ? 'PM' : 'AM'

      // Prepare data for API call
      const poolData = {
        selectedDate: formattedDate,
        fromLocation,
        toLocation,
        selectedHour: hour12.toString(),
        selectedMinute: minuteStr,
        selectedPeriod: period,
        contactNumber
      }

      console.log("Form data to be submitted:", poolData)

      // Call API endpoint
      const response = await fetch('/api/platform/pool-cab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poolData)
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.error || "Failed to create pool")
      } else {
        toast.success("Pool created successfully!")
        // Success - navigate to results page
        router.push('/platform/pool-cab/results')
      }

    } catch (error) {
      console.error("Error creating pool:", error)
      toast.error("Failed to create pool. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-7xl ml-auto mr-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5" />
          Trip Details
        </CardTitle>
      </CardHeader>
      <FormContainer onSubmit={handleSubmit}>
        {/* Date and Time Selection - Inline Responsive */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date Selection */}
          <div className="flex-1 flex flex-col gap-3">
            <Label htmlFor="date-picker" className="px-1 text-base font-medium">
              Date <span className="text-destructive">*</span>
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker"
                  className="w-full justify-between font-normal"
                >
                  {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setDatePickerOpen(false)
                  }}
                  fromDate={new Date()} // Only allow future dates
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Time Selection */}
          <div className="flex-1 flex flex-col gap-3">
            <Label htmlFor="time-picker" className="px-1 text-base font-medium">
              Time <span className="text-destructive">*</span>
            </Label>
            <Input
              type="time"
              id="time-picker"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>

        {/* From and To Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SingleSelect
            title="From"
            placeholder="Select departure location"
            items={locationOptions}
            value={fromLocation}
            onChange={setFromLocation}
            isRequired={true}
          />
          
          <SingleSelect
            title="To"
            placeholder="Select destination"
            items={locationOptions}
            value={toLocation}
            onChange={setToLocation}
            isRequired={true}
          />
        </div>

        {/* Contact Number */}
        <PhoneInput
          title="Contact Number"
          description="Provide a valid 10-digit mobile number"
          placeholder="9876543210"
          value={contactNumber}
          onChange={setContactNumber}
          isRequired={true}
        />

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full gap-2 text-lg py-6"
            disabled={
              isSubmitting ||
              !selectedDate ||
              !selectedTime ||
              !fromLocation ||
              !toLocation ||
              !contactNumber
            }
          >
            <Car className="h-5 w-5" />
            {isSubmitting ? "Creating Pool..." : "Pool a Cab!"}
          </Button>
        </div>
      </FormContainer>
    </Card>
  )
}