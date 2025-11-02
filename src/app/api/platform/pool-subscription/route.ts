import { NextRequest, NextResponse } from 'next/server'
import { strapiPost, strapiGet, strapiPut, strapiDelete } from '@/lib/apis/strapi'
import { getUserIdByEmail } from '@/lib/userid'
import { auth } from '@/auth'

// Valid service values from Strapi enum
const VALID_SERVICES = [
  "netflix",
  "prime", 
  "chatgpt",
  "chegg",
  "spotify",
  "grammarly",
  "duolingo",
  "others"
];

// Valid status values from Strapi enum
const VALID_STATUSES = [
  "open",
  "full",
  "canceled"
];

// GET /api/platform/pool-subscription - Fetch all available subscriptions with pagination and user's subscription
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

    // Get current date to filter future or recent subscriptions
    const today = new Date().toISOString().split('T')[0]

    try {
      // Fetch all open subscriptions with pagination
      const subscriptionsResponse = await strapiGet('/subscriptions', {
        filters: {
          status: 'open',
          end: {
            $gte: today
          }
        },
        populate: ['user'],
        pagination: {
          start,
          limit
        },
        sort: ['start:asc', 'service:asc']
      })

      console.log("Subscriptions response:", JSON.stringify(subscriptionsResponse, null, 2))

      // Fetch user's subscription separately (only show if status is 'open')
      const userSubscriptionResponse = await strapiGet('/subscriptions', {
        filters: {
          user: {
            id: {
              $eq: userId
            }
          },
          status: 'open',
          end: {
            $gte: today
          }
        },
        populate: ['user'],
        sort: ['start:asc'],
        pagination: {
          limit: 1
        }
      })

      console.log("User subscription response:", JSON.stringify(userSubscriptionResponse, null, 2))

      return NextResponse.json({
        success: true,
        subscriptions: subscriptionsResponse.data || [],
        userSubscription: userSubscriptionResponse.data?.[0] || null,
        pagination: subscriptionsResponse.meta?.pagination || {}
      })

    } catch (strapiError) {
      console.error("Strapi query failed, trying fallback:", strapiError)

      // Fallback: fetch all subscriptions and filter in code
      const response = await strapiGet('/subscriptions', {
        populate: ['user']
      })

      const allSubscriptions = response.data || []

      // Filter open subscriptions
      const openSubscriptions = allSubscriptions.filter((subscription: any) =>
        subscription.attributes?.status === 'open' &&
        subscription.attributes?.end >= today
      )

      // Find user's subscription (only open, future/current end date)
      const userSubscriptions = allSubscriptions.filter((subscription: any) =>
        subscription.attributes?.user?.data?.id === userId &&
        subscription.attributes?.status === 'open' &&
        subscription.attributes?.end >= today
      ).sort((a: any, b: any) => {
        return a.attributes.start.localeCompare(b.attributes.start)
      })
      const userSubscription = userSubscriptions[0] || null

      // Apply pagination
      const paginatedSubscriptions = openSubscriptions.slice(start, start + limit)

      return NextResponse.json({
        success: true,
        subscriptions: paginatedSubscriptions,
        userSubscription: userSubscription || null,
        pagination: {
          page,
          pageSize: limit,
          pageCount: Math.ceil(openSubscriptions.length / limit),
          total: openSubscriptions.length
        }
      })
    }

  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch subscriptions'
    }, { status: 500 })
  }
}

// POST /api/platform/pool-subscription - Create a new subscription pool
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/platform/pool-subscription called ===')
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
      service,
      numberPeople,
      start,
      end
    } = body

    // Server-side validation
    const requiredFields = {
      service,
      numberPeople,
      start,
      end
    }

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 })
      }
    }

    // Validate service enum
    if (!VALID_SERVICES.includes(service)) {
      return NextResponse.json({
        success: false,
        error: `Invalid service. Must be one of: ${VALID_SERVICES.join(', ')}`
      }, { status: 400 })
    }

    // Validate number of people
    const numPeople = parseInt(numberPeople)
    if (isNaN(numPeople) || numPeople < 1 || numPeople > 20) {
      return NextResponse.json({
        success: false,
        error: 'Number of people must be between 1 and 20'
      }, { status: 400 })
    }

    // Validate date formats (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      }, { status: 400 })
    }

    // Validate date logic
    const today = new Date().toISOString().split('T')[0]
    if (start < today) {
      return NextResponse.json({
        success: false,
        error: 'Start date cannot be in the past'
      }, { status: 400 })
    }

    if (end <= start) {
      return NextResponse.json({
        success: false,
        error: 'End date must be after start date'
      }, { status: 400 })
    }

    // Check if user already has an open subscription
    const existingSubscriptionResponse = await strapiGet('/subscriptions', {
      filters: {
        user: {
          id: {
            $eq: userId
          }
        },
        status: 'open',
        end: {
          $gte: today
        }
      },
      pagination: {
        limit: 1
      }
    })

    if (existingSubscriptionResponse.data && existingSubscriptionResponse.data.length > 0) {
      console.log('User already has an open subscription')
      return NextResponse.json({
        success: false,
        error: 'You already have an active subscription pool. Please cancel or complete it before creating a new one.'
      }, { status: 400 })
    }

    // Prepare data for Strapi
    const subscriptionData = {
      data: {
        service: service,
        numberPeople: numPeople,
        start: start,
        end: end,
        status: "open",
        user: userId // Use actual authenticated user ID
      }
    }

    console.log("Submitting subscription data:", subscriptionData)

    // Submit to Strapi
    const response = await strapiPost('/subscriptions', subscriptionData)

    console.log("Subscription created successfully:", JSON.stringify(response, null, 2))

    return NextResponse.json({
      success: true,
      data: response
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create subscription pool. Please try again.'
    }, { status: 500 })
  }
}

// PUT /api/platform/pool-subscription - Update a subscription (status)
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

    const { subscriptionId, status } = body

    if (!subscriptionId) {
      return NextResponse.json({
        success: false,
        error: 'Subscription ID is required'
      }, { status: 400 })
    }

    // Verify the subscription belongs to the user
    const subscriptionResponse = await strapiGet(`/subscriptions/${subscriptionId}`, {
      populate: ['user']
    })

    if (!subscriptionResponse.data || subscriptionResponse.data.attributes?.user?.data?.id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Subscription not found or access denied'
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      data: {}
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid status. Must be open, full, or canceled'
        }, { status: 400 })
      }
      updateData.data.status = status
    }

    console.log("Updating subscription with data:", updateData)

    // Update the subscription
    const response = await strapiPut(`/subscriptions/${subscriptionId}`, updateData)

    console.log("Subscription updated successfully:", response)

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update subscription. Please try again.'
    }, { status: 500 })
  }
}

// DELETE /api/platform/pool-subscription - Delete a subscription
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

    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json({
        success: false,
        error: 'Subscription ID is required'
      }, { status: 400 })
    }

    // Verify the subscription belongs to the user
    const subscriptionResponse = await strapiGet(`/subscriptions/${subscriptionId}`, {
      populate: ['user']
    })

    if (!subscriptionResponse.data || subscriptionResponse.data.attributes?.user?.data?.id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Subscription not found or access denied'
      }, { status: 404 })
    }

    console.log("Deleting subscription with ID:", subscriptionId)

    // Delete the subscription from Strapi
    const response = await strapiDelete(`/subscriptions/${subscriptionId}`)

    console.log("Subscription deleted successfully:", response)

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully'
    })

  } catch (error) {
    console.error("Error deleting subscription:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel subscription. Please try again.'
    }, { status: 500 })
  }
}