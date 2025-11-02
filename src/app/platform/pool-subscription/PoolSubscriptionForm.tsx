"use client";

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, ChevronDownIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FormContainer,
  SingleSelect,
} from "@/components/form"

export default function PoolSubscriptionForm() {
  const router = useRouter()

  // Helper function to get current IST date
  const getISTDate = () => {
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
    return new Date(utc + istOffset)
  }

  // Form state
  const [service, setService] = React.useState("")
  const [numberPeople, setNumberPeople] = React.useState("2")
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Date picker states
  const [startDatePickerOpen, setStartDatePickerOpen] = React.useState(false)
  const [endDatePickerOpen, setEndDatePickerOpen] = React.useState(false)

  // Service options
  const serviceOptions = [
    { value: "netflix", label: "Netflix" },
    { value: "prime", label: "Amazon Prime Video" },
    { value: "chatgpt", label: "ChatGPT Plus" },
    { value: "chegg", label: "Chegg Study" },
    { value: "spotify", label: "Spotify Premium" },
    { value: "grammarly", label: "Grammarly Premium" },
    { value: "duolingo", label: "Duolingo Plus" },
    { value: "others", label: "Others" },
  ]

  // Number of people options
  const peopleOptions = Array.from({ length: 20 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1} ${i === 0 ? 'person' : 'people'}`
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!service || !numberPeople || !startDate || !endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate date logic
    if (endDate <= startDate) {
      toast.error("End date must be after start date")
      return
    }

    setIsSubmitting(true)

    try {
      // Convert dates to YYYY-MM-DD format in IST
      const istStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
      const istEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
      const formattedStartDate = istStartDate.toISOString().split('T')[0]
      const formattedEndDate = istEndDate.toISOString().split('T')[0]

      // Prepare data for API call
      const subscriptionData = {
        service,
        numberPeople: parseInt(numberPeople),
        start: formattedStartDate,
        end: formattedEndDate
      }

      console.log("Form data to be submitted:", subscriptionData)

      // Call API endpoint
      const response = await fetch('/api/platform/pool-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData)
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.error || "Failed to create subscription pool")
      } else {
        toast.success("Subscription pool created successfully!")
        // Success - navigate to results page
        router.push('/platform/pool-subscription/results')
      }

    } catch (error) {
      console.error("Error creating subscription pool:", error)
      toast.error("Failed to create subscription pool. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-7xl ml-auto mr-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Users className="h-5 w-5" />
          Subscription Pool Details
        </CardTitle>
      </CardHeader>
      <FormContainer onSubmit={handleSubmit}>
        {/* Service Selection */}
        <SingleSelect
          title="Service"
          placeholder="Select a subscription service"
          items={serviceOptions}
          value={service}
          onChange={setService}
          isRequired={true}
        />

        {/* Number of People */}
        <SingleSelect
          title="Number of People"
          placeholder="How many people in total?"
          items={peopleOptions}
          value={numberPeople}
          onChange={setNumberPeople}
          isRequired={true}
        />

        {/* Start and End Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="start-date-picker" className="px-1 text-base font-medium">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="start-date-picker"
                  className="w-full justify-between font-normal"
                >
                  {startDate ? startDate.toLocaleDateString() : "Select start date"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setStartDate(date)
                    setStartDatePickerOpen(false)
                  }}
                  fromDate={getISTDate()} // Allow today and future dates in IST
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="end-date-picker" className="px-1 text-base font-medium">
              End Date <span className="text-destructive">*</span>
            </Label>
            <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="end-date-picker"
                  className="w-full justify-between font-normal"
                >
                  {endDate ? endDate.toLocaleDateString() : "Select end date"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setEndDate(date)
                    setEndDatePickerOpen(false)
                  }}
                  fromDate={startDate || getISTDate()} // Allow dates after start date
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full gap-2 text-lg py-6"
            disabled={
              isSubmitting ||
              !service ||
              !numberPeople ||
              !startDate ||
              !endDate
            }
          >
            <Users className="h-5 w-5" />
            {isSubmitting ? "Creating Pool..." : "Create Subscription Pool!"}
          </Button>
        </div>
      </FormContainer>
    </Card>
  )
}