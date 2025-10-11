import { NextRequest, NextResponse } from 'next/server'
import { strapiPost, strapiGet, strapiPut, strapiDelete } from '@/lib/apis/strapi'
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

// Valid journey values from Strapi enum
const VALID_JOURNEYS = [
  "airport to campus",
  "airport(T1) to campus",
  "airport(T2) to campus",
  "airport(T3) to campus",
  "campus to airport",
  "campus to airport(T1)",
  "campus to airport(T2)",
  "campus to airport(T3)",
  "airport to jahangirpuri",
  "jahangirpuri to airport",
  "airport to azadpur",
  "azadpur to airport",
  "jahangirpuri to campus",
  "azadpur to campus",
  "campus to jahangirpuri",
  "campus to azadpur",
  "campus to new delhi",
  "new delhi to campus",
  "new delhi to jahangirpuri",
  "jahangirpuri to new delhi",
  "gurgaon to campus",
  "campus to gurgaon",
  "campus to chandigarh",
  "chandigarh to campus",
  "campus to jaipur",
  "jaipur to campus",
  "campus to ludhiana",
  "ludhiana to campus",
  "campus to noida",
  "noida to campus",
  "campus to ghaziabad",
  "ghaziabad to campus",
  "campus to nizamuddin",
  "nizamuddin to campus",
  "campus to agra",
  "agra to campus"
];

