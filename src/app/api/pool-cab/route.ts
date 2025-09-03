import { NextRequest, NextResponse } from 'next/server'
import { strapiPost, strapiGet } from '@/apis/strapi'

// Helper function to validate phone number
function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone)
}

// Helper function to sanitize input
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// Helper function to map locations to Strapi journey enum values
function mapToJourneyEnum(from: string, to: string): string {
  const fromLower = sanitizeInput(from).toLowerCase()
  const toLower = sanitizeInput(to).toLowerCase()
  
  const journey = `${fromLower} to ${toLower}`
  
  const mappings: Record<string, string> = {
    "airport to campus": "airport to campus",
    "campus to airport": "campus to airport",
    "airport to jahangirpuri": "airport to jahangirpuri",
    "jahangirpuri to airport": "jahangirpuri to airport",
    "jahangirpuri to campus": "jahangirpuri to campus",
    "azadpur to campus": "azadpur to campus",
    "campus to jahangirpuri": "campus to jahangirpuri",
    "campus to azadpur": "campus to azadpur",
    "campus to new delhi": "campus to new delhi",
    "new delhi to campus": "new delhi to campus",
    "new delhi to jahangirpuri": "new delhi to jahangirpuri",
    "jahangirpuri to new delhi": "jahangirpuri to new delhi",
    "gurgaon to campus": "gurgaon to campus",
    "campus to gurgaon": "campus to gurgaon",
    "campus to chandigarh": "campus to chandigarh",
    "chandigarh to campus": "chandigarh to campus",
    "campus to jaipur": "campus to jaipur",
    "jaipur to campus": "jaipur to campus",
    "campus to ludhiana": "campus to ludhiana",
    "ludhiana to campus": "ludhiana to campus",
    "campus to noida": "campus to noida",
    "noida to campus": "noida to campus",
    "campus to ghaziabad": "campus to ghaziabad",
    "ghaziabad to campus": "ghaziabad to campus",
    "campus to nizamuddin": "campus to nizamuddin",
    "nizamuddin to campus": "nizamuddin to campus",
    "campus to agra": "campus to agra",
    "agra to campus": "agra to campus"
  }
  
  return mappings[journey] || journey
}

// Helper function to convert 12-hour time to 24-hour format
function convertTo24HourFormat(hour: string, minute: string, period: string): string {
  let hour24 = parseInt(sanitizeInput(hour))
  const sanitizedPeriod = sanitizeInput(period).toUpperCase()
  
  if (sanitizedPeriod === "AM" && hour24 === 12) {
    hour24 = 0
  } else if (sanitizedPeriod === "PM" && hour24 !== 12) {
    hour24 += 12
  }
  
  return `${hour24.toString().padStart(2, '0')}:${sanitizeInput(minute)}:00`
}

// GET /api/pools - Fetch pools
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build query parameters from URL search params
    const queryParams: any = {}
    
    // Add pagination
    if (searchParams.get('page')) {
      queryParams.pagination = { page: parseInt(searchParams.get('page')!) }
    }
    if (searchParams.get('pageSize')) {
      queryParams.pagination = { ...queryParams.pagination, pageSize: parseInt(searchParams.get('pageSize')!) }
    }
    
    // Add filters
    if (searchParams.get('journey')) {
      queryParams.filters = { journey: { $eq: searchParams.get('journey') } }
    }
    
    const response = await strapiGet('/pools', queryParams)
    
    return NextResponse.json({
      success: true,
      data: response
    }, { status: 200 })
    
  } catch (error) {
    console.error("Error fetching pools:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pools'
    }, { status: 500 })
  }
}

// POST /api/pools - Create a new pool
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract and validate required fields
    const {
      selectedDate,
      fromLocation,
      toLocation,
      selectedHour,
      selectedMinute,
      selectedPeriod,
      contactNumber
    } = body
    
    // Server-side validation
    const requiredFields = {
      selectedDate,
      fromLocation,
      toLocation,
      selectedHour,
      selectedMinute,
      selectedPeriod,
      contactNumber
    }
    
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === '') {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 })
      }
    }
    
    // Validate phone number
    if (!validatePhoneNumber(contactNumber)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit phone number'
      }, { status: 400 })
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(selectedDate)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format'
      }, { status: 400 })
    }
    
    // Validate time components
    const hourNum = parseInt(selectedHour)
    const minuteNum = parseInt(selectedMinute)
    if (hourNum < 1 || hourNum > 12 || ![0, 15, 30, 45].includes(minuteNum) || !['AM', 'PM'].includes(selectedPeriod)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid time format'
      }, { status: 400 })
    }
    
    // Convert time to 24-hour format for Strapi
    const time24 = convertTo24HourFormat(selectedHour, selectedMinute, selectedPeriod)
    
    // Map locations to journey enum
    const journey = mapToJourneyEnum(fromLocation, toLocation)
    
    // Prepare data for Strapi
    const poolData = {
      data: {
        journey: journey,
        time: time24,
        day: selectedDate,
        status: "available",
        pooler: 1 // Note: This should be set based on authenticated user
      }
    }
    
    console.log("Submitting pool data:", poolData)
    
    // Submit to Strapi
    const response = await strapiPost('/pools', poolData)
    
    console.log("Pool created successfully:", response)
    
    return NextResponse.json({
      success: true,
      data: response
    }, { status: 201 })
    
  } catch (error) {
    console.error("Error creating pool:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create pool. Please try again.'
    }, { status: 500 })
  }
}

// PUT /api/pools - Update a pool (if needed)
export async function PUT() {
  try {
    // Implementation for updating pools
    return NextResponse.json({
      success: false,
      error: 'PUT method not implemented yet'
    }, { status: 501 })
  } catch (error) {
    console.error("Error updating pool:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update pool'
    }, { status: 500 })
  }
}

// DELETE /api/pools - Delete a pool (if needed)
export async function DELETE() {
  try {
    // Implementation for deleting pools
    return NextResponse.json({
      success: false,
      error: 'DELETE method not implemented yet'
    }, { status: 501 })
  } catch (error) {
    console.error("Error deleting pool:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete pool'
    }, { status: 500 })
  }
}
