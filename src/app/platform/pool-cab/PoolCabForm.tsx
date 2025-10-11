"use client";

import * as React from "react"
import { useRouter } from "next/navigation"
import { Car, ChevronDownIcon, MapPin, Mail } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ButtonGroup } from "@/components/ui/button-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function PoolCabForm() {
  const router = useRouter()
  const { data: session } = useSession()

  // Helper function to get current IST date
  const getISTDate = () => {
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
    return new Date(utc + istOffset)
  }

  // Form state
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [selectedHour, setSelectedHour] = React.useState("12")
  const [selectedMinute, setSelectedMinute] = React.useState("00")
  const [selectedPeriod, setSelectedPeriod] = React.useState<"AM" | "PM">("PM")
  const [fromLocation, setFromLocation] = React.useState("")
  const [toLocation, setToLocation] = React.useState("")
  const [contactNumber, setContactNumber] = React.useState("")
  const [useEmail, setUseEmail] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true)

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)

  // Fetch user profile data on mount
  React.useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoadingProfile(true)
        const response = await fetch('/api/platform/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setContactNumber(result.data.phone_number || "")
            setUserEmail(result.data.email || session?.user?.email || "")
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setUserEmail(session?.user?.email || "")
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [session?.user?.email])

  // Location options
  const locationOptions = [
    { value: "Campus", label: "Campus" },
    { value: "New Delhi", label: "New Delhi" },
    { value: "Gurgaon", label: "Gurgaon" },
    { value: "Noida", label: "Noida" },
    { value: "Airport (T1)", label: "Airport (T1)" },
    { value: "Airport (T2)", label: "Airport (T2)" },
    { value: "Airport (T3)", label: "Airport (T3)" },
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
    if (!selectedDate || !fromLocation || !toLocation || !selectedHour || !selectedMinute) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate contact method
    if (!useEmail && !contactNumber) {
      toast.error("Please provide a contact number or select use email")
      return
    }

    setIsSubmitting(true)

    try {
      // Convert date to YYYY-MM-DD format in IST
      const istDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
      const formattedDate = istDate.toISOString().split('T')[0]

      // Prepare data for API call
      const poolData = {
        selectedDate: formattedDate,
        fromLocation,
        toLocation,
        selectedHour,
        selectedMinute,
        selectedPeriod,
        contactNumber: useEmail ? null : contactNumber,
        useEmailContact: useEmail
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
        {/* Date and Time - unified label with all inline controls */}
        <div className="flex flex-col gap-3">
          <Label htmlFor="date-picker" className="px-1 text-base font-medium">
            Date and Time <span className="text-destructive">*</span>
          </Label>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Date Selection */}
            <div className="flex-1 min-w-0">
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
                    fromDate={getISTDate()} // Allow today and future dates in IST
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection with ButtonGroup */}
            <div className="flex-1 min-w-0">
              <ButtonGroup className="w-full h-10">
                {/* Hour Selection */}
                <Select value={selectedHour} onValueChange={setSelectedHour}>
                  <SelectTrigger className="w-45 sm:w-60 border border-input shadow-sm">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Colon separator */}
                <div className="flex items-center justify-center px-2 text-sm font-medium text-muted-foreground">
                  :
                </div>

                {/* Minute Selection */}
                <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                  <SelectTrigger className="w-45 sm:w-60 border border-input rounded-lg shadow-sm">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: '00', label: '00' },
                      { value: '15', label: '15' },
                      { value: '30', label: '30' },
                      { value: '45', label: '45' }
                    ].map((min) => (
                      <SelectItem key={min.value} value={min.value}>
                        {min.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* AM/PM Toggle - smaller width */}
                <ToggleGroup
                  type="single"
                  value={selectedPeriod}
                  onValueChange={(value) => value && setSelectedPeriod(value as "AM" | "PM")}
                  className="w-30 border-1 shadow-none"
                >
                  <ToggleGroupItem
                    value="AM"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-none text-xs"
                  >
                    AM
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="PM"
                    className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-none text-xs"
                  >
                    PM
                  </ToggleGroupItem>
                </ToggleGroup>
              </ButtonGroup>
            </div>
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

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-email"
              checked={useEmail}
              onCheckedChange={(checked) => setUseEmail(checked as boolean)}
            />
            <Label
              htmlFor="use-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Use email for contact instead
            </Label>
          </div>

          {useEmail ? (
            <div className="flex flex-col gap-3">
              <Label className="px-1 text-base font-medium">
                Contact Email <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userEmail}</span>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Others will contact you via email
              </p>
            </div>
          ) : (
            <PhoneInput
              title="Contact Number"
              description="Provide a valid 10-digit mobile number"
              placeholder="9876543210"
              value={contactNumber}
              onChange={setContactNumber}
              isRequired={true}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full gap-2 text-lg py-6"
            disabled={
              isSubmitting ||
              isLoadingProfile ||
              !selectedDate ||
              !selectedHour ||
              !selectedMinute ||
              !fromLocation ||
              !toLocation ||
              (!useEmail && !contactNumber)
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