// Helper function to map locations to Strapi journey enum values
function mapToJourneyEnum(from: string, to: string): string | null {
  const fromLower = sanitizeInput(from).toLowerCase()
  const toLower = sanitizeInput(to).toLowerCase()

  const journey = `${fromLower} to ${toLower}`

  const mappings: Record<string, string> = {
    "airport (t1) to campus": "airport(T1) to campus",
    "airport (t2) to campus": "airport(T2) to campus",
    "airport (t3) to campus": "airport(T3) to campus",
    "campus to airport (t1)": "campus to airport(T1)",
    "campus to airport (t2)": "campus to airport(T2)",
    "campus to airport (t3)": "campus to airport(T3)",
    "airport (t1) to jahangirpuri": "airport to jahangirpuri",
    "airport (t2) to jahangirpuri": "airport to jahangirpuri",
    "airport (t3) to jahangirpuri": "airport to jahangirpuri",
    "jahangirpuri to airport (t1)": "jahangirpuri to airport",
    "jahangirpuri to airport (t2)": "jahangirpuri to airport",
    "jahangirpuri to airport (t3)": "jahangirpuri to airport",
    "airport (t1) to azadpur": "airport to azadpur",
    "airport (t2) to azadpur": "airport to azadpur",
    "airport (t3) to azadpur": "airport to azadpur",
    "azadpur to airport (t1)": "azadpur to airport",
    "azadpur to airport (t2)": "azadpur to airport",
    "azadpur to airport (t3)": "azadpur to airport",
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

  const mapped = mappings[journey] || journey

  // Validate against allowed journeys
  if (!VALID_JOURNEYS.includes(mapped)) {
    return null
  }

  return mapped
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

// GET /api/pools - Fetch all available pools with pagination and user's pool
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const start = (page - 1) * limit

    const session = await auth()
    const userId = await getUserIdByEmail(session?.user?.email || '')
    console.log("User ID fetched for email:", session?.user?.email, "->", userId)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // Get current date to filter future or recent pools
    const today = new Date().toISOString().split('T')[0]

    try {
      // Fetch all available pools with pagination
      const poolsResponse = await strapiGet('/pools', {
        filters: {
          status: 'available',
          day: {
            $gte: today
          }
        },
        populate: ['pooler'],
        pagination: {
          start,
          limit
        },
        sort: ['day:asc', 'time:asc']
      })

      console.log("Pools response:", JSON.stringify(poolsResponse, null, 2))

      // Fetch user's pool separately (only show if status is 'available')
      const userPoolResponse = await strapiGet('/pools', {
        filters: {
          pooler: {
            id: {
              $eq: userId
            }
          },
          status: 'available',
          day: {
            $gte: today
          }
        },
        populate: ['pooler'],
        sort: ['day:asc', 'time:asc'],
        pagination: {
          limit: 1
        }
      })

      console.log("User pool response:", JSON.stringify(userPoolResponse, null, 2))

      return NextResponse.json({
        success: true,
        pools: poolsResponse.data || [],
        userPool: userPoolResponse.data?.[0] || null,
        pagination: poolsResponse.meta?.pagination || {}
      })

    } catch (strapiError) {
      console.error("Strapi query failed, trying fallback:", strapiError)

      // Fallback: fetch all pools and filter in code
      const response = await strapiGet('/pools', {
        populate: ['pooler']
      })

      const allPools = response.data || []

      // Filter available pools
      const availablePools = allPools.filter((pool: any) =>
        pool.attributes?.status === 'available' &&
        pool.attributes?.day >= today
      )

      // Find user's pool (only available, future/current date)
      const userPools = allPools.filter((pool: any) =>
        pool.attributes?.pooler?.data?.id === userId &&
        pool.attributes?.status === 'available' &&
        pool.attributes?.day >= today
      ).sort((a: any, b: any) => {
        const dateCompare = a.attributes.day.localeCompare(b.attributes.day)
        if (dateCompare !== 0) return dateCompare
        return a.attributes.time.localeCompare(b.attributes.time)
      })
      const userPool = userPools[0] || null

      // Apply pagination
      const paginatedPools = availablePools.slice(start, start + limit)

      return NextResponse.json({
        success: true,
        pools: paginatedPools,
        userPool: userPool || null,
        pagination: {
          page,
          pageSize: limit,
          pageCount: Math.ceil(availablePools.length / limit),
          total: availablePools.length
        }
      })
    }

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
    console.log('=== POST /api/platform/pool-cab called ===')
    const session = await auth()

    const userId = await getUserIdByEmail(session?.user?.email || '')
    if (!userId) {
      console.log('User not found for email:', session?.user?.email)
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    const body = await request.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))
    // Extract and validate required fields
    const {
      date,
      time,
      dateTime,
      fromLocation,
      toLocation,
      members,
      contactNumber,
      useEmailContact,
      email,
      // Legacy support for old format
      selectedDate,
      selectedHour,
      selectedMinute,
      selectedPeriod
    } = body

    // Server-side validation - handle both new and old formats
    const actualDate = date || selectedDate
    const actualTime = time
    const actualFromLocation = fromLocation
    const actualToLocation = toLocation

    const requiredFields = {
      date: actualDate,
      fromLocation: actualFromLocation,
      toLocation: actualToLocation,
      time: actualTime || (selectedHour && selectedMinute && selectedPeriod)
    }

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === '') {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 })
      }
    }

    // Validate phone number only if not using email contact
    if (!useEmailContact) {
      if (!contactNumber || !validatePhoneNumber(contactNumber)) {
        return NextResponse.json({
          success: false,
          error: 'Please enter a valid 10-digit phone number'
        }, { status: 400 })
      }
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(actualDate)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format'
      }, { status: 400 })
    }

    // Validate date is not in the past
    const today = new Date().toISOString().split('T')[0]
    if (actualDate < today) {
      return NextResponse.json({
        success: false,
        error: 'Cannot create pool request for a past date. Please select today or a future date.'
      }, { status: 400 })
    }

    // Handle time conversion for both formats
    let time24: string
    if (actualTime) {
      // New format: HH:MM (24-hour)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(actualTime)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid time format'
        }, { status: 400 })
      }
      time24 = `${actualTime}:00`
    } else {
      // Legacy format: hour, minute, period
      const hourNum = parseInt(selectedHour)
      const minuteNum = parseInt(selectedMinute)
      if (hourNum < 1 || hourNum > 12 || ![0, 15, 30, 45].includes(minuteNum) || !['AM', 'PM'].includes(selectedPeriod)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid time format. Please select a time with minutes ending in 00, 15, 30, or 45 (e.g., 12:00 PM, 12:15 PM, 12:30 PM, 12:45 PM).'
        }, { status: 400 })
      }
      time24 = convertTo24HourFormat(selectedHour, selectedMinute, selectedPeriod)
    }

    // Check if user already has an available pool
    const existingPoolResponse = await strapiGet('/pools', {
      filters: {
        pooler: {
          id: {
            $eq: userId
          }
        },
        status: 'available',
        day: {
          $gte: today
        }
      },
      pagination: {
        limit: 1
      }
    })

    if (existingPoolResponse.data && existingPoolResponse.data.length > 0) {
      console.log('User already has an available pool')
      return NextResponse.json({
        success: false,
        error: 'You already have an active pool request. Please cancel or complete it before creating a new one.'
      }, { status: 400 })
    }

    // Map locations to journey enum
    const journey = mapToJourneyEnum(actualFromLocation, actualToLocation)

    // Validate journey
    if (!journey) {
      console.log(`Invalid journey combination: ${actualFromLocation} to ${actualToLocation}`)
      return NextResponse.json({
        success: false,
        error: `Invalid journey combination: ${actualFromLocation} to ${actualToLocation}. Please select a valid route.`
      }, { status: 400 })
    }

    // Prepare data for Strapi
    const poolData = {
      data: {
        journey: journey,
        time: time24,
        day: actualDate,
        status: "available",
        useEmail: useEmailContact || false,
        pooler: userId // Use actual authenticated user ID
      }
    }

    console.log("Submitting pool data:", poolData)

    // Submit to Strapi
    const response = await strapiPost('/pools', poolData)

    console.log("Pool created successfully:", JSON.stringify(response, null, 2))

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

