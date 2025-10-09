import { NextRequest, NextResponse } from 'next/server'
import { strapiPost, strapiGet } from '@/lib/apis/strapi'
import { getUserIdByEmail } from '@/lib/userid'
import { auth } from '@/auth'

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

// GET /api/pools - Fetch pools of current user in past 5 days and also check if the status of that pool is available then return true else false
export async function GET() {
  try {
    const session = await auth()
    const userId = await getUserIdByEmail(session?.user?.email || '')    
    console.log("User ID fetched for email:", session?.user?.email, "->", userId)
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    const getPastDate = (days: number): string => {
      const date = new Date()
      date.setDate(date.getDate() - days)
      return date.toISOString().split('T')[0]
    }
    
    const pastDate = getPastDate(5)
    console.log("Fetching pools for userId:", userId, "since date:", pastDate)
    
    // Try with populate to get related data and check field names
    const response = await strapiGet('/pools', {
      filters: {
        pooler: {
          id: {
            $eq: userId
          }
        },
        day: {
          $gte: pastDate
        }
      },
      populate: ['pooler']
    })
    
    console.log("Strapi response:", JSON.stringify(response, null, 2))
    const pools = response.data || []

    // Check if any pool is available
    const hasAvailablePool = pools.some((pool: any) => {
      console.log("Pool status check:", pool.attributes?.status)
      return pool.attributes?.status === "available"
    })

    console.log("Available pools found:", hasAvailablePool, "Total pools:", pools.length)

    if (hasAvailablePool) {
      return NextResponse.json({
        success: true,        
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'No available pools found'
      })
    }
  } catch (error) {
    console.error("Error fetching pools:", error)
    
    // If the relational filter fails, try a simpler approach
    if (error instanceof Error && error.message.includes('500')) {
      try {
        console.log("Trying fallback query without relational filter...")
        const session = await auth()
        const userId = await getUserIdByEmail(session?.user?.email || '')
        
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'User not found'
          }, { status: 404 })
        }
        
        const response = await strapiGet('/pools', {
          populate: ['pooler']
        })
        
        const pools = (response.data || []).filter((pool: any) => {
          return pool.attributes?.pooler?.data?.id === userId
        })
        
        const hasAvailablePool = pools.some((pool: any) => pool.attributes?.status === "available")
        
        if (hasAvailablePool) {
          return NextResponse.json({ success: true })
        } else {
          return NextResponse.json({
            success: false,
            error: 'No available pools found'
          })
        }
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch pools'
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pools'
    }, { status: 500 })
  }
}

// POST /api/pools - Create a new pool
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    const userId = await getUserIdByEmail(session?.user?.email || '')
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

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
        pooler: userId // Use actual authenticated user ID
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