// PUT /api/pools - Update a pool (time or status)
export async function PUT(request: NextRequest) {
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
    console.log("Received update data:", JSON.stringify(body, null, 2))

    const { poolId, time, status } = body

    if (!poolId) {
      return NextResponse.json({
        success: false,
        error: 'Pool ID is required'
      }, { status: 400 })
    }

    // Verify the pool belongs to the user
    const poolResponse = await strapiGet(`/pools/${poolId}`, {
      populate: ['pooler']
    })

    if (!poolResponse.data || poolResponse.data.attributes?.pooler?.data?.id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Pool not found or access denied'
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      data: {}
    }

    if (time) {
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(time)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid time format. Use HH:MM format'
        }, { status: 400 })
      }
      updateData.data.time = `${time}:00`
    }

    if (status) {
      if (!['available', 'canceled', 'pooled'].includes(status)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid status. Must be available, canceled, or pooled'
        }, { status: 400 })
      }
      updateData.data.status = status
    }

    console.log("Updating pool with data:", updateData)

    // Update the pool
    const response = await strapiPut(`/pools/${poolId}`, updateData)

    console.log("Pool updated successfully:", response)

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error("Error updating pool:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update pool. Please try again.'
    }, { status: 500 })
  }
}

// DELETE /api/pools - Delete a pool
export async function DELETE(request: NextRequest) {
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
    console.log("Received delete data:", JSON.stringify(body, null, 2))

    const { poolId } = body

    if (!poolId) {
      return NextResponse.json({
        success: false,
        error: 'Pool ID is required'
      }, { status: 400 })
    }

    // Verify the pool belongs to the user
    const poolResponse = await strapiGet(`/pools/${poolId}`, {
      populate: ['pooler']
    })

    if (!poolResponse.data || poolResponse.data.attributes?.pooler?.data?.id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Pool not found or access denied'
      }, { status: 404 })
    }

    console.log("Deleting pool with ID:", poolId)

    // Delete the pool from Strapi
    const response = await strapiDelete(`/pools/${poolId}`)

    console.log("Pool deleted successfully:", response)

    return NextResponse.json({
      success: true,
      message: 'Pool cancelled successfully'
    })

  } catch (error) {
    console.error("Error deleting pool:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel pool. Please try again.'
    }, { status: 500 })
  }
}